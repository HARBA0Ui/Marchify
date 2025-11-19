import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande } from '../models/commande';

@Injectable({
  providedIn: 'root',
})
export class LivreurService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/livreur';

  // 🔹 Get all available missions
  getMissionsDisponibles(): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.apiUrl}/missions`);
  }

  // 🔹 Accept a mission
  accepterMission(livreurId: string, commandeId: string): Observable<Commande> {
    return this.http.patch<Commande>(
      `${this.apiUrl}/missions/accepter/${livreurId}/${commandeId}`,
      {}
    );
  }

  // 🔹 Mark mission as delivered
  livrerCommande(commandeId: string): Observable<Commande> {
    return this.http.patch<Commande>(
      `${this.apiUrl}/missions/delivered/${commandeId}`,
      {}
    );
  }

  // 🔹 Refuse a mission
  refuserMission(commandeId: string): Observable<Commande> {
    return this.http.patch<Commande>(
      `${this.apiUrl}/missions/refuser/${commandeId}`,
      {}
    );
  }
}
