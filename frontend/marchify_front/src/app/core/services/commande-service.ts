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

  // getCommandesByAcheteur(clientId: string): Observable<Commande[]> {
  //   return this.http.get<Commande[]>(`${this.apiUrl}/commandesList/${clientId}`);
  // }
getCommandesByAcheteur(clientId: string): Observable<{ commandes: Commande[] }> {
  return this.http.get<{ commandes: Commande[] }>(`${this.apiUrl}/commandesList/${clientId}`);
}

  getCommandesByVendeur(vendeurId: string): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}/vendeur/${vendeurId}`);
  }

  /** ✅ Get commandes for a specific boutique */
  getCommandesByBoutique(boutiqueId: string): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}/boutique/${boutiqueId}`);
  }

  /** ✅ Get detail of a single commande */
  getCommandeById(commandeId: string): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${commandeId}`);
  }

  /** ✅ Mark a commande as "preparer" */
  preparerCommande(commandeId: string): Observable<Commande> {
    return this.http.patch<Commande>(
      `${this.apiUrl}/preparer/${commandeId}`,
      {}
    );
  }

  /** ✅ Update the status of a commande */
  updateCommandeStatus(
    commandeId: string,
    newStatus: CmdStatus
  ): Observable<Commande> {
    return this.http.patch<Commande>(`${this.apiUrl}/status/${commandeId}`, {
      status: newStatus,
    });
  }

  /** Optional: if you want status filtering by your backend */
  getCommandesByStatus(status: CmdStatus): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}?status=${status}`);
  }

  /** Optional: create commande */
  createCommande(commande: Partial<Commande>): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, commande);
  }

  /** Optional: delete commande */
  deleteCommande(commandeId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commandeId}`);
  }


   getStatsByBoutique(vendeurId: string) {
    return this.http.get<{ stats: { boutique: string, count: number }[] }>(
      `${this.apiUrl}/stats/vendeur/${vendeurId}`
    );
  }

//   getStatsByBoutiqueAndMonth(vendeurId: string, month: string) {
//   // Exemple d'endpoint : /commandes/stats?vendeurId=XXX&month=2025-11
//   return this.http.get<{ stats: { boutique: string; count: number }[] }>(
//     `${this.apiUrl}/commandes/stats?vendeurId=${vendeurId}&month=${month}`
//   );
// }
// commande-service.ts
// getStatsByBoutiqueAndMonth(vendeurId: string, year: number, month: number) {
//   return this.http.get<{ stats: { boutique: string; count: number }[] }>(
//     `${this.apiUrl}/stats/vendeur/${vendeurId}?year=${year}&month=${month}`
//   );
// }
// commande-service.ts
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


