import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id: string;
  type: 'PRODUIT' | 'BOUTIQUE';
  rating: number;
  comment?: string;

  auteur?: {
    id: string;
    nom: string;
    prenom?: string;
    email?: string;
  };

  produitId?: string;
  boutiqueId?: string;
  createdAt?: Date;
}


@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private baseUrl = 'http://localhost:3000/api/reviews';

  constructor(private http: HttpClient) {}

  getProductReviews(produitId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/product/${produitId}`);
  }

  getBoutiqueReviews(boutiqueId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/boutique/${boutiqueId}`);
  }

  addReview(token: string | null, review: any): Observable<any> {
  let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  if (token) headers = headers.set('Authorization', `Bearer ${token}`);
  return this.http.post(this.baseUrl, review, { headers });
}
  

  // Supprimer une review
  deleteReview(token: string, id: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.baseUrl}/${id}`, { headers });
  }
}
