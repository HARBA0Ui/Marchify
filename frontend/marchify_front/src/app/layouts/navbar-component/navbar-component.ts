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

interface DropdownItem {
  label: string;
  path: string;
  icon: string;
  roles: string[]; // Which roles can see this item
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
  isUserDropdownOpen = false; // 🔹 New: User dropdown state

  get unreadCount(): number {
    return this.notificationService.unreadCount();
  }

  cartCount$!: Observable<number>;
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

  // 🔹 Role-specific dropdown menu items
  userDropdownItems: DropdownItem[] = [
    // Buyer/Client items
    {
      label: 'Mes commandes',
      path: '/client/ordersList',
      icon: 'fas fa-receipt',
      roles: ['acheteur', 'client'],
    },

    {
      label: 'Mon panier',
      path: '/panier-list',
      icon: 'fas fa-shopping-cart',
      roles: ['acheteur', 'client'],
    },
    // Seller/Vendor items
    {
      label: 'creer un boutique',
      path: '/seller/shop-creation',
      icon: 'fas fa-store',
      roles: ['vendeur', 'seller'],
    },
    {
      label: 'Mes boutiques',
      path: 'seller/shop-list',
      icon: 'fas fa-box',
      roles: ['vendeur', 'seller'],
    },
    {
      label: 'Commandes reçues',
      path: 'commande-list-vendor',
      icon: 'fas fa-clipboard-list',
      roles: ['vendeur', 'seller'],
    },
    {
      label: 'Ajouter produit',
      path: '/seller/product-add',
      icon: 'fas fa-plus-circle',
      roles: ['vendeur', 'seller'],
    },
    // Delivery items
    {
      label: 'Mes livraisons',
      path: '/livreur/deliveries',
      icon: 'fas fa-truck',
      roles: ['livreur', 'delivery'],
    },
    {
      label: 'Missions',
      path: '/delivery/missions',
      icon: 'fas fa-tasks',
      roles: ['livreur', 'delivery'],
    },
    {
      label: 'Carte',
      path: '/delivery/map',
      icon: 'fas fa-map-marked-alt',
      roles: ['livreur', 'delivery'],
    },
  ];

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const userId = '691a32b256ab8476dc908dc3';
    this.notificationService.getNotifications(userId).subscribe();
    this.cartCount$ = this.panierService.cartCount$;
    this.authState$ = this.authService.authState$;
  }

  // 🔹 Filter dropdown items based on user role
  getFilteredDropdownItems(role: string | null | undefined): DropdownItem[] {
    if (!role) return [];
    return this.userDropdownItems.filter((item) =>
      item.roles.includes(role.toLowerCase())
    );
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleDropdown(label: string) {
    this.activeDropdown = this.activeDropdown === label ? null : label;
  }

  // 🔹 Toggle user dropdown
  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  // 🔹 Close user dropdown
  closeUserDropdown() {
    this.isUserDropdownOpen = false;
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
        this.closeUserDropdown();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Erreur logout:', err);
        this.router.navigate(['/login']);
      },
    });
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.activeDropdown = null;
    this.isUserDropdownOpen = false;
  }
}
