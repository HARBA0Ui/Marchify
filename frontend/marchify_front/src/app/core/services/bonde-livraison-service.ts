import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BonDeLivraison } from '../models/bondelivraison';

@Injectable({
  providedIn: 'root',
})
export class BondeLivraisonService {
  private apiUrl = 'http://localhost:3000/api/bonDeLivraison';
  private http = inject(HttpClient);

  // ✅ GET ALL BONS DE LIVRAISON (Admin)
  getAllBons(): Observable<{ bons: BonDeLivraison[] }> {
    return this.http.get<{ bons: BonDeLivraison[] }>(
      `${this.apiUrl}/getAllBons`
    );
  }

  // ✅ GET BONS BY LIVREUR
  getBonsByLivreur(livreurId: string): Observable<{ bons: BonDeLivraison[] }> {
    return this.http.get<{ bons: BonDeLivraison[] }>(
      `${this.apiUrl}/livreur/${livreurId}`
    );
  }

  // ✅ GET UNASSIGNED BONS (Admin - to assign livreurs)
  getUnassignedBons(): Observable<{ bons: BonDeLivraison[] }> {
    return this.http.get<{ bons: BonDeLivraison[] }>(
      `${this.apiUrl}/unassigned`
    );
  }

  // ✅ ASSIGN LIVREUR TO BON (Admin/Vendeur)
  assignLivreur(
    bonId: string,
    livreurId: string
  ): Observable<{ message: string; bonDeLivraison: BonDeLivraison }> {
    return this.http.patch<{ message: string; bonDeLivraison: BonDeLivraison }>(
      `${this.apiUrl}/${bonId}/assign-livreur`,
      { livreurId }
    );
  }

  // ✅ PICKUP COMMANDE (Livreur - PENDING_PICKUP → IN_TRANSIT)
  pickupCommande(
    bonId: string
  ): Observable<{ message: string; bonDeLivraison: BonDeLivraison }> {
    return this.http.patch<{ message: string; bonDeLivraison: BonDeLivraison }>(
      `${this.apiUrl}/${bonId}/pickup`,
      {}
    );
  }

  // ✅ DELIVER COMMANDE (Livreur - IN_TRANSIT → DELIVERED)
  livrerCommande(
    bonId: string
  ): Observable<{ message: string; bonDeLivraison: BonDeLivraison }> {
    return this.http.patch<{ message: string; bonDeLivraison: BonDeLivraison }>(
      `${this.apiUrl}/${bonId}/deliver`,
      {}
    );
  }

  // ✅ FAIL DELIVERY (Livreur - mark as FAILED)
  failDelivery(
    bonId: string,
    reason: string
  ): Observable<{ message: string; bonDeLivraison: BonDeLivraison }> {
    return this.http.patch<{ message: string; bonDeLivraison: BonDeLivraison }>(
      `${this.apiUrl}/${bonId}/fail`,
      { reason }
    );
  }

  // ✅ GET BON BY ID (Track specific delivery)
  getBonById(bonId: string): Observable<{ bon: BonDeLivraison }> {
    return this.http.get<{ bon: BonDeLivraison }>(`${this.apiUrl}/${bonId}`);
  }

  // ✅ GET BON BY COMMANDE ID (Track order delivery)
  getBonByCommandeId(commandeId: string): Observable<{ bon: BonDeLivraison }> {
    return this.http.get<{ bon: BonDeLivraison }>(
      `${this.apiUrl}/commande/${commandeId}`
    );
  }
}
