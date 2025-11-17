import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification-service';

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

  isMobileMenuOpen = false;
  activeDropdown: string | null = null;

  get unreadCount(): number {
    return this.notificationService.unreadCount();
  }

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

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.activeDropdown = null;
  }
}
