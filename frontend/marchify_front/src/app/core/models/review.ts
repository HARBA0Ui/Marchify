export interface Review {
    id: string;
    type: 'PRODUIT' | 'BOUTIQUE';
    rating: number;
    comment?: string;
  
    auteur?: {
      id: string;
      nom: string;
      prenom?: string;
      email?: string;
    };
  
    produitId?: string;
    boutiqueId?: string;
    createdAt?: Date;
  }
  