import { PrismaClient, UserRole, CmdStatus, UniteMesure } from '@prisma/client';
const prisma = new PrismaClient();

const IMAGE_URL = 'https://res.cloudinary.com/dplpnirhw/image/upload/v1761866860/products/lttazamk1zx538kumfro.jpg';

async function main() {
    console.log('🌱 Starting seed...');

    await prisma.commande.deleteMany();
    await prisma.commandeProduit.deleteMany();
    await prisma.bonDeLivraison.deleteMany();
    await prisma.produit.deleteMany();
    await prisma.boutique.deleteMany();
    await prisma.user.deleteMany();

    // Hash password
    const hashedPassword = "password123"

    // Create Admin User
    const admin = await prisma.user.create({
        data: {
            nom: 'Ben Salah',
            prenom: 'Ahmed',
            email: 'admin@supermarket.tn',
            PWD: hashedPassword,
            role: UserRole.ADMIN,
            telephone: '+216 71 123 456',
            adresse: {
                rue: 'Avenue Habib Bourguiba',
                ville: 'Tunis',
                codePostal: '1000',
                pays: 'Tunisie'
            },
            localisation: {
                latitude: 36.8065,
                longitude: 10.1815
            }
        }
    });

    // Create 5 Clients
    const clients = [];
    for (let i = 1; i <= 5; i++) {
        const client = await prisma.user.create({
            data: {
                nom: `Client${i}`,
                prenom: `Prénom${i}`,
                email: `client${i}@email.tn`,
                PWD: hashedPassword,
                role: UserRole.CLIENT,
                telephone: `+216 20 ${100000 + i}`,
                adresse: {
                    rue: `Rue ${i}, Quartier ${i}`,
                    ville: ['Tunis', 'Ariana', 'Ben Arous', 'La Marsa', 'Carthage'][i - 1],
                    codePostal: `${1000 + i}`,
                    pays: 'Tunisie'
                },
                localisation: {
                    latitude: 36.8 + (i * 0.01),
                    longitude: 10.18 + (i * 0.01)
                }
            }
        });
        clients.push(client);
    }

    // Create 3 Vendors
    const vendors = [];
    for (let i = 1; i <= 3; i++) {
        const vendorUser = await prisma.user.create({
            data: {
                nom: `Vendeur${i}`,
                prenom: `Mohamed`,
                email: `vendeur${i}@supermarket.tn`,
                PWD: hashedPassword,
                role: UserRole.VENDEUR,
                telephone: `+216 22 ${200000 + i}`,
                adresse: {
                    rue: `Avenue ${i}`,
                    ville: 'Tunis',
                    codePostal: '1000',
                    pays: 'Tunisie'
                }
            }
        });

        const vendor = await prisma.vendeur.create({
            data: {
                userId: vendorUser.id
            }
        });
        vendors.push(vendor);
    }

    // Create 3 Delivery Drivers
    const drivers = [];
    for (let i = 1; i <= 3; i++) {
        const driverUser = await prisma.user.create({
            data: {
                nom: `Livreur${i}`,
                prenom: `Ali`,
                email: `livreur${i}@supermarket.tn`,
                PWD: hashedPassword,
                role: UserRole.LIVREUR,
                telephone: `+216 23 ${300000 + i}`,
                adresse: {
                    rue: `Rue Livreur ${i}`,
                    ville: 'Tunis',
                    codePostal: '1000',
                    pays: 'Tunisie'
                }
            }
        });

        const driver = await prisma.livreur.create({
            data: {
                userId: driverUser.id,
                localisation: {
                    latitude: 36.85 + (i * 0.02),
                    longitude: 10.20 + (i * 0.02)
                }
            }
        });
        drivers.push(driver);
    }

    // Create 3 Boutiques (Supermarkets)
    const boutiques = [];
    const boutiqueNames = ['Supermarché Central', 'Monoprix Express', 'Carrefour Market'];
    for (let i = 0; i < 3; i++) {
        const boutique = await prisma.boutique.create({
            data: {
                nom: boutiqueNames[i],
                adresse: `${i + 1} Avenue de la République, Tunis`,
                localisation: {
                    latitude: 36.80 + (i * 0.03),
                    longitude: 10.18 + (i * 0.03)
                },
                categorie: 'Supermarché',
                telephone: `+216 71 ${400000 + i}`,
                vendeurId: vendors[i].id
            }
        });
        boutiques.push(boutique);
    }

    // Products data (60 products across all categories)
    const productsData = [
        // Fruits & Légumes (10 products)
        { nom: 'Pommes Rouges', prix: 3.5, categorie: 'Fruits & Légumes', description: 'Pommes rouges fraîches et croquantes', quantite: 100, unite: UniteMesure.KILOGRAMME },
        { nom: 'Bananes', prix: 2.8, categorie: 'Fruits & Légumes', description: 'Bananes mûres et sucrées', quantite: 150, unite: UniteMesure.KILOGRAMME },
        { nom: 'Tomates', prix: 1.9, categorie: 'Fruits & Légumes', description: 'Tomates fraîches locales', quantite: 120, unite: UniteMesure.KILOGRAMME },
        { nom: 'Carottes', prix: 1.5, categorie: 'Fruits & Légumes', description: 'Carottes biologiques', quantite: 80, unite: UniteMesure.KILOGRAMME },
        { nom: 'Oranges', prix: 3.2, categorie: 'Fruits & Légumes', description: 'Oranges juteuses de Nabeul', quantite: 110, unite: UniteMesure.KILOGRAMME },
        { nom: 'Pommes de Terre', prix: 1.2, categorie: 'Fruits & Légumes', description: 'Pommes de terre locales', quantite: 200, unite: UniteMesure.KILOGRAMME },
        { nom: 'Concombres', prix: 1.8, categorie: 'Fruits & Légumes', description: 'Concombres frais', quantite: 90, unite: UniteMesure.KILOGRAMME },
        { nom: 'Fraises', prix: 8.5, categorie: 'Fruits & Légumes', description: 'Fraises de saison', quantite: 50, unite: UniteMesure.KILOGRAMME },
        { nom: 'Salade Verte', prix: 1.0, categorie: 'Fruits & Légumes', description: 'Salade fraîche', quantite: 60, unite: UniteMesure.PIECE },
        { nom: 'Citrons', prix: 2.5, categorie: 'Fruits & Légumes', description: 'Citrons de Tunisie', quantite: 70, unite: UniteMesure.KILOGRAMME },

        // Viandes & Poissons (10 products)
        { nom: 'Poulet Entier', prix: 12.5, categorie: 'Viandes & Poissons', description: 'Poulet frais fermier', quantite: 40, unite: UniteMesure.KILOGRAMME },
        { nom: 'Escalopes de Poulet', prix: 15.0, categorie: 'Viandes & Poissons', description: 'Escalopes de poulet sans peau', quantite: 35, unite: UniteMesure.KILOGRAMME },
        { nom: 'Bœuf Haché', prix: 22.0, categorie: 'Viandes & Poissons', description: 'Viande de bœuf hachée fraîche', quantite: 30, unite: UniteMesure.KILOGRAMME },
        { nom: 'Côtelettes d\'Agneau', prix: 35.0, categorie: 'Viandes & Poissons', description: 'Côtelettes d\'agneau tendres', quantite: 25, unite: UniteMesure.KILOGRAMME },
        { nom: 'Saumon Frais', prix: 45.0, categorie: 'Viandes & Poissons', description: 'Filets de saumon norvégien', quantite: 20, unite: UniteMesure.KILOGRAMME },
        { nom: 'Daurade', prix: 28.0, categorie: 'Viandes & Poissons', description: 'Daurade fraîche de la mer', quantite: 18, unite: UniteMesure.KILOGRAMME },
        { nom: 'Crevettes', prix: 38.0, categorie: 'Viandes & Poissons', description: 'Crevettes fraîches décortiquées', quantite: 15, unite: UniteMesure.KILOGRAMME },
        { nom: 'Merguez', prix: 18.0, categorie: 'Viandes & Poissons', description: 'Merguez épicées artisanales', quantite: 40, unite: UniteMesure.KILOGRAMME },
        { nom: 'Thon Frais', prix: 32.0, categorie: 'Viandes & Poissons', description: 'Thon frais de qualité', quantite: 22, unite: UniteMesure.KILOGRAMME },
        { nom: 'Sardines', prix: 8.0, categorie: 'Viandes & Poissons', description: 'Sardines fraîches', quantite: 50, unite: UniteMesure.KILOGRAMME },

        // Produits Laitiers (8 products)
        { nom: 'Lait Demi-Écrémé', prix: 1.8, categorie: 'Produits Laitiers', description: 'Lait demi-écrémé 1L', quantite: 100, unite: UniteMesure.LITRE },
        { nom: 'Yaourt Nature', prix: 0.6, categorie: 'Produits Laitiers', description: 'Yaourt nature 125g', quantite: 200, unite: UniteMesure.PIECE },
        { nom: 'Fromage Blanc', prix: 3.5, categorie: 'Produits Laitiers', description: 'Fromage blanc onctueux', quantite: 80, unite: UniteMesure.KILOGRAMME },
        { nom: 'Beurre Doux', prix: 8.0, categorie: 'Produits Laitiers', description: 'Beurre doux 250g', quantite: 60, unite: UniteMesure.PIECE },
        { nom: 'Gruyère Râpé', prix: 12.0, categorie: 'Produits Laitiers', description: 'Gruyère râpé 200g', quantite: 70, unite: UniteMesure.PIECE },
        { nom: 'Crème Fraîche', prix: 4.5, categorie: 'Produits Laitiers', description: 'Crème fraîche épaisse', quantite: 55, unite: UniteMesure.PIECE },
        { nom: 'Lait Entier', prix: 2.0, categorie: 'Produits Laitiers', description: 'Lait entier 1L', quantite: 90, unite: UniteMesure.LITRE },
        { nom: 'Yaourt aux Fruits', prix: 0.8, categorie: 'Produits Laitiers', description: 'Yaourt aromatisé aux fruits', quantite: 150, unite: UniteMesure.PIECE },

        // Boissons (8 products)
        { nom: 'Eau Minérale', prix: 0.5, categorie: 'Boissons', description: 'Eau minérale 1.5L', quantite: 300, unite: UniteMesure.PIECE },
        { nom: 'Coca-Cola', prix: 1.2, categorie: 'Boissons', description: 'Coca-Cola 1L', quantite: 150, unite: UniteMesure.PIECE },
        { nom: 'Jus d\'Orange', prix: 2.5, categorie: 'Boissons', description: 'Jus d\'orange pur 1L', quantite: 100, unite: UniteMesure.LITRE },
        { nom: 'Café Arabica', prix: 15.0, categorie: 'Boissons', description: 'Café arabica en grains 500g', quantite: 40, unite: UniteMesure.PIECE },
        { nom: 'Thé Vert', prix: 8.0, categorie: 'Boissons', description: 'Thé vert bio 100g', quantite: 60, unite: UniteMesure.PIECE },
        { nom: 'Sprite', prix: 1.1, categorie: 'Boissons', description: 'Sprite citron 1L', quantite: 120, unite: UniteMesure.PIECE },
        { nom: 'Eau Gazeuse', prix: 0.7, categorie: 'Boissons', description: 'Eau gazeuse 1L', quantite: 200, unite: UniteMesure.PIECE },
        { nom: 'Jus de Pomme', prix: 2.3, categorie: 'Boissons', description: 'Jus de pomme naturel', quantite: 80, unite: UniteMesure.LITRE },

        // Épicerie (8 products)
        { nom: 'Riz Basmati', prix: 3.5, categorie: 'Épicerie', description: 'Riz basmati premium 1kg', quantite: 100, unite: UniteMesure.KILOGRAMME },
        { nom: 'Pâtes Spaghetti', prix: 1.8, categorie: 'Épicerie', description: 'Pâtes spaghetti 500g', quantite: 150, unite: UniteMesure.PIECE },
        { nom: 'Huile d\'Olive', prix: 12.0, categorie: 'Épicerie', description: 'Huile d\'olive extra vierge 1L', quantite: 80, unite: UniteMesure.LITRE },
        { nom: 'Sucre Blanc', prix: 1.5, categorie: 'Épicerie', description: 'Sucre blanc cristallisé 1kg', quantite: 120, unite: UniteMesure.KILOGRAMME },
        { nom: 'Farine', prix: 1.2, categorie: 'Épicerie', description: 'Farine tout usage 1kg', quantite: 100, unite: UniteMesure.KILOGRAMME },
        { nom: 'Conserve Thon', prix: 2.5, categorie: 'Épicerie', description: 'Thon à l\'huile d\'olive', quantite: 200, unite: UniteMesure.PIECE },
        { nom: 'Sel Fin', prix: 0.8, categorie: 'Épicerie', description: 'Sel fin de cuisine 1kg', quantite: 150, unite: UniteMesure.KILOGRAMME },
        { nom: 'Couscous', prix: 2.2, categorie: 'Épicerie', description: 'Couscous moyen 1kg', quantite: 90, unite: UniteMesure.KILOGRAMME },

        // Boulangerie (4 products)
        { nom: 'Pain Complet', prix: 0.8, categorie: 'Boulangerie', description: 'Pain complet frais', quantite: 100, unite: UniteMesure.PIECE },
        { nom: 'Baguette Tradition', prix: 0.6, categorie: 'Boulangerie', description: 'Baguette tradition française', quantite: 150, unite: UniteMesure.PIECE },
        { nom: 'Croissants', prix: 1.5, categorie: 'Boulangerie', description: 'Croissants au beurre', quantite: 80, unite: UniteMesure.PIECE },
        { nom: 'Pain de Mie', prix: 2.0, categorie: 'Boulangerie', description: 'Pain de mie tranché', quantite: 70, unite: UniteMesure.PIECE },

        // Électronique (3 products)
        { nom: 'Chargeur USB', prix: 15.0, categorie: 'Électronique', description: 'Chargeur USB universel', quantite: 50, unite: UniteMesure.PIECE, livrable: false },
        { nom: 'Écouteurs', prix: 25.0, categorie: 'Électronique', description: 'Écouteurs stéréo', quantite: 40, unite: UniteMesure.PIECE, livrable: false },
        { nom: 'Batterie AAA', prix: 5.0, categorie: 'Électronique', description: 'Pile AAA pack de 4', quantite: 100, unite: UniteMesure.PIECE, livrable: false },

        // Autre (3 products)
        { nom: 'Papier Toilette', prix: 6.0, categorie: 'Autre', description: 'Papier toilette 12 rouleaux', quantite: 100, unite: UniteMesure.PIECE },
        { nom: 'Mouchoirs en Papier', prix: 2.5, categorie: 'Autre', description: 'Boîte de mouchoirs', quantite: 80, unite: UniteMesure.PIECE },
        { nom: 'Allumettes', prix: 0.5, categorie: 'Autre', description: 'Boîte d\'allumettes', quantite: 150, unite: UniteMesure.PIECE },

        // Maison & Jardin (3 products)
        { nom: 'Sac Poubelle', prix: 3.5, categorie: 'Maison & Jardin', description: 'Sacs poubelle 50L x20', quantite: 80, unite: UniteMesure.PIECE },
        { nom: 'Éponges', prix: 2.0, categorie: 'Maison & Jardin', description: 'Éponges de cuisine x5', quantite: 100, unite: UniteMesure.PIECE },
        { nom: 'Liquide Vaisselle', prix: 3.0, categorie: 'Maison & Jardin', description: 'Liquide vaisselle 1L', quantite: 90, unite: UniteMesure.PIECE },

        // Santé & Beauté (3 products)
        { nom: 'Shampoing', prix: 6.0, categorie: 'Santé & Beauté', description: 'Shampoing tous types', quantite: 70, unite: UniteMesure.PIECE },
        { nom: 'Savon Liquide', prix: 4.0, categorie: 'Santé & Beauté', description: 'Savon liquide antibactérien', quantite: 80, unite: UniteMesure.PIECE },
        { nom: 'Dentifrice', prix: 3.5, categorie: 'Santé & Beauté', description: 'Dentifrice protection complète', quantite: 100, unite: UniteMesure.PIECE },
    ];

    // Create products (distribute across boutiques)
    const products = [];
    for (let i = 0; i < productsData.length; i++) {
        const product = await prisma.produit.create({
            data: {
                ...productsData[i],
                image: IMAGE_URL,
                boutiqueId: boutiques[i % 3].id
            }
        });
        products.push(product);
    }

    console.log(`✅ Created ${products.length} products`);

    // Create Shopping Carts for clients
    // Create Shopping Carts for clients
    for (const client of clients) {
        const panierProducts = [];
        const numItems = Math.floor(Math.random() * 5) + 2;

        // Track unique product IDs to prevent duplicates
        const usedProductIds = new Set();

        while (panierProducts.length < numItems) {
            const randomProduct = products[Math.floor(Math.random() * products.length)];

            // Skip if this product is already added to the same cart
            if (usedProductIds.has(randomProduct.id)) continue;

            usedProductIds.add(randomProduct.id);
            const quantite = Math.floor(Math.random() * 3) + 1;

            panierProducts.push({
                quantite,
                prixTotal: randomProduct.prix * quantite,
                produitId: randomProduct.id
            });
        }

        const total = panierProducts.reduce((sum, item) => sum + item.prixTotal, 0);

        await prisma.panier.create({
            data: {
                clientId: client.id,
                total,
                produits: {
                    create: panierProducts
                }
            }
        });
    }

    console.log('✅ Created shopping carts');

    // Create 30 Orders with various statuses
    const statuses = [
        CmdStatus.PENDING,
        CmdStatus.PROCESSING,
        CmdStatus.READY,
        CmdStatus.SHIPPED,
        CmdStatus.DELIVERED,
        CmdStatus.CANCELLED,
        CmdStatus.RETURNED
    ];

    for (let i = 0; i < 30; i++) {
        const client = clients[Math.floor(Math.random() * clients.length)];
        const boutique = boutiques[Math.floor(Math.random() * boutiques.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const driver = Math.random() > 0.3 ? drivers[Math.floor(Math.random() * drivers.length)] : null;

        // Select 2-5 random products from the same boutique
        const boutiqueProducts = products.filter(p => p.boutiqueId === boutique.id);
        const numProducts = Math.floor(Math.random() * 4) + 2;
        const selectedProducts = [];

        for (let j = 0; j < Math.min(numProducts, boutiqueProducts.length); j++) {
            const product = boutiqueProducts[Math.floor(Math.random() * boutiqueProducts.length)];
            if (!selectedProducts.find(p => p.id === product.id)) {
                selectedProducts.push(product);
            }
        }

        let totalCommande = 0;
        const commandeProducts = selectedProducts.map(product => {
            const quantite = Math.floor(Math.random() * 3) + 1;
            const prixTotal = product.prix * quantite;
            totalCommande += prixTotal;
            return {
                quantite,
                prixTotal,
                produitId: product.id,
                boutiqueId: boutique.id
            };
        });

        // Random date within last 60 days
        const daysAgo = Math.floor(Math.random() * 60);
        const dateCommande = new Date();
        dateCommande.setDate(dateCommande.getDate() - daysAgo);

        await prisma.commande.create({
            data: {
                status,
                adresseLivraison: {
                    rue: client.adresse.rue,
                    ville: client.adresse.ville,
                    codePostal: client.adresse.codePostal,
                    pays: 'Tunisie'
                },
                totalCommande,
                dateCommande,
                clientId: client.id,
                boutiqueId: boutique.id,
                // livreurId: driver?.id,
                produits: {
                    create: commandeProducts
                }
            }
        });
    }

    console.log('✅ Created 30 orders');
    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });