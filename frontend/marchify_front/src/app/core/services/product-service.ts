import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { ProductCreateRequest } from '../models/product-create-request';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/produits'; // matches your Express routes

  // 🔹 Get all products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // 🔹 Get product by ID
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
  getProductsByShopId(shopId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/shop/${shopId}`);
  }

  getProductsByIds(ids: string[]): Observable<Product[]> {
    return this.http.post<Product[]>(`${this.apiUrl}/batch`, ids);
  }
  createProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, formData);
  }

  // 🔹 Update product
  updateProduct(
    id: string,
    productData: Partial<Product>
  ): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, productData);
  }

  // 🔹 Delete product (if you add backend support later)
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 🔹 Optional: search products (if backend supports query)
  searchProducts(searchTerm: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}?q=${searchTerm}`);
  }
}
