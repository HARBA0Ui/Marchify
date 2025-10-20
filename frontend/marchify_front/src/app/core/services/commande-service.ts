import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CmdStatus, Commande } from '../models/commande';

@Injectable({
  providedIn: 'root',
})
export class CommandeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/commandes';

  // Get all commandes
  getAllCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.apiUrl);
  }

  // Get commandes by vendeur boutiques
  getCommandesByVendeur(vendeurId: string): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}?vendeurId=${vendeurId}`);
  }

  // Get commandes by boutique
  getCommandesByBoutique(boutiqueId: string): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}?boutiqueId=${boutiqueId}`);
  }

  // Get commandes by status
  getCommandesByStatus(status: CmdStatus): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}?status=${status}`);
  }

  // Get single commande by ID
  getCommandeById(id: string): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }

  // Update commande status
  updateCommandeStatus(id: string, status: CmdStatus): Observable<Commande> {
    return this.http.patch<Commande>(`${this.apiUrl}/${id}`, { status });
  }

  // Create commande from panier
  createCommande(commande: Partial<Commande>): Observable<Commande> {
    return this.http.post<Commande>(this.apiUrl, commande);
  }

  // Delete commande
  deleteCommande(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
