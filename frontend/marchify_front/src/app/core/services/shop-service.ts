import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { Shop } from '../models/shop';
import { ShopCreateRequest } from '../models/shop-create-request';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/boutiques'; // ✅ backend route

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }

  /** ✅ Create boutique */
  createShop(shopData: ShopCreateRequest): Observable<Shop> {
    return this.http
      .post<Shop>(this.apiUrl, shopData)
      .pipe(catchError(this.handleError<Shop>('createBoutique')));
  }

  /** ✅ Get all boutiques */
  getAllShops(): Observable<Shop[]> {
    return this.http
      .get<Shop[]>(this.apiUrl)
      .pipe(catchError(this.handleError<Shop[]>('getBoutiques', [])));
  }

  /** ✅ Get boutique by ID */
  getShopById(id: string): Observable<Shop> {
    return this.http
      .get<Shop>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError<Shop>('getBoutiqueById')));
  }

  /** ✅ Update boutique */
  updateShop(id: string, shopData: Partial<Shop>): Observable<Shop> {
    return this.http
      .put<Shop>(`${this.apiUrl}/${id}`, shopData)
      .pipe(catchError(this.handleError<Shop>('updateBoutique')));
  }

  /** ✅ Delete boutique */
  deleteShop(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError<void>('deleteShop')));
  }
  getShopsByVendeurId(vendeurId: string): Observable<Shop[]> {
    return this.http
      .get<Shop[]>(`${this.apiUrl}/vendeur/${vendeurId}`)
      .pipe(catchError(this.handleError<Shop[]>('getShopsByVendeurId', [])));
  }
}
