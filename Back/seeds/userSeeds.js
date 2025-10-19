import db from "../db/prisma.js"

async function main() {
  console.log("🚀 Starting database seeding for users...");

  // -----------------------
  // Clear old users
  // -----------------------
  await db.panierProduit.deleteMany();
  await db.panier.deleteMany();
  await db.vendeur.deleteMany();
  await db.livreur.deleteMany();
  await db.user.deleteMany();

  console.log("✅ Old users cleared.");

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
      Panier: { create: {} }, // Automatically create an empty cart
    },
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
      Panier: { create: {} },
    },
  });

  // -----------------------
  // Create Vendeurs
  // -----------------------
  const vendeur1User = await db.user.create({
    data: {
      nom: "Vendeur",
      prenom: "Ali",
      email: "ali.vendeur@example.com",
      PWD: "123456",
      telephone: "11111111",
      adresse: { rue: "Rue C", ville: "Tunis" },
      role: "VENDEUR",
    },
  });

  const vendeur2User = await db.user.create({
    data: {
      nom: "Vendeur",
      prenom: "Leila",
      email: "leila.vendeur@example.com",
      PWD: "123456",
      telephone: "22222222",
      adresse: { rue: "Rue D", ville: "Sousse" },
      role: "VENDEUR",
    },
  });

  await db.vendeur.create({ data: { userId: vendeur1User.id } });
  await db.vendeur.create({ data: { userId: vendeur2User.id } });

  // -----------------------
  // Create Livreurs
  // -----------------------
  const livreur1User = await db.user.create({
    data: {
      nom: "Livreur",
      prenom: "Karim",
      email: "karim.livreur@example.com",
      PWD: "123456",
      telephone: "33333333",
      adresse: { rue: "Rue E", ville: "Tunis" },
      role: "LIVREUR",
    },
  });

  const livreur2User = await db.user.create({
    data: {
      nom: "Livreur",
      prenom: "Sana",
      email: "sana.livreur@example.com",
      PWD: "123456",
      telephone: "44444444",
      adresse: { rue: "Rue F", ville: "Sfax" },
      role: "LIVREUR",
    },
  });

  await db.livreur.create({ data: { userId: livreur1User.id } });
  await db.livreur.create({ data: { userId: livreur2User.id } });

  console.log("🎉 Users seeding completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Error during users seeding:", error);
  })
  .finally(async () => {
    await db.$disconnect();
  });
