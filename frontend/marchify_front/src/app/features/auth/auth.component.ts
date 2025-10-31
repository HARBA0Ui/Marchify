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
      next: (user: User) => {
        console.log('Utilisateur connecté :', user);
        localStorage.setItem('user', JSON.stringify(user));

        if (user.role === 'LIVREUR') this.router.navigate(['/missions']);
        else if (user.role === 'VENDEUR') this.router.navigate(['/ventes']);
        else this.router.navigate(['/']);
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = 'Email ou mot de passe incorrect.';
      },
    });
  }
}
