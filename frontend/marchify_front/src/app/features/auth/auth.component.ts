import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
})
export class AuthComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        console.log('Réponse complète:', response);
        
        const user = response.user;
        console.log('Utilisateur:', user);
        
        localStorage.setItem('user', JSON.stringify(user));
        this.isLoading = false;

        // Redirect based on role
        if (user.role === 'LIVREUR') {
          this.router.navigate(['/delivery/missions']);
        } else if (user.role === 'VENDEUR') {
          this.router.navigate(['/seller/shop-creation']);
        } else if (user.role === 'CLIENT') {
          this.router.navigate(['/product-list']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err: any) => {
        console.error('Erreur de connexion :', err);
        this.isLoading = false;
        
        if (err.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect.';
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      },
    });
  }
}