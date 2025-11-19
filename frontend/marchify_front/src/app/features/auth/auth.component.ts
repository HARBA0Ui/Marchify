import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true,
  imports: [FormsModule],
})
export class AuthComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        const user = response.user;
        const token = response.token;
  
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
  
        if (user.role === "LIVREUR") this.router.navigate(['/delivery/missions']);
        else if (user.role === "VENDEUR") this.router.navigate(['/seller/shops']);
        else this.router.navigate(['/']);
      },
      error: (err: any) => {
        console.error('Erreur de connexion :', err);
        this.errorMessage = 'Email ou mot de passe incorrect.';
      }
    });
  }
  
}