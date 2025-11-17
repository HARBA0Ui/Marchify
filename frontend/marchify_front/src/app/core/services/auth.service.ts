import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  PWD: string;
  telephone: string;
  adresse: string;
  role: 'CLIENT' | 'VENDEUR' | 'LIVREUR';
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: 'CLIENT' | 'VENDEUR' | 'LIVREUR' | string;
  };
  token: string;
}

export interface AuthState {
  isLogged: boolean;
  user: any | null;
  role: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users';
  private tokenKey = 'auth_token';
  private userKey = 'user';

  // 🔹 Observable de l'état d'authentification
  private authStateSubject = new BehaviorSubject<AuthState>(
    this.getInitialAuthState()
  );
  authState$ = this.authStateSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Calculer l'état initial depuis le localStorage
  private getInitialAuthState(): AuthState {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);
    const user = userStr ? JSON.parse(userStr) : null;

    return {
      isLogged: !!token,
      user,
      role: user?.role || null,
    };
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      PWD: password,
    }).pipe(
      tap((resp) => {
        this.setSession(resp.token, resp.user);
      })
    );
  }

  register(userData: RegisterData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, userData).pipe(
      tap((resp) => {
        this.setSession(resp.token, resp.user);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearSession();
      })
    );
  }

  private setSession(token: string, user: any): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    
    // 🔹 Émettre le nouvel état
    this.authStateSubject.next({
      isLogged: true,
      user,
      role: user.role,
    });
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    
    // 🔹 Émettre l'état déconnecté
    this.authStateSubject.next({
      isLogged: false,
      user: null,
      role: null,
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }
}
