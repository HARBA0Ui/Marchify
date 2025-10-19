import { Panier } from "./panier";
import { Product } from "./product";

export interface PanierProduit {
  produitId: string;
  nom: string;
  prixUnitaire: number;
  quantite: number;
  prixTotal: number;
}
