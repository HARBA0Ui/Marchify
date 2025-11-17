import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Panier } from '../models/panier';

@Injectable({
  providedIn: 'root',
})
export class PanierService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/cart';

  // 🔹 état partagé du nombre d’articles dans le panier
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor() {}

  // permet de mettre le compteur à jour depuis n’importe où
  setCartCount(count: number) {
    this.cartCountSubject.next(count);
  }

  // optionnel : getter du nombre courant
  getCartCount(): number {
    return this.cartCountSubject.value;
  }

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

  getPanierByClientId(clientId: string): Observable<Panier> {
    return this.http.get<Panier>(`${this.apiUrl}/${clientId}`);
  }

  modifierQuantites(
    clientId: string,
    updates: { produitId: string; quantite: number }[]
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, {
      clientId,
      updates,
    });
  }

  recalculerTotal(clientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/recalc/${clientId}`);
  }

  confirmerCommande(
    clientId: string,
    adresseLivraison: { rue: string; ville: string; codePostal: string }
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm`, {
      clientId,
      adresseLivraison,
    });
  }

  // 🔹 enlever un produit
  supprimerProduit(clientId: string, produitId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/remove`, {
      clientId,
      produitId,
    });
  }

  // 🔹 vider tout le panier
  viderPanier(clientId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear/${clientId}`);
  }
}
