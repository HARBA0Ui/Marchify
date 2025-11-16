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
}
