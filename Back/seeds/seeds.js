import db from "../db/prisma.js"

async function main() {
  console.log("🚀 Starting database seeding...");

  await db.commandeProduit.deleteMany();
  await db.commande.deleteMany();
  await db.produit.deleteMany();
  await db.boutique.deleteMany();

  console.log("✅ Old data cleared.");

  const boutique1 = await db.boutique.create({
    data: {
      nom: "Marché Central",
      adresse: "Rue Habib Bourguiba, Tunis",
      localisation: { lat: 36.8, lng: 10.2 },
      categorie: "Alimentation",
      telephone: "20202020",
    },
  });

  const boutique2 = await db.boutique.create({
    data: {
      nom: "ElectroTech",
      adresse: "Avenue de la Liberté, Tunis",
      localisation: { lat: 36.81, lng: 10.17 },
      categorie: "Électronique",
      telephone: "50505050",
    },
  });

  console.log("🏬 Boutiques créées :", boutique1.nom, "et", boutique2.nom);

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

  console.log("🛒 Produits créés :", produit1.nom, "et", produit2.nom);

  console.log("🎉 Seeding terminé avec succès !");
}

main()
  .catch((error) => {
    console.error("❌ Erreur pendant le seeding :", error);
  })
  .finally(async () => {
    await db.$disconnect();
  });
