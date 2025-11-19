export interface User {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    PWD: string;
    telephone?: string;
    adresse?: string;
    role: 'CLIENT' | 'VENDEUR' | 'LIVREUR' | 'ADMIN';
  }
  