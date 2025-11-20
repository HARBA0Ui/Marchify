import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande } from '../models/commande';
import { BonDeLivraison } from '../models/bondelivraison';

@Injectable({
  providedIn: 'root',
})
export class LivreurService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/livreur';

  // 🔹 Get all available missions
  getMissionsDisponibles(): Observable<BonDeLivraison[]> {
    return this.http.get<BonDeLivraison[]>(`${this.apiUrl}/missions`);
  }

  // 🔹 Accept a mission
  accepterMission(livreurId: string, bonId: string): Observable<BonDeLivraison> {
    return this.http.patch<BonDeLivraison>(
      `${this.apiUrl}/missions/accepter/${livreurId}/${bonId}`,
      {}
    );
  }

  // 🔹 Mark mission as delivered
  livrerCommande(commandeId: string): Observable<BonDeLivraison> {
    return this.http.patch<BonDeLivraison>(
      `${this.apiUrl}/missions/delivered/${commandeId}`,
      {}
    );
  }

  // 🔹 Refuse a mission
  refuserMission(commandeId: string): Observable<BonDeLivraison> {
    return this.http.patch<BonDeLivraison>(
      `${this.apiUrl}/missions/refuser/${commandeId}`,
      {}
    );
  }
}
