import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService, RegisterData } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
})
export class RegisterComponent {
  // Form data
  nom = '';
  prenom = '';
  email = '';
  password = '';
  confirmPassword = '';
  telephone = '';
  adresse = '';
  role: 'CLIENT' | 'VENDEUR' | 'LIVREUR' = 'CLIENT';

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  roles = [
    { value: 'CLIENT', label: 'Client', icon: 'fa-user', description: 'Acheter des produits' },
    { value: 'VENDEUR', label: 'Vendeur', icon: 'fa-store', description: 'Vendre des produits' },
    { value: 'LIVREUR', label: 'Livreur', icon: 'fa-truck', description: 'Livrer des commandes' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    // Validation
    if (!this.nom || !this.prenom || !this.email || !this.password || !this.telephone || !this.adresse) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Adresse email invalide.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registerData: RegisterData = {
      nom: this.nom,
      prenom: this.prenom,
      email: this.email,
      PWD: this.password,
      telephone: this.telephone,
      adresse: this.adresse,
      role: this.role
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Inscription réussie:', response);
        this.isLoading = false;
        this.successMessage = 'Compte créé avec succès ! Redirection...';
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Erreur inscription:', err);
        this.isLoading = false;
        
        if (err.status === 400) {
          this.errorMessage = err.error.message || 'Email déjà utilisé.';
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur.';
        } else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}