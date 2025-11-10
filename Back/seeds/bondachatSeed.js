import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- 1️⃣ Create Users ---
  const client = await db.user.create({
    data: {
      nom: 'Ali',
      prenom: 'Ben Salah',
      email: 'ali.client2@example.com',
      PWD: 'hashed_password',
      role: 'CLIENT',
      telephone: '12345678',
      adresse: { rue: 'Rue Habib Bourguiba', ville: 'Tunis' },
      localisation: { lat: 36.8188, lng: 10.1650 }
    },
  });

  const vendeurUser = await db.user.create({
    data: {
      nom: 'Sami',
      prenom: 'Trabelsi',
      email: 'sami.vendeu1r@example.com',
      PWD: 'hashed_password',
      role: 'VENDEUR',
      telephone: '98765432',
      adresse: { rue: 'Avenue de Carthage', ville: 'Tunis' },
      localisation: { lat: 36.8065, lng: 10.1815 },
    },
  });

  const livreurUser = await db.user.create({
    data: {
      nom: 'Rami',
      prenom: 'Ayari',
      email: 'rami.livreur4@example.com',
      PWD: 'hashed_password',
      role: 'LIVREUR',
      telephone: '22334455',
      adresse: { rue: 'Lac 2', ville: 'Tunis' },
      localisation: { lat: 36.8100, lng: 10.1750 },
    },
  });

  // --- 2️⃣ Create Vendeur & Livreur ---
  const vendeur = await db.vendeur.create({
    data: {
      userId: vendeurUser.id,
    },
  });

  const livreur = await db.livreur.create({
    data: {
      userId: livreurUser.id,
      localisation: { lat: 36.8100, lng: 10.1750 },
    },
  });

  // --- 3️⃣ Create Boutique ---
  const boutique = await db.boutique.create({
    data: {
      nom: 'Marchify Store',
      adresse: 'Rue de la République, Tunis',
      localisation: { lat: 36.8065, lng: 10.1815 },
      categorie: 'Alimentation',
      telephone: '70123456',
      vendeurId: vendeur.id,
    },
  });

  // --- 4️⃣ Create Produits ---
  const produit = await db.produit.create({
    data: {
      nom: 'Huile d\'olive extra vierge',
      prix: 25.5,
      categorie: 'Produits locaux',
      description: 'Bouteille de 1L d’huile d’olive pure tunisienne.',
      image: 'https://example.com/huile.jpg',
      quantite: 50,
      boutiqueId: boutique.id,
    },
  });

  // --- 5️⃣ Create Commande ---
  const commande = await db.commande.create({
    data: {
      clientId: client.id,
      boutiqueId: boutique.id,
      totalCommande: 51.0,
      adresseLivraison: { rue: 'Rue El Manar', ville: 'Tunis' },
      produits: {
        create: [
          {
            produitId: produit.id,
            quantite: 2,
            prixTotal: 51.0,
            boutiqueId: boutique.id,
          },
        ],
      },
    },
  });

  // --- 6️⃣ Create Bon de Livraison (Mission) ---
  const bonDeLivraison = await db.bonDeLivraison.create({
    data: {
      commandeId: commande.id,
      livreurId: livreur.id,
      status: 'PENDING_PICKUP',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log({ bonDeLivraison });
}

main()
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
