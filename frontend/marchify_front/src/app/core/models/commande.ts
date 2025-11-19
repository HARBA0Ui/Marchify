export enum CmdStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export interface AdresseLivraison {
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  instructions?: string;
}

export interface CommandeProduit {
  id: string;
  produitId: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  prixTotal: number;
  produit?: {
    id: string;
    nom: string;
    prix: number;
    categorie: string;
    description: string;
    image: string;
    quantite: number;
    unite: string;
    unitePersonnalisee?: string;
    livrable: boolean;
    boutiqueId: string;
  };
}
export interface ClientInfo {
  id: string;
  nom: string;
  email: string;
  telephone: string;
}

export interface Commande {
  id: string;
  status: CmdStatus;
  adresseLivraison: AdresseLivraison;
  totalCommande: number;
  dateCommande: string;
  clientId: string; 
  client: ClientInfo;
  boutiqueId: string;
  produits: CommandeProduit[];
}
