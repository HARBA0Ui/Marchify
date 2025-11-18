import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification-service';
import { PanierService } from '../../core/services/panier';
import { Observable } from 'rxjs';
import { AuthService, AuthState } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.css',
})
export class NavbarComponent implements OnInit {
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private panierService = inject(PanierService);
  private authService = inject(AuthService);

  isMobileMenuOpen = false;
  activeDropdown: string | null = null;

  get unreadCount(): number {
    return this.notificationService.unreadCount();
  }
  // observable du nombre d'articles dans le panier
  cartCount$!: Observable<number>;

  // 🔹 observable de l'état auth
  authState$!: Observable<AuthState>;

  navItems: NavItem[] = [
    {
      label: 'Accueil',
      path: '/product-list',
      icon: 'fas fa-home',
    },
    {
      label: 'Boutiques',
      path: '/shop-list',
      icon: 'fas fa-store',
    },
    {
      label: 'Livraison',
      path: '#',
      icon: 'fas fa-shipping-fast',
      children: [
        {
          label: 'Mes missions',
          path: '/delivery/missions',
          icon: 'fas fa-tasks',
        },
        {
          label: 'Carte',
          path: '/delivery/map',
          icon: 'fas fa-map-marked-alt',
        },
        {
          label: 'Confirmer livraison',
          path: '/bondelivraison',
          icon: 'fas fa-check-circle',
        },
      ],
    },
    {
      label: 'Recherche IA',
      path: '/ai-search/upload-predict',
      icon: 'fas fa-brain',
    },
  ];

  ngOnInit() {
    // Load notifications when component initializes
    this.loadNotifications();
  }

  loadNotifications(): void {
    // Replace with actual user ID from your auth service
    const userId = '691a32b256ab8476dc908dc3';
    this.notificationService.getNotifications(userId).subscribe();
    this.cartCount$ = this.panierService.cartCount$;
    // 🔹 on s'abonne à l'état auth
    this.authState$ = this.authService.authState$;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleDropdown(label: string) {
    this.activeDropdown = this.activeDropdown === label ? null : label;
  }

  closeDropdown() {
    this.activeDropdown = null;
  }

  navigateToCart() {
    this.router.navigate(['/panier-list']);
  }

  navigateToNotifications() {
    this.router.navigate(['/notifications']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        // pas besoin de refreshAuthState, le BehaviorSubject s'en charge
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erreur logout:', err);
        // l'état auth a déjà été nettoyé dans clearSession
        this.router.navigate(['/login']);
      },
    });
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.activeDropdown = null;
  }
}
