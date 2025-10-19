import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Shop } from '../models/shop';
import { ShopCreateRequest } from '../models/shop-create-request';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000'; // JSON Server URL

  // Get all shops
  getShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(`${this.apiUrl}/boutiques`);
  }

  // Get shops by vendeur ID
  getShopsByVendeurId(vendeurId: string): Observable<Shop[]> {
    return this.http.get<Shop[]>(
      `${this.apiUrl}/boutiques?vendeurId=${vendeurId}`
    );
  }

  // Get shop by ID
  getShopById(id: string): Observable<Shop> {
    return this.http.get<Shop>(`${this.apiUrl}/boutiques/${id}`);
  }

  // Create a new shop
  createShop(shopData: ShopCreateRequest): Observable<Shop> {
    return this.http.post<Shop>(`${this.apiUrl}/boutiques`, shopData);
  }

  // Update shop
  updateShop(id: string, shopData: Partial<Shop>): Observable<Shop> {
    return this.http.patch<Shop>(`${this.apiUrl}/boutiques/${id}`, shopData);
  }

  // Delete shop
  deleteShop(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/boutiques/${id}`);
  }
}
