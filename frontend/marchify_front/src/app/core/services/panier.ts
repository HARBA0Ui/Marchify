import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Panier } from '../models/panier';

@Injectable({
  providedIn: 'root',
})
export class PanierService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/cart';

  // Add a product to the cart (matches POST /add)
  ajouterProduit(
    clientId: string,
    produitId: string,
    quantite: number
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, {
      clientId,
      produitId,
      quantite,
    });
  }

  // Get the cart for a specific client (matches GET /:clientId)
  getPanierByClientId(clientId: string): Observable<Panier> {
    return this.http.get<Panier>(`${this.apiUrl}/${clientId}`);
  }

  // Update quantities (matches PUT /update)
  modifierQuantites(
    panierId: string,
    produits: { produitId: string; quantite: number }[]
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, {
      panierId,
      produits,
    });
  }

  // Recalculate total (matches GET /recalc/:clientId)
  recalculerTotal(clientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/recalc/${clientId}`);
  }

  // Confirm the order (matches POST /confirm)
  confirmerCommande(
    panierId: string,
    adresseLivraison: { rue: string; ville: string; codePostal: string }
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm`, {
      panierId,
      adresseLivraison,
    });
  }
}
