export interface Shop {
  id: string;
  nom: string;
  adresse: string;
  localisation?: { lat: number; lng: number };
  categorie: string;
  telephone: string;
  vendeurId: string;
  produits?: string[];
    
}
