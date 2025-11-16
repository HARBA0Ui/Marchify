export interface BonDeLivraison {
  id: string;
  dateCreation: string;
  commandeId: string;
  status: DeliveryStatus;
  livreurId: string;

  commande: {
    id: string;
    status: string;
    adresseLivraison: {
      rue: string;
      ville: string;
    };
    totalCommande: number;
    dateCommande: string;

    client: {
      nom: string;
      prenom: string;
      telephone: string;
    };

    boutique: {
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
      };
    }>;
  };

  livreur: {
    user: {
      nom: string;
      prenom: string;
    };
  };
}

export enum DeliveryStatus {
  PENDING_PICKUP = 'PENDING_PICKUP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED'
}
