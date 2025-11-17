import { Component, inject, OnInit, signal } from '@angular/core';
import { NotificationService } from '../../core/services/notification-service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-notifications-list',
  imports: [],
  templateUrl: './notifications-list.html',
  styleUrl: './notifications-list.css',
})
export class NotificationsList implements OnInit {
  private readonly userId = '691259fd5e08abebfcab3400';

  notificationService = inject(NotificationService);
  isLoading = signal(false);
  error = signal<string | null>(null);
  currentFilter = signal<'all' | 'unread'>('all');

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.notificationService
      .getNotifications(this.userId, 50, this.currentFilter() === 'unread')
      .pipe(
        catchError((err) => {
          console.error('Error loading notifications:', err);
          this.error.set('Erreur lors du chargement des notifications');
          return of(null);
        }),
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe();
  }

  markAsRead(notificationId: string): void {
    this.notificationService
      .markAsRead(this.userId, notificationId)
      .pipe(
        catchError((err) => {
          console.error('Error marking notification as read:', err);
          this.error.set('Erreur lors du marquage comme lu');
          return of(null);
        })
      )
      .subscribe();
  }

  markAllAsRead(): void {
    if (this.notificationService.unreadCount() === 0) return;

    this.notificationService
      .markAllAsRead(this.userId)
      .pipe(
        catchError((err) => {
          console.error('Error marking all notifications as read:', err);
          this.error.set('Erreur lors du marquage de tous comme lus');
          return of(null);
        })
      )
      .subscribe();
  }

  deleteNotification(notificationId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      this.notificationService
        .deleteNotification(this.userId, notificationId)
        .pipe(
          catchError((err) => {
            console.error('Error deleting notification:', err);
            this.error.set('Erreur lors de la suppression');
            return of(null);
          })
        )
        .subscribe();
    }
  }

  onFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentFilter.set(select.value as 'all' | 'unread');
    this.loadNotifications();
  }

  getTypeLabel(type: string): string {
    const typeLabels: Record<string, string> = {
      ORDER_PLACED: 'Nouvelle commande',
      ORDER_CONFIRMED: 'Commande confirmée',
      ORDER_PROCESSING: 'Commande en traitement',
      ORDER_READY: 'Commande prête',
      ORDER_SHIPPED: 'Commande expédiée',
      ORDER_DELIVERED: 'Commande livrée',
      ORDER_CANCELLED: 'Commande annulée',
      ORDER_RETURNED: 'Commande retournée',
      REVIEW_RECEIVED: 'Avis reçu',
      PRODUCT_LOW_STOCK: 'Stock faible',
      PRODUCT_OUT_OF_STOCK: 'Stock épuisé',
      NEW_PRODUCT_ADDED: 'Nouveau produit',
      DELIVERY_ASSIGNED: 'Livraison assignée',
      DELIVERY_PICKED_UP: 'Colis récupéré',
      DELIVERY_FAILED: 'Échec livraison',
      PROMO_ALERT: 'Promotion',
      SYSTEM_ANNOUNCEMENT: 'Annonce système',
    };
    return typeLabels[type] || type;
  }

  getPriorityLabel(priority: string): string {
    const priorityLabels: Record<string, string> = {
      URGENT: 'Urgent',
      HIGH: 'Élevée',
      MEDIUM: 'Moyenne',
      LOW: 'Basse',
    };
    return priorityLabels[priority] || priority;
  }
}
