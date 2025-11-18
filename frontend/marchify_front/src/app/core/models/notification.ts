export interface Notification {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
  userId: string;
  actionUrl?: string;
  metadata?: any;
}
