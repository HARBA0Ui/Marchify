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
  private apiUrl = 'http://localhost:3000'; // JSON Server URL

  // Get all products
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/produits`);
  }

  // Get products by boutique ID
  getProductsByBoutiqueId(boutiqueId: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.apiUrl}/produits?boutiqueId=${boutiqueId}`
    );
  }

  // Get product by ID
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/produits/${id}`);
  }

  

  // Create a new product
  createProduct(productData: ProductCreateRequest): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/produits`, productData);
  }

  // Update product
  updateProduct(
    id: string,
    productData: Partial<Product>
  ): Observable<Product> {
    return this.http.patch<Product>(
      `${this.apiUrl}/produits/${id}`,
      productData
    );
  }

  // Delete product
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/produits/${id}`);
  }

  // Search products by name or category
  searchProducts(searchTerm: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/produits?q=${searchTerm}`);
  }




}
