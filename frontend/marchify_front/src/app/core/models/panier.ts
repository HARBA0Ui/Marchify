import { PanierProduit } from "./panier-produit";

export interface Panier {
   id: string;
  //client: User;
  clientId: string;
  produits: PanierProduit[];
  total: number;
  dateMaj?: Date;
}

