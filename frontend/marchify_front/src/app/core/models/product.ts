import { UniteMesure } from "./unite-mesure";

export interface Product {
  id: string;
  nom: string;
  prix: number;
  categorie: string;
  description: string;
  image: string;
  quantite: number;
  unite: UniteMesure;
  livrable: boolean;
  boutiqueId: string;
}
