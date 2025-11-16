import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  PWD: string;
  telephone: string;
  adresse: string;
  role: 'CLIENT' | 'VENDEUR' | 'LIVREUR';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { 
      email, 
      PWD: password 
    });
  }

  register(userData: RegisterData): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }
}