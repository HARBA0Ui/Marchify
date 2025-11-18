export interface PanierProduit {
  produitId: string;
  nom: string;
  prixUnitaire: number;
  quantite: number;   // quantité dans le panier
  prixTotal: number;
  stock: number;      // quantité disponible en stock (vient de produit.quantite)
}

export interface Panier {
  id: string;
  clientId: string;
  produits: PanierProduit[];
  total: number;
}
