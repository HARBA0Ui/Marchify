console.log("📦 Création des commandes (READY)...");

const commandes = await Commande.insertMany([
  {
    _id: "68f743532df2f750af13a598",
    clientId: "68f743532df2f750af13a584", // Client 1
    boutiqueId: "68f743532df2f750af13a590", // Boutique 1
    livreurId: "68f743532df2f750af13a58d", // Livreur 1
    status: "READY",
    adresseLivraison: {
      rue: "12 Rue Habib Bourguiba",
      ville: "Tunis",
      codePostal: "1001",
      pays: "Tunisie",
      instructions: "Appeler avant de livrer",
    },
    produits: [
      {
        produitId: "68f743532df2f750af13a592",
        nom: "Huile d’olive bio",
        prixUnitaire: 25,
        quantite: 2,
        prixTotal: 50,
        unite: "L",
      },
      {
        produitId: "68f743532df2f750af13a593",
        nom: "Dattes Deglet Nour",
        prixUnitaire: 12,
        quantite: 3,
        prixTotal: 36,
        unite: "kg",
      },
    ],
    totalCommande: 86,
    dateCommande: new Date(),
  },
  {
    _id: "68f743532df2f750af13a599",
    clientId: "68f743532df2f750af13a586", // Client 2
    boutiqueId: "68f743532df2f750af13a591", // Boutique 2
    livreurId: "68f743532df2f750af13a58f", // Livreur 2
    status: "READY",
    adresseLivraison: {
      rue: "5 Avenue de la République",
      ville: "Sousse",
      codePostal: "4000",
      pays: "Tunisie",
    },
    produits: [
      {
        produitId: "68f743532df2f750af13a594",
        nom: "Miel pur du Sahel",
        prixUnitaire: 30,
        quantite: 2,
        prixTotal: 60,
        unite: "L",
      },
    ],
    totalCommande: 60,
    dateCommande: new Date(),
  },
]);

console.log("📦 Commandes créées avec statut READY :");
commandes.forEach((cmd, i) => console.log(`Commande ${i + 1}: ${cmd._id}`));
