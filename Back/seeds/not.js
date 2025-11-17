import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedNotifications() {
  console.log("🔔 Seeding notifications...");

  const notifications = [
    // ============================================
    // ADMIN NOTIFICATIONS (691259fb5e08abebfcab33f6)
    // ============================================
    {
      userId: "691259fb5e08abebfcab33f6",
      type: "SYSTEM_ANNOUNCEMENT",
      priority: "MEDIUM",
      title: "Bienvenue sur la plateforme",
      message:
        "Système de gestion e-commerce initialisé avec succès. Tous les modules sont opérationnels.",
      read: true,
      readAt: new Date("2025-11-15T09:00:00Z"),
      actionUrl: "/admin/dashboard",
      metadata: { module: "system", status: "operational" },
    },
    {
      userId: "691259fb5e08abebfcab33f6",
      type: "PRODUCT_LOW_STOCK",
      priority: "HIGH",
      title: "Alerte stock critique",
      message:
        "8 produits ont un stock inférieur au seuil minimal dans différentes boutiques.",
      read: false,
      actionUrl: "/admin/inventory",
      metadata: { productsCount: 8, criticalCount: 3 },
    },
    {
      userId: "691259fb5e08abebfcab33f6",
      type: "SYSTEM_ANNOUNCEMENT",
      priority: "LOW",
      title: "Rapport mensuel disponible",
      message:
        "Le rapport de performance du mois de novembre est prêt à être consulté.",
      read: false,
      actionUrl: "/admin/reports/monthly",
      metadata: { month: "novembre", year: 2025 },
    },

    // ============================================
    // CLIENT1 NOTIFICATIONS (691259fb5e08abebfcab33f7)
    // ============================================
    {
      userId: "691259fb5e08abebfcab33f7",
      type: "ORDER_PLACED",
      priority: "MEDIUM",
      title: "Commande créée avec succès",
      message:
        "Votre commande a été créée et est en attente de confirmation du vendeur.",
      read: true,
      readAt: new Date("2025-11-16T08:30:00Z"),
      actionUrl: "/orders/CMD001",
      metadata: { orderId: "CMD001", amount: 125.5, items: 8 },
    },
    {
      userId: "691259fb5e08abebfcab33f7",
      type: "ORDER_PROCESSING",
      priority: "MEDIUM",
      title: "Commande en préparation",
      message:
        "Votre commande est actuellement en cours de préparation par le vendeur.",
      read: false,
      actionUrl: "/orders/CMD001",
      metadata: { orderId: "CMD001", shopName: "Supermarché Mongi" },
    },
    {
      userId: "691259fb5e08abebfcab33f7",
      type: "ORDER_READY",
      priority: "HIGH",
      title: "Commande prête",
      message:
        "Votre commande est prête et attend le ramassage par le livreur.",
      read: false,
      actionUrl: "/orders/CMD001",
      metadata: { orderId: "CMD001", readyAt: "2025-11-16T11:45:00Z" },
    },

    // ============================================
    // CLIENT2 NOTIFICATIONS (691259fb5e08abebfcab33f8)
    // ============================================
    {
      userId: "691259fb5e08abebfcab33f8",
      type: "ORDER_DELIVERED",
      priority: "HIGH",
      title: "Commande livrée avec succès",
      message:
        "Votre commande a été livrée. Merci de votre confiance! N'oubliez pas de laisser un avis.",
      read: false,
      actionUrl: "/orders/CMD002",
      metadata: {
        orderId: "CMD002",
        deliveredAt: "2025-11-16T14:30:00Z",
        driverName: "Ali",
      },
    },
    {
      userId: "691259fb5e08abebfcab33f8",
      type: "PROMO_ALERT",
      priority: "MEDIUM",
      title: "Nouveaux produits disponibles",
      message:
        "Découvrez notre nouvelle sélection de fruits et légumes frais de saison!",
      read: false,
      actionUrl: "/products?category=fruits-legumes",
      metadata: { category: "Fruits & Légumes", newProductsCount: 12 },
    },
    {
      userId: "691259fb5e08abebfcab33f8",
      type: "REVIEW_RECEIVED",
      priority: "LOW",
      title: "Merci pour votre avis",
      message:
        'Votre avis sur "Lait Vitalait 1L" a été publié. Merci pour votre contribution!',
      read: true,
      readAt: new Date("2025-11-15T16:20:00Z"),
      actionUrl: "/products/PROD123",
      metadata: { productName: "Lait Vitalait 1L", rating: 5 },
    },

    // ============================================
    // CLIENT3 NOTIFICATIONS (691259fc5e08abebfcab33f9)
    // ============================================
    {
      userId: "691259fc5e08abebfcab33f9",
      type: "ORDER_CONFIRMED",
      priority: "MEDIUM",
      title: "Commande confirmée",
      message: "Le vendeur a confirmé votre commande d'un montant de 89.90 DT.",
      read: true,
      readAt: new Date("2025-11-16T10:15:00Z"),
      actionUrl: "/orders/CMD003",
      metadata: {
        orderId: "CMD003",
        amount: 89.9,
        confirmAt: "2025-11-16T10:00:00Z",
      },
    },
    {
      userId: "691259fc5e08abebfcab33f9",
      type: "ORDER_SHIPPED",
      priority: "HIGH",
      title: "Commande en cours de livraison",
      message:
        "Votre commande a quitté l'entrepôt. Livraison estimée dans 45 minutes.",
      read: false,
      actionUrl: "/orders/CMD003/track",
      metadata: {
        orderId: "CMD003",
        eta: "45min",
        driverPhone: "+216 23 300001",
      },
    },

    // ============================================
    // CLIENT4 NOTIFICATIONS (691259fc5e08abebfcab33fa)
    // ============================================
    {
      userId: "691259fc5e08abebfcab33fa",
      type: "ORDER_CANCELLED",
      priority: "HIGH",
      title: "Commande annulée",
      message:
        "Votre commande a été annulée comme demandé. Le remboursement sera traité sous 3-5 jours ouvrables.",
      read: false,
      actionUrl: "/orders/CMD004",
      metadata: {
        orderId: "CMD004",
        reason: "customer_request",
        refundAmount: 56.3,
      },
    },
    {
      userId: "691259fc5e08abebfcab33fa",
      type: "PROMO_ALERT",
      priority: "MEDIUM",
      title: "🎉 Promotion weekend",
      message:
        "Profitez de -20% sur tous les produits laitiers ce weekend! Code: LAIT20",
      read: false,
      actionUrl: "/promotions",
      metadata: {
        promoCode: "LAIT20",
        discount: 20,
        validUntil: "2025-11-18T23:59:59Z",
      },
    },

    // ============================================
    // CLIENT5 NOTIFICATIONS (691259fc5e08abebfcab33fb)
    // ============================================
    {
      userId: "691259fc5e08abebfcab33fb",
      type: "ORDER_SHIPPED",
      priority: "HIGH",
      title: "Expédition en cours",
      message:
        "Votre commande est en route. Suivez votre livraison en temps réel.",
      read: false,
      actionUrl: "/orders/CMD005/track",
      metadata: {
        orderId: "CMD005",
        estimatedDelivery: "2025-11-16T18:00:00Z",
        trackingActive: true,
      },
    },
    {
      userId: "691259fc5e08abebfcab33fb",
      type: "SYSTEM_ANNOUNCEMENT",
      priority: "LOW",
      title: "Mise à jour application",
      message:
        "Une nouvelle version de l'application est disponible avec des améliorations de performance.",
      read: true,
      readAt: new Date("2025-11-15T12:00:00Z"),
      actionUrl: "/settings/updates",
      metadata: { version: "2.1.0", features: ["Performance", "UI améliorée"] },
    },

    // ============================================
    // VENDEUR1 NOTIFICATIONS (691259fc5e08abebfcab33fc)
    // ============================================
    {
      userId: "691259fc5e08abebfcab33fc",
      type: "ORDER_PLACED",
      priority: "HIGH",
      title: "Nouvelle commande reçue",
      message:
        "Une nouvelle commande de 8 articles a été reçue pour votre boutique.",
      read: false,
      actionUrl: "/vendor/orders/CMD006",
      metadata: {
        orderId: "CMD006",
        items: 8,
        total: 145.8,
        shopId: "SHOP001",
      },
    },
    {
      userId: "691259fc5e08abebfcab33fc",
      type: "ORDER_PLACED",
      priority: "HIGH",
      title: "Nouvelle commande #CMD007",
      message: "Commande de 12 articles à préparer rapidement.",
      read: false,
      actionUrl: "/vendor/orders/CMD007",
      metadata: { orderId: "CMD007", items: 12, priority: "standard" },
    },
    {
      userId: "691259fc5e08abebfcab33fc",
      type: "PRODUCT_LOW_STOCK",
      priority: "URGENT",
      title: "Stock critique: Lait Vitalait 1L",
      message:
        'Le stock de "Lait Vitalait 1L" est très faible (5 unités restantes). Réapprovisionnement recommandé.',
      read: false,
      actionUrl: "/vendor/products/PROD123",
      metadata: {
        productId: "PROD123",
        productName: "Lait Vitalait 1L",
        stock: 5,
        threshold: 10,
      },
    },
    {
      userId: "691259fc5e08abebfcab33fc",
      type: "DELIVERY_PICKED_UP",
      priority: "MEDIUM",
      title: "Ramassage effectué",
      message: "Le livreur a récupéré 3 commandes de votre boutique.",
      read: true,
      readAt: new Date("2025-11-16T11:00:00Z"),
      actionUrl: "/vendor/deliveries",
      metadata: { deliveryId: "DEL001", ordersCount: 3, driverName: "Ali" },
    },
    {
      userId: "691259fc5e08abebfcab33fc",
      type: "REVIEW_RECEIVED",
      priority: "MEDIUM",
      title: "Nouvel avis sur votre boutique",
      message:
        'Un client a laissé un avis 5⭐ sur votre boutique: "Service excellent et produits frais!"',
      read: false,
      actionUrl: "/vendor/reviews",
      metadata: { rating: 5, reviewType: "boutique", customerName: "Client2" },
    },

    // ============================================
    // VENDEUR2 NOTIFICATIONS (691259fc5e08abebfcab33fe)
    // ============================================
    {
      userId: "691259fc5e08abebfcab33fe",
      type: "PRODUCT_OUT_OF_STOCK",
      priority: "URGENT",
      title: "Rupture de stock: Pain Complet",
      message:
        'Le produit "Pain Complet" est en rupture de stock. Veuillez réapprovisionner rapidement.',
      read: false,
      actionUrl: "/vendor/products/PROD456",
      metadata: {
        productId: "PROD456",
        productName: "Pain Complet",
        lastStock: 0,
      },
    },
    {
      userId: "691259fc5e08abebfcab33fe",
      type: "ORDER_PLACED",
      priority: "HIGH",
      title: "Commande modifiée par client",
      message:
        "Le client a modifié la commande #CMD008. Veuillez vérifier les nouveaux détails.",
      read: false,
      actionUrl: "/vendor/orders/CMD008",
      metadata: {
        orderId: "CMD008",
        changes: ["quantity_updated", "item_removed"],
        newTotal: 78.5,
      },
    },
    {
      userId: "691259fc5e08abebfcab33fe",
      type: "SYSTEM_ANNOUNCEMENT",
      priority: "LOW",
      title: "Nouvelle fonctionnalité disponible",
      message:
        "Vous pouvez maintenant gérer vos promotions directement depuis le tableau de bord vendeur.",
      read: true,
      readAt: new Date("2025-11-15T14:30:00Z"),
      actionUrl: "/vendor/promotions",
      metadata: { feature: "promotions_management", tutorial: true },
    },

    // ============================================
    // VENDEUR3 NOTIFICATIONS (691259fd5e08abebfcab3400)
    // ============================================
    {
      userId: "691259fd5e08abebfcab3400",
      type: "ORDER_READY",
      priority: "HIGH",
      title: "Commandes prêtes pour ramassage",
      message:
        "4 commandes sont prêtes et en attente de ramassage par le livreur.",
      read: false,
      actionUrl: "/vendor/orders?status=ready",
      metadata: {
        readyOrders: ["CMD009", "CMD010", "CMD011", "CMD012"],
        totalValue: 345.6,
      },
    },
    {
      userId: "691259fd5e08abebfcab3400",
      type: "PRODUCT_LOW_STOCK",
      priority: "HIGH",
      title: "Réapprovisionnement urgent",
      message:
        "3 produits populaires nécessitent un réapprovisionnement urgent.",
      read: false,
      actionUrl: "/vendor/inventory",
      metadata: {
        criticalProducts: 3,
        productNames: ["Yaourt Nature", "Fromage Blanc", "Beurre"],
      },
    },
    {
      userId: "691259fd5e08abebfcab3400",
      type: "REVIEW_RECEIVED",
      priority: "LOW",
      title: "Avis produit reçu",
      message: 'Nouvel avis sur "Huile d\'Olive Extra Vierge": 4⭐',
      read: true,
      readAt: new Date("2025-11-16T09:45:00Z"),
      actionUrl: "/vendor/products/PROD789/reviews",
      metadata: {
        productName: "Huile d'Olive Extra Vierge",
        rating: 4,
        reviewId: "REV001",
      },
    },

    // ============================================
    // LIVREUR1 NOTIFICATIONS (691259fd5e08abebfcab3402)
    // ============================================
    {
      userId: "691259fd5e08abebfcab3402",
      type: "DELIVERY_ASSIGNED",
      priority: "HIGH",
      title: "Nouvelle livraison assignée",
      message:
        'Livraison de 2 commandes assignée. Ramassage à "Supermarché Mongi".',
      read: false,
      actionUrl: "/driver/deliveries/DEL002",
      metadata: {
        deliveryId: "DEL002",
        shopName: "Supermarché Mongi",
        ordersCount: 2,
        estimatedEarnings: 12.0,
      },
    },
    {
      userId: "691259fd5e08abebfcab3402",
      type: "DELIVERY_PICKED_UP",
      priority: "MEDIUM",
      title: "Ramassage confirmé",
      message:
        "Ramassage effectué avec succès. Direction: Rue de la Liberté, Tunis.",
      read: false,
      actionUrl: "/driver/deliveries/DEL002/navigate",
      metadata: {
        deliveryId: "DEL002",
        destination: "Rue de la Liberté, Tunis",
        distance: "3.5km",
      },
    },
    {
      userId: "691259fd5e08abebfcab3402",
      type: "DELIVERY_ASSIGNED",
      priority: "MEDIUM",
      title: "Livraison complétée",
      message:
        "Livraison #DEL001 terminée avec succès. Gain: 8.50 DT • Note client: 5⭐",
      read: true,
      readAt: new Date("2025-11-16T13:20:00Z"),
      actionUrl: "/driver/history/DEL001",
      metadata: { deliveryId: "DEL001", earnings: 8.5, rating: 5, tip: 1.5 },
    },

    // ============================================
    // LIVREUR2 NOTIFICATIONS (691259fd5e08abebfcab3404)
    // ============================================
    {
      userId: "691259fd5e08abebfcab3404",
      type: "DELIVERY_ASSIGNED",
      priority: "URGENT",
      title: "Livraison prioritaire assignée",
      message:
        "Livraison urgente! Client attend à La Marsa. Ramassage immédiat requis.",
      read: false,
      actionUrl: "/driver/deliveries/DEL003",
      metadata: {
        deliveryId: "DEL003",
        priority: "urgent",
        location: "La Marsa",
        bonus: 5.0,
      },
    },
    {
      userId: "691259fd5e08abebfcab3404",
      type: "SYSTEM_ANNOUNCEMENT",
      priority: "MEDIUM",
      title: "Bonus objectif journalier",
      message:
        "Bonus de 15 DT disponible! Complétez 10 livraisons aujourd'hui. Progression: 8/10",
      read: false,
      actionUrl: "/driver/bonuses",
      metadata: {
        bonusAmount: 15,
        current: 8,
        target: 10,
        deadline: "2025-11-16T23:59:59Z",
      },
    },
    {
      userId: "691259fd5e08abebfcab3404",
      type: "DELIVERY_ASSIGNED",
      priority: "LOW",
      title: "Excellent travail!",
      message:
        "Livraison #DEL002 complétée. Le client vous a laissé un pourboire de 2.00 DT et une note 5⭐.",
      read: true,
      readAt: new Date("2025-11-16T12:10:00Z"),
      actionUrl: "/driver/history/DEL002",
      metadata: {
        deliveryId: "DEL002",
        rating: 5,
        tip: 2.0,
        customerFeedback: "Très rapide!",
      },
    },

    // ============================================
    // LIVREUR3 NOTIFICATIONS (691259fe5e08abebfcab3406)
    // ============================================
    {
      userId: "691259fe5e08abebfcab3406",
      type: "DELIVERY_ASSIGNED",
      priority: "HIGH",
      title: "Tournée assignée - 3 livraisons",
      message:
        "3 commandes à livrer dans la zone Ariana. Ramassage prévu dans 15 minutes.",
      read: false,
      actionUrl: "/driver/deliveries/DEL004",
      metadata: {
        deliveryId: "DEL004",
        ordersCount: 3,
        zone: "Ariana",
        routeOptimized: true,
      },
    },
    {
      userId: "691259fe5e08abebfcab3406",
      type: "SYSTEM_ANNOUNCEMENT",
      priority: "MEDIUM",
      title: "Mise à jour application requise",
      message:
        "Nouvelle version 2.1.0 disponible avec navigation GPS améliorée et chat client intégré.",
      read: false,
      actionUrl: "/driver/settings/update",
      metadata: {
        version: "2.1.0",
        features: ["GPS amélioré", "Chat client", "Mode nuit"],
        required: false,
      },
    },
    {
      userId: "691259fe5e08abebfcab3406",
      type: "DELIVERY_FAILED",
      priority: "HIGH",
      title: "Échec de livraison",
      message:
        "Échec de livraison #DEL003 - Client absent. Veuillez contacter le support.",
      read: false,
      actionUrl: "/driver/deliveries/DEL003/report",
      metadata: {
        deliveryId: "DEL003",
        reason: "customer_unavailable",
        nextAction: "return_to_shop",
      },
    },

    // ============================================
    // ALI (CLIENT) NOTIFICATIONS (69125c47534311c380dc6f54)
    // ============================================
    {
      userId: "69125c47534311c380dc6f54",
      type: "ORDER_PLACED",
      priority: "MEDIUM",
      title: "Bienvenue chez nous!",
      message:
        "Merci pour votre première commande! Utilisez le code WELCOME10 pour -10% sur votre prochaine commande.",
      read: false,
      actionUrl: "/orders",
      metadata: { isFirstOrder: true, promoCode: "WELCOME10", discount: 10 },
    },
    {
      userId: "69125c47534311c380dc6f54",
      type: "ORDER_SHIPPED",
      priority: "HIGH",
      title: "En route vers vous",
      message: "Votre commande arrive! Livraison estimée dans 30 minutes.",
      read: false,
      actionUrl: "/orders/track",
      metadata: {
        eta: 30,
        driverName: "Ali",
        driverPhone: "+216 23 300001",
        realTimeTracking: true,
      },
    },

    // ============================================
    // SAMI (VENDEUR) NOTIFICATIONS (69125c47534311c380dc6f55)
    // ============================================
    {
      userId: "69125c47534311c380dc6f55",
      type: "ORDER_PLACED",
      priority: "HIGH",
      title: "Première commande du jour",
      message: "Commande matinale reçue! #CMD013 - 15 articles à préparer.",
      read: false,
      actionUrl: "/vendor/orders/CMD013",
      metadata: {
        orderId: "CMD013",
        timeOfDay: "morning",
        items: 15,
        total: 178.9,
      },
    },
    {
      userId: "69125c47534311c380dc6f55",
      type: "PRODUCT_LOW_STOCK",
      priority: "MEDIUM",
      title: "Suggestion réapprovisionnement",
      message:
        "Analyse des ventes: 7 produits nécessitent un réapprovisionnement basé sur la demande de la semaine.",
      read: false,
      actionUrl: "/vendor/analytics/restock",
      metadata: {
        productsCount: 7,
        recommendation: "weekly_trend",
        predictedDemand: "high",
      },
    },

    // ============================================
    // RAMI (LIVREUR) NOTIFICATIONS (69125c47534311c380dc6f56)
    // ============================================
    {
      userId: "69125c47534311c380dc6f56",
      type: "DELIVERY_ASSIGNED",
      priority: "HIGH",
      title: "Tournée matinale - 5 livraisons",
      message:
        "5 livraisons assignées pour votre tournée. Itinéraire optimisé disponible.",
      read: false,
      actionUrl: "/driver/deliveries/DEL005",
      metadata: {
        deliveryId: "DEL005",
        ordersCount: 5,
        routeOptimized: true,
        totalDistance: "12km",
        estimatedTime: "90min",
      },
    },
    {
      userId: "69125c47534311c380dc6f56",
      type: "SYSTEM_ANNOUNCEMENT",
      priority: "MEDIUM",
      title: "Objectif hebdomadaire presque atteint! 🚀",
      message:
        "Excellent travail! Vous avez complété 45/50 livraisons cette semaine. Bonus de 25 DT en vue!",
      read: false,
      actionUrl: "/driver/stats/weekly",
      metadata: {
        weeklyProgress: 45,
        weeklyTarget: 50,
        weeklyBonus: 25,
        remaining: 5,
      },
    },
  ];

  // Clear existing notifications
  await prisma.notification.deleteMany({});
  console.log("🗑️  Notifications existantes supprimées");

  // Create all notifications
  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  console.log(`✅ ${notifications.length} notifications créées avec succès`);

  // Display summary
  const summary = {
    total: notifications.length,
    byRole: {
      admin: notifications.filter(
        (n) => n.userId === "691259fb5e08abebfcab33f6"
      ).length,
      clients: notifications.filter((n) =>
        [
          "691259fb5e08abebfcab33f7",
          "691259fb5e08abebfcab33f8",
          "691259fc5e08abebfcab33f9",
          "691259fc5e08abebfcab33fa",
          "691259fc5e08abebfcab33fb",
          "69125c47534311c380dc6f54",
        ].includes(n.userId)
      ).length,
      vendeurs: notifications.filter((n) =>
        [
          "691259fc5e08abebfcab33fc",
          "691259fc5e08abebfcab33fe",
          "691259fd5e08abebfcab3400",
          "69125c47534311c380dc6f55",
        ].includes(n.userId)
      ).length,
      livreurs: notifications.filter((n) =>
        [
          "691259fd5e08abebfcab3402",
          "691259fd5e08abebfcab3404",
          "691259fe5e08abebfcab3406",
          "69125c47534311c380dc6f56",
        ].includes(n.userId)
      ).length,
    },
    byPriority: {
      urgent: notifications.filter((n) => n.priority === "URGENT").length,
      high: notifications.filter((n) => n.priority === "HIGH").length,
      medium: notifications.filter((n) => n.priority === "MEDIUM").length,
      low: notifications.filter((n) => n.priority === "LOW").length,
    },
    unread: notifications.filter((n) => !n.read).length,
  };

  console.log("\n📊 Résumé des notifications:");
  console.log(`   Total: ${summary.total}`);
  console.log(
    `   Par rôle: Admin(${summary.byRole.admin}) | Clients(${summary.byRole.clients}) | Vendeurs(${summary.byRole.vendeurs}) | Livreurs(${summary.byRole.livreurs})`
  );
  console.log(
    `   Par priorité: Urgent(${summary.byPriority.urgent}) | High(${summary.byPriority.high}) | Medium(${summary.byPriority.medium}) | Low(${summary.byPriority.low})`
  );
  console.log(`   Non lues: ${summary.unread}`);
}

async function main() {
  try {
    await seedNotifications();
    console.log("\n🎉 Seed des notifications terminé avec succès!");
  } catch (error) {
    console.error("\n❌ Erreur lors du seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
