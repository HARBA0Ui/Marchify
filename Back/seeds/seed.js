import db from "../db/prisma.js"; // Assure-toi que prisma.js exporte PrismaClient

async function main() {
  console.log("🚀 Starting full database seeding...");

  // -----------------------
  // Clear old data
  // -----------------------
  await db.commandeProduit.deleteMany();
  await db.commande.deleteMany();
  await db.produit.deleteMany();
  await db.boutique.deleteMany();
  await db.vendeur.deleteMany();
  await db.livreur.deleteMany();
  await db.user.deleteMany();
  await db.panierProduit.deleteMany();
  await db.panier.deleteMany();
  console.log("✅ Old data cleared.");

  // -----------------------
  // Create Clients
  // -----------------------
  const client1 = await db.user.create({
    data: {
      nom: "Doe",
      prenom: "John",
      email: "john@example.com",
      PWD: "123456",
      telephone: "98765432",
      adresse: { rue: "Rue A", ville: "Tunis" },
      role: "CLIENT",
    },
  });

  const panier1 = await db.panier.create({
    data: { clientId: client1.id },
  });

  const client2 = await db.user.create({
    data: {
      nom: "Smith",
      prenom: "Anna",
      email: "anna@example.com",
      PWD: "123456",
      telephone: "12345678",
      adresse: { rue: "Rue B", ville: "Sfax" },
      role: "CLIENT",
    },
  });

  const panier2 = await db.panier.create({
    data: { clientId: client2.id },
  });

  // -----------------------
  // Create Vendeurs
  // -----------------------
  const vendeurUser1 = await db.user.create({
    data: {
      nom: "Ali",
      prenom: "Vendeur",
      email: "ali.vendeur@example.com",
      PWD: "123456",
      telephone: "11111111",
      adresse: { rue: "Rue C", ville: "Tunis" },
      role: "VENDEUR",
    },
  });

  const vendeur1 = await db.vendeur.create({
    data: { userId: vendeurUser1.id },
  });

  const vendeurUser2 = await db.user.create({
    data: {
      nom: "Leila",
      prenom: "Vendeur",
      email: "leila.vendeur@example.com",
      PWD: "123456",
      telephone: "22222222",
      adresse: { rue: "Rue D", ville: "Sousse" },
      role: "VENDEUR",
    },
  });

  const vendeur2 = await db.vendeur.create({
    data: { userId: vendeurUser2.id },
  });

  // -----------------------
  // Create Livreurs
  // -----------------------
  const livreurUser1 = await db.user.create({
    data: {
      nom: "Karim",
      prenom: "Livreur",
      email: "karim.livreur@example.com",
      PWD: "123456",
      telephone: "33333333",
      adresse: { rue: "Rue E", ville: "Tunis" },
      role: "LIVREUR",
    },
  });

  const livreur1 = await db.livreur.create({
    data: { userId: livreurUser1.id },
  });

  const livreurUser2 = await db.user.create({
    data: {
      nom: "Sana",
      prenom: "Livreur",
      email: "sana.livreur@example.com",
      PWD: "123456",
      telephone: "44444444",
      adresse: { rue: "Rue F", ville: "Sfax" },
      role: "LIVREUR",
    },
  });

  const livreur2 = await db.livreur.create({
    data: { userId: livreurUser2.id },
  });

  // -----------------------
  // Create Boutiques
  // -----------------------
  const boutique1 = await db.boutique.create({
    data: {
      nom: "Marché Central",
      adresse: "Rue Habib Bourguiba, Tunis",
      localisation: { lat: 36.8, lng: 10.2 },
      categorie: "Alimentation",
      telephone: "20202020",
      vendeurId: vendeur1.id,
    },
  });

  const boutique2 = await db.boutique.create({
    data: {
      nom: "ElectroTech",
      adresse: "Avenue de la Liberté, Tunis",
      localisation: { lat: 36.81, lng: 10.17 },
      categorie: "Électronique",
      telephone: "50505050",
      vendeurId: vendeur2.id,
    },
  });

  // -----------------------
  // Create Produits
  // -----------------------
  const produit1 = await db.produit.create({
    data: {
      nom: "Tomates Bio",
      prix: 3.5,
      categorie: "Fruits & Légumes",
      description: "Tomates rouges bio fraîches.",
      image: "https://picsum.photos/200?random=1",
      quantite: 50,
      unite: "KILOGRAMME",
      boutiqueId: boutique1.id,
    },
  });

  const produit2 = await db.produit.create({
    data: {
      nom: "Casque Bluetooth",
      prix: 120,
      categorie: "Accessoires",
      description: "Casque sans fil avec micro intégré.",
      image: "https://picsum.photos/200?random=2",
      quantite: 15,
      unite: "PIECE",
      boutiqueId: boutique2.id,
    },
  });

  const produit3 = await db.produit.create({
    data: {
      nom: "Pommes",
      prix: 2.0,
      categorie: "Fruits & Légumes",
      description: "Pommes rouges sucrées.",
      image: "https://picsum.photos/200?random=3",
      quantite: 30,
      unite: "KILOGRAMME",
      boutiqueId: boutique1.id,
    },
  });

  // -----------------------
  // Add produits to paniers
  // -----------------------
  await db.panierProduit.createMany({
    data: [
      {
        panierId: panier1.id,
        produitId: produit1.id,
        quantite: 2,
        prixTotal: 7,
      },
      {
        panierId: panier1.id,
        produitId: produit3.id,
        quantite: 1,
        prixTotal: 2,
      },
      {
        panierId: panier2.id,
        produitId: produit2.id,
        quantite: 1,
        prixTotal: 120,
      },
    ],
  });

  // -----------------------
  // Create a sample Commande
  // -----------------------
  const commande1 = await db.commande.create({
    data: {
      status: "PENDING",
      adresseLivraison: { rue: "Rue A", ville: "Tunis" },
      totalCommande: 9,
      clientId: client1.id,
      boutiqueId: boutique1.id,
      livreurId: livreur1.id,
    },
  });

  await db.commandeProduit.createMany({
    data: [
      {
        commandeId: commande1.id,
        produitId: produit1.id,
        quantite: 2,
        prixTotal: 7,
        boutiqueId: boutique1.id,
      },
      {
        commandeId: commande1.id,
        produitId: produit3.id,
        quantite: 1,
        prixTotal: 2,
        boutiqueId: boutique1.id,
      },
    ],
  });

    console.log("🎉 Seeding terminé avec succès !");
    console.log("🎉 Seeding terminé avec succès !");

    // Affiche les IDs pour tester les APIs
    console.log("📌 Clients :");
    console.log("Client 1:", client1.id);
    console.log("Client 2:", client2.id);

    console.log("📌 Paniers :");
    console.log("Panier 1:", panier1.id);
    console.log("Panier 2:", panier2.id);

    console.log("📌 Vendeurs :");
    console.log("Vendeur 1:", vendeur1.id, "| User ID:", vendeurUser1.id);
    console.log("Vendeur 2:", vendeur2.id, "| User ID:", vendeurUser2.id);

    console.log("📌 Boutiques :");
    console.log("Boutique 1:", boutique1.id);
    console.log("Boutique 2:", boutique2.id);

    console.log("📌 Livreurs :");
    console.log("Livreur 1:", livreur1.id, "| User ID:", livreurUser1.id);
    console.log("Livreur 2:", livreur2.id, "| User ID:", livreurUser2.id);

    console.log("📌 Produits :");
    console.log("Produit 1:", produit1.id);
    console.log("Produit 2:", produit2.id);
    console.log("Produit 3:", produit3.id);

    console.log("📌 Commandes :");
    console.log("Commande 1:", commande1.id);
    console.log("comnde")

}

main()
  .catch((error) => {
    console.error("❌ Erreur pendant le seeding :", error);
  })
  .finally(async () => {
    await db.$disconnect();
  });
