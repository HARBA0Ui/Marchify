import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { NotificationItem } from '../models/notification-item';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/notifications';

  notifications = signal<NotificationItem[]>([]);
  unreadCount = signal<number>(0);

  getNotifications(
    userId: string,
    limit?: number,
    unreadOnly?: boolean
  ): Observable<any> {
    let params = new HttpParams();
    if (limit) params = params.set('limit', limit.toString());
    if (unreadOnly !== undefined)
      params = params.set('unreadOnly', unreadOnly.toString());

    return this.http.get(`${this.apiUrl}/${userId}`, { params }).pipe(
      tap((response: any) => {
        console.log('API Response:', response);

        let notificationsArray: NotificationItem[] = [];

        // Handle different response structures
        if (Array.isArray(response)) {
          // If response is directly an array
          notificationsArray = response;
        } else if (response && typeof response === 'object' && response.id) {
          // If response is a single notification object (your case)
          notificationsArray = [response];
        } else if (response.data && Array.isArray(response.data)) {
          // If response has data property with array
          notificationsArray = response.data;
        } else if (response.data && response.data.id) {
          // If response has data property with single object
          notificationsArray = [response.data];
        } else if (
          response.notifications &&
          Array.isArray(response.notifications)
        ) {
          // If response has notifications property
          notificationsArray = response.notifications;
        }

        console.log('Processed notifications:', notificationsArray);

        // Apply filters
        if (unreadOnly) {
          notificationsArray = notificationsArray.filter(
            (notification) => !notification.read
          );
        }
        if (limit) {
          notificationsArray = notificationsArray.slice(0, limit);
        }

        this.notifications.set(notificationsArray);

        // Update unread count
        const unread = notificationsArray.filter((n) => !n.read).length;
        this.unreadCount.set(unread);
      }),
      catchError((error) => {
        console.error('Error loading notifications:', error);
        this.notifications.set([]);
        this.unreadCount.set(0);
        return of({ error: error.message });
      })
    );
  }

  getUnreadCount(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/unread/count`).pipe(
      tap((response: any) => {
        console.log('Unread count response:', response);

        if (typeof response === 'number') {
          this.unreadCount.set(response);
        } else if (response.count !== undefined) {
          this.unreadCount.set(response.count);
        } else if (response.data?.count !== undefined) {
          this.unreadCount.set(response.data.count);
        } else {
          // Fallback: calculate from local notifications
          const unread = this.notifications().filter((n) => !n.read).length;
          this.unreadCount.set(unread);
        }
      }),
      catchError((error) => {
        console.error('Error loading unread count:', error);
        // Calculate from local notifications if API fails
        const unread = this.notifications().filter((n) => !n.read).length;
        this.unreadCount.set(unread);
        return of({ error: error.message });
      })
    );
  }

  markAsRead(userId: string, notificationId: string): Observable<any> {
    return this.http
      .patch(`${this.apiUrl}/${userId}/${notificationId}/read`, {})
      .pipe(
        tap(() => {
          const notifs = this.notifications();
          const updated = notifs.map((n) => {
            if (n.id === notificationId) {
              return {
                ...n,
                read: true,
                readAt: new Date().toISOString(),
              } as NotificationItem;
            }
            return n;
          });
          this.notifications.set(updated);
          this.unreadCount.set(Math.max(0, this.unreadCount() - 1));
        }),
        catchError((error) => {
          console.error('Error marking as read:', error);
          return of({ error: error.message });
        })
      );
  }

  markAllAsRead(userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/read-all`, {}).pipe(
      tap(() => {
        const notifs = this.notifications();
        const updated = notifs.map(
          (n) =>
            ({
              ...n,
              read: true,
              readAt: new Date().toISOString(),
            } as NotificationItem)
        );
        this.notifications.set(updated);
        this.unreadCount.set(0);
      }),
      catchError((error) => {
        console.error('Error marking all as read:', error);
        return of({ error: error.message });
      })
    );
  }

  deleteNotification(userId: string, notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/${notificationId}`).pipe(
      tap(() => {
        const notifs = this.notifications();
        const notifToDelete = notifs.find((n) => n.id === notificationId);
        const updated = notifs.filter((n) => n.id !== notificationId);
        this.notifications.set(updated);

        if (notifToDelete && !notifToDelete.read) {
          this.unreadCount.set(Math.max(0, this.unreadCount() - 1));
        }
      }),
      catchError((error) => {
        console.error('Error deleting notification:', error);
        return of({ error: error.message });
      })
    );
  }

  getRelativeTime(dateString: string): string {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;

    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      ORDER_PLACED: 'shopping_cart',
      ORDER_CONFIRMED: 'check_circle',
      ORDER_PROCESSING: 'schedule',
      ORDER_READY: 'inventory_2',
      ORDER_SHIPPED: 'local_shipping',
      ORDER_DELIVERED: 'done_all',
      ORDER_CANCELLED: 'cancel',
      ORDER_RETURNED: 'keyboard_return',
      REVIEW_RECEIVED: 'star',
      PRODUCT_LOW_STOCK: 'warning',
      PRODUCT_OUT_OF_STOCK: 'error',
      NEW_PRODUCT_ADDED: 'new_releases',
      DELIVERY_ASSIGNED: 'assignment',
      DELIVERY_PICKED_UP: 'fact_check',
      DELIVERY_FAILED: 'error_outline',
      PROMO_ALERT: 'local_offer',
      SYSTEM_ANNOUNCEMENT: 'campaign',
    };
    return icons[type] || 'notifications';
  }

  getColor(priority: string): string {
    const colors: Record<string, string> = {
      URGENT: '#dc2626',
      HIGH: '#f59e0b',
      MEDIUM: '#3b82f6',
      LOW: '#6b7280',
    };
    return colors[priority] || '#6b7280';
  }

  clearNotifications(): void {
    this.notifications.set([]);
    this.unreadCount.set(0);
  }
}
