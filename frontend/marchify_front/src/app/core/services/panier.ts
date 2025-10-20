import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Panier } from '../models/panier';

@Injectable({
  providedIn: 'root',
})
export class PanierService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/paniers';

  getPanier(): Observable<Panier[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map((paniers) =>
        paniers.map((panier) => ({
          ...panier,
          dateMaj: new Date(panier.dateMaj),
        }))
      )
    );
  }

  getPanierByClientId(clientId: string): Observable<Panier> {
    return this.http.get<Panier>(`${this.apiUrl}/client/${clientId}`);
  }

  // Convert panier to commande
  confirmerCommande(
    panierId: string,
    adresseLivraison: {
      rue: string;
      ville: string;
      codePostal: string;
    }
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/${panierId}/confirmer`, {
      adresseLivraison,
    });
  }

  // Add product to panier
  ajouterProduit(
    panierId: string,
    produitId: string,
    quantite: number
  ): Observable<Panier> {
    return this.http.post<Panier>(`${this.apiUrl}/${panierId}/produits`, {
      produitId,
      quantite,
    });
  }

  // Remove product from panier
  retirerProduit(panierId: string, produitId: string): Observable<Panier> {
    return this.http.delete<Panier>(
      `${this.apiUrl}/${panierId}/produits/${produitId}`
    );
  }

  // Update product quantity
  modifierQuantite(
    panierId: string,
    produitId: string,
    quantite: number
  ): Observable<Panier> {
    return this.http.patch<Panier>(
      `${this.apiUrl}/${panierId}/produits/${produitId}`,
      { quantite }
    );
  }

  // Clear panier
  viderPanier(panierId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${panierId}/clear`);
  }
}
