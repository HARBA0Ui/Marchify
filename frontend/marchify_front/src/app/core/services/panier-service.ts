import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Panier } from '../models/panier';

@Injectable({
  providedIn: 'root'
})
export class PanierService { // Fixed: class name should be PascalCase
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/paniers';

  getPanier(): Observable<Panier[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(paniers => paniers.map(panier => ({
        ...panier,
        dateMaj: new Date(panier.dateMaj) // Convert string to Date
      })))
    );
  }

  confirmerCommande(panier: Panier): void {
    const nouvelleCommande = {
      id: Date.now().toString(),
      produits: panier.produits,
      total: panier.total,
      dateCommande: new Date().toISOString(),
      status: 'PENDING'
    };

    const commandesExistantes = JSON.parse(localStorage.getItem('commandes') || '[]');
    commandesExistantes.push(nouvelleCommande);
    localStorage.setItem('commandes', JSON.stringify(commandesExistantes));

    console.log('✅ Commande enregistrée localement :', nouvelleCommande);
  }
}