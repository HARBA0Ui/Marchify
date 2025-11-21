import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Review {
  id: string;
  type: string;
  rating: number;
  comment: string;
  auteurId: string;
  produitId?: string;
  boutiqueId?: string;
  createdAt: Date;
  auteur?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  addReview(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, payload);
  }

  getBoutiqueReviews(boutiqueId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews/boutique/${boutiqueId}`);
  }

  getProductReviews(produitId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews/product/${produitId}`);
  }

  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${reviewId}`);
  }
}
