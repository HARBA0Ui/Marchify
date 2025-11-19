import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

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
export class NavbarComponent {
  private router = inject(Router);
  
  isMobileMenuOpen = false;
  activeDropdown: string | null = null;

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

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.activeDropdown = null;
  }
}