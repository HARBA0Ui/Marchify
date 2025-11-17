// services/notification.service.js
import db from "../db/prisma.js";

// Notification Templates
const NOTIFICATION_TEMPLATES = {
  ORDER_PLACED: {
    title: "Commande confirmée",
    message: (orderNumber) =>
      `Votre commande #${orderNumber} a été enregistrée avec succès.`,
    priority: "HIGH",
  },
  ORDER_CONFIRMED: {
    title: "Commande acceptée",
    message: (orderNumber) =>
      `Le vendeur a accepté votre commande #${orderNumber}.`,
    priority: "HIGH",
  },
  ORDER_PROCESSING: {
    title: "Commande en préparation",
    message: (orderNumber) =>
      `Votre commande #${orderNumber} est en cours de préparation.`,
    priority: "MEDIUM",
  },
  ORDER_READY: {
    title: "Commande prête",
    message: (orderNumber) =>
      `Votre commande #${orderNumber} est prête pour la livraison.`,
    priority: "HIGH",
  },
  ORDER_SHIPPED: {
    title: "Commande expédiée",
    message: (orderNumber) =>
      `Votre commande #${orderNumber} a été expédiée et est en route.`,
    priority: "HIGH",
  },
  ORDER_DELIVERED: {
    title: "Commande livrée",
    message: (orderNumber) =>
      `Votre commande #${orderNumber} a été livrée avec succès.`,
    priority: "HIGH",
  },
  ORDER_CANCELLED: {
    title: "Commande annulée",
    message: (orderNumber) => `Votre commande #${orderNumber} a été annulée.`,
    priority: "URGENT",
  },
  ORDER_RETURNED: {
    title: "Commande retournée",
    message: (orderNumber) => `Votre commande #${orderNumber} a été retournée.`,
    priority: "HIGH",
  },
  REVIEW_RECEIVED: {
    title: "Nouvel avis reçu",
    message: (itemName) => `Vous avez reçu un nouvel avis sur "${itemName}".`,
    priority: "MEDIUM",
  },
  PRODUCT_LOW_STOCK: {
    title: "Stock faible",
    message: (productName, quantity) =>
      `Le stock de "${productName}" est faible (${quantity} restants).`,
    priority: "MEDIUM",
  },
  PRODUCT_OUT_OF_STOCK: {
    title: "Rupture de stock",
    message: (productName) => `"${productName}" est en rupture de stock.`,
    priority: "URGENT",
  },
  NEW_PRODUCT_ADDED: {
    title: "Nouveau produit disponible",
    message: (productName, boutiqueName) =>
      `"${productName}" est maintenant disponible chez ${boutiqueName}.`,
    priority: "LOW",
  },
  DELIVERY_ASSIGNED: {
    title: "Livraison assignée",
    message: (orderNumber) =>
      `Une nouvelle livraison vous a été assignée - Commande #${orderNumber}.`,
    priority: "HIGH",
  },
  DELIVERY_PICKED_UP: {
    title: "Colis récupéré",
    message: (orderNumber) =>
      `Le livreur a récupéré votre commande #${orderNumber}.`,
    priority: "MEDIUM",
  },
  DELIVERY_FAILED: {
    title: "Échec de livraison",
    message: (orderNumber) =>
      `La livraison de votre commande #${orderNumber} a échoué.`,
    priority: "URGENT",
  },
  PROMO_ALERT: {
    title: "Promotion spéciale",
    message: (details) => details,
    priority: "LOW",
  },
  SYSTEM_ANNOUNCEMENT: {
    title: "Annonce système",
    message: (details) => details,
    priority: "MEDIUM",
  },
};

/**
 * Create a notification
 */
export async function createNotification({
  userId,
  type,
  data = {},
  commandeId = null,
  actionUrl = null,
  metadata = null,
}) {
  const template = NOTIFICATION_TEMPLATES[type];
  if (!template) {
    throw new Error(`Unknown notification type: ${type}`);
  }

  const message =
    typeof template.message === "function"
      ? template.message(...Object.values(data))
      : template.message;

  const notification = await db.notification.create({
    data: {
      userId,
      type,
      title: template.title,
      message,
      priority: template.priority,
      commandeId,
      actionUrl,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
    },
  });

  console.log(`📬 Notification created for user ${userId}: ${type}`);
  return notification;
}

/**
 * Create notifications for order status changes
 */
export async function notifyOrderStatusChange(commande, newStatus) {
  const typeMap = {
    PENDING: "ORDER_PLACED",
    PROCESSING: "ORDER_PROCESSING",
    READY: "ORDER_READY",
    SHIPPED: "ORDER_SHIPPED",
    DELIVERED: "ORDER_DELIVERED",
    CANCELLED: "ORDER_CANCELLED",
    RETURNED: "ORDER_RETURNED",
  };

  const notifType = typeMap[newStatus];
  if (!notifType) return null;

  // Notify client
  const orderNumber = commande.id.slice(-8).toUpperCase();
  await createNotification({
    userId: commande.clientId,
    type: notifType,
    data: { orderNumber },
    commandeId: commande.id,
    actionUrl: `/orders/${commande.id}`,
    metadata: {
      orderTotal: commande.totalCommande,
      status: newStatus,
    },
  });

  // If shipped, also notify vendeur
  if (newStatus === "SHIPPED" && commande.boutiqueId) {
    const boutique = await db.boutique.findUnique({
      where: { id: commande.boutiqueId },
      include: { vendeur: true },
    });

    if (boutique?.vendeur?.userId) {
      await createNotification({
        userId: boutique.vendeur.userId,
        type: "ORDER_SHIPPED",
        data: { orderNumber },
        commandeId: commande.id,
        actionUrl: `/vendor/orders/${commande.id}`,
      });
    }
  }
}

/**
 * Notify about low stock
 */
export async function notifyLowStock(produit) {
  if (!produit.boutiqueId) return;

  const boutique = await db.boutique.findUnique({
    where: { id: produit.boutiqueId },
    include: { vendeur: true },
  });

  if (!boutique?.vendeur?.userId) return;

  const type =
    produit.quantite === 0 ? "PRODUCT_OUT_OF_STOCK" : "PRODUCT_LOW_STOCK";

  await createNotification({
    userId: boutique.vendeur.userId,
    type,
    data: { productName: produit.nom, quantity: produit.quantite },
    actionUrl: `/vendor/products/${produit.id}`,
    metadata: {
      productId: produit.id,
      currentStock: produit.quantite,
    },
  });
}

/**
 * Notify about new review
 */
export async function notifyNewReview(review) {
  let userId = null;
  let itemName = "";

  if (review.boutiqueId) {
    const boutique = await db.boutique.findUnique({
      where: { id: review.boutiqueId },
      include: { vendeur: true },
    });
    userId = boutique?.vendeur?.userId;
    itemName = boutique?.nom || "votre boutique";
  } else if (review.produitId) {
    const produit = await db.produit.findUnique({
      where: { id: review.produitId },
      include: { boutique: { include: { vendeur: true } } },
    });
    userId = produit?.boutique?.vendeur?.userId;
    itemName = produit?.nom || "votre produit";
  }

  if (!userId) return;

  await createNotification({
    userId,
    type: "REVIEW_RECEIVED",
    data: { itemName },
    actionUrl: `/vendor/reviews`,
    metadata: {
      reviewId: review.id,
      rating: review.rating,
    },
  });
}

/**
 * Notify livreur about assigned delivery
 */
export async function notifyDeliveryAssigned(bonDeLivraison, commande) {
  const livreur = await db.livreur.findUnique({
    where: { id: bonDeLivraison.livreurId },
  });

  if (!livreur?.userId) return;

  const orderNumber = commande.id.slice(-8).toUpperCase();

  await createNotification({
    userId: livreur.userId,
    type: "DELIVERY_ASSIGNED",
    data: { orderNumber },
    commandeId: commande.id,
    actionUrl: `/delivery/${bonDeLivraison.id}`,
    metadata: {
      deliveryId: bonDeLivraison.id,
      destination: commande.adresseLivraison,
    },
  });
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  userId,
  { limit = 20, unreadOnly = false } = {}
) {
  const where = { userId };
  if (unreadOnly) {
    where.read = false;
  }

  const notifications = await db.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      commande: {
        select: {
          id: true,
          status: true,
          totalCommande: true,
        },
      },
    },
  });

  return notifications;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId, userId) {
  return await db.notification.updateMany({
    where: { id: notificationId, userId },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId) {
  return await db.notification.updateMany({
    where: { userId, read: false },
    data: {
      read: true,
      readAt: new Date(),
    },
  });
}

/**
 * Get unread count
 */
export async function getUnreadCount(userId) {
  return await db.notification.count({
    where: { userId, read: false },
  });
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId, userId) {
  return await db.notification.deleteMany({
    where: { id: notificationId, userId },
  });
}
