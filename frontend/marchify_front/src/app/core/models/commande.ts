// commande.model.ts
export enum CmdStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface AdresseLivraison {
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  instructions?: string;
}

export interface CommandeProduit {
  produitId: string;
  nom: string;
  prixUnitaire: number;
  quantite: number;
  prixTotal: number;
  unite: string;
}

export interface Commande {
  id: string;
  status: CmdStatus;
  adresseLivraison: AdresseLivraison;
  totalCommande: number;
  dateCommande: string;
  clientId: string;
  boutiqueId?: string;
  produits: CommandeProduit[];
}