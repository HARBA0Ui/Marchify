export interface BonDeLivraison {
  id: string;
  dateCreation: string;
  commandeId: string;
  status: DeliveryStatus;
  livreurId: string | null; // ✅ NULLABLE - can be null for unassigned missions

  commande: {
    id: string;
    status: string;
    adresseLivraison: {
      rue: string;
      ville: string;
      codePostal?: string; // ✅ Optional
    };
    totalCommande: number;
    dateCommande: string;

    client: {
      nom: string;
      prenom: string;
      telephone: string;
      adresse?: any; // ✅ Optional - additional client address
    };

    boutique?: {
      // ✅ OPTIONAL - might not always be included
      nom: string;
      telephone: string;
      adresse: string;
    };

    produits: Array<{
      quantite: number;
      prixTotal: number;
      produit: {
        nom: string;
        prix: number;
        image?: string; // ✅ Optional product image
      };
    }>;
  };

  livreur?: {
    // ✅ OPTIONAL - null for unassigned missions
    id: string;
    user: {
      nom: string;
      prenom: string;
      telephone?: string; // ✅ Optional phone number
    };
  } | null;
}

export enum DeliveryStatus {
  PENDING_PICKUP = 'PENDING_PICKUP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}
