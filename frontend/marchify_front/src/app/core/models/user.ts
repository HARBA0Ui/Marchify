export interface User {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  PWD: string;
  telephone: string;
  adresse: string;
  role: 'CLIENT' | 'VENDEUR' | 'LIVREUR';
}
