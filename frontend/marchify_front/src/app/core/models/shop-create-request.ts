export interface ShopCreateRequest {
  nom: string;
  adresse: string;
  localisation?: { lat: number; lng: number };
  categorie: string;
  telephone: string;
  vendeurId: string;
}
