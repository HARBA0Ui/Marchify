import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CmdStatus, Commande } from '../models/commande';

@Injectable({
  providedIn: 'root',
})
export class CommandeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/commandes';

  getCommandesByAcheteur(
    clientId: string
  ): Observable<{ commandes: Commande[] }> {
    return this.http.get<{ commandes: Commande[] }>(
      `${this.apiUrl}/commandesList/${clientId}`
    );
  }

  getCommandesByVendeur(
    vendeurId: string
  ): Observable<{ commandes: Commande[] }> {
    return this.http.get<{ commandes: Commande[] }>(
      `${this.apiUrl}/vendeur/${vendeurId}`
    );
  }

  getCommandesByBoutique(
    boutiqueId: string
  ): Observable<{ commandes: Commande[] }> {
    return this.http.get<{ commandes: Commande[] }>(
      `${this.apiUrl}/boutique/${boutiqueId}`
    );
  }

  getCommandeById(commandeId: string): Observable<{ commande: Commande }> {
    return this.http.get<{ commande: Commande }>(
      `${this.apiUrl}/${commandeId}`
    );
  }

  // ✅ Specific action methods
  accepterCommande(commandeId: string): Observable<{ commande: Commande }> {
    return this.http.patch<{ commande: Commande }>(
      `${this.apiUrl}/accepter/${commandeId}`,
      {}
    );
  }

  preparerCommande(commandeId: string): Observable<{ commande: Commande }> {
    return this.http.patch<{ commande: Commande }>(
      `${this.apiUrl}/preparer/${commandeId}`,
      {}
    );
  }

  expedierCommande(commandeId: string): Observable<{ commande: Commande }> {
    return this.http.patch<{ commande: Commande }>(
      `${this.apiUrl}/expedier/${commandeId}`,
      {}
    );
  }

  livrerCommande(commandeId: string): Observable<{ commande: Commande }> {
    return this.http.patch<{ commande: Commande }>(
      `${this.apiUrl}/livrer/${commandeId}`,
      {}
    );
  }

  annulerCommande(
    commandeId: string,
    raison?: string
  ): Observable<{ commande: Commande }> {
    return this.http.patch<{ commande: Commande }>(
      `${this.apiUrl}/annuler/${commandeId}`,
      { raison }
    );
  }

  // Generic status update
  updateCommandeStatus(
    commandeId: string,
    newStatus: CmdStatus
  ): Observable<{ commande: Commande }> {
    return this.http.patch<{ commande: Commande }>(
      `${this.apiUrl}/status/${commandeId}`,
      {
        status: newStatus,
      }
    );
  }

  getStatsByBoutique(vendeurId: string) {
    return this.http.get<{ stats: { boutique: string; count: number }[] }>(
      `${this.apiUrl}/stats/vendeur/${vendeurId}`
    );
  }

  getStatsByMonth(vendeurId: string) {
    return this.http.get<{ stats: { month: string; count: number }[] }>(
      `${this.apiUrl}/stats/vendeur/${vendeurId}/months`
    );
  }

  getStatsByMonthAndYear(vendeurId: string, year: number, month: number) {
    return this.http.get<{ stats: { month: string; count: number }[] }>(
      `${this.apiUrl}/stats/vendeur/${vendeurId}/months?year=${year}&month=${month}`
    );
  }

  getStatsByStatusForMonth(vendeurId: string, year: number, month: number) {
    return this.http.get<{ stats: { status: string; count: number }[] }>(
      `${this.apiUrl}/stats/vendeur/${vendeurId}/status?year=${year}&month=${month}`
    );
  }
}
