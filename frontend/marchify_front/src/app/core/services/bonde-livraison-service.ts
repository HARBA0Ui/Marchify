import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BonDeLivraison } from '../models/bondelivraison';

@Injectable({
  providedIn: 'root'
})
export class BondeLivraisonService {

  private apiUrl = 'http://localhost:3000/api/bonDeLivraison';
  private http = inject(HttpClient);

  // ----------- LIVRER COMMANDE -----------
  livrerCommande(bonId: string): Observable<BonDeLivraison> {
    return this.http.post<BonDeLivraison>(
      `${this.apiUrl}/livreur/${bonId}`,
      {}
    );
  }

  // ----------- GET BONS PAR LIVREUR -----------
  getBondelisraisonsByLivreur(livreurId: string): Observable<{bons: BonDeLivraison[]}> { // Retourne un observable de BonDeLivraison[]> {
    return this.http.get<{bons: BonDeLivraison[]}> // Retourne un observable de BonDeLivraison[]>
    (
      `${this.apiUrl}/livreur/${livreurId}`
    );
  }

}
