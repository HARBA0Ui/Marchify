import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteNotification,
} from "../services/notification.service.js";

// Get all notifications for a user
export async function getNotifications(req, res) {
  try {
    const { userId } = req.params;
    console.log("userId: ", userId)
    const { limit, unreadOnly } = req.query;

    const notifications = await getUserNotifications(userId, {
      limit: limit ? parseInt(limit) : 20,
      unreadOnly: unreadOnly === "true",
    });

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: error.message });
  }
}

// Get unread count
export async function getUnreadNotificationCount(req, res) {
  try {
    const { userId } = req.params;
    const count = await getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ error: error.message });
  }
}

// Mark notification as read
export async function markNotificationAsRead(req, res) {
  try {
    const { userId, notificationId } = req.params;
    await markAsRead(notificationId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: error.message });
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(req, res) {
  try {
    const { userId } = req.params;
    await markAllAsRead(userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ error: error.message });
  }
}

// Delete a notification
export async function deleteNotificationById(req, res) {
  try {
    const { userId, notificationId } = req.params;
    await deleteNotification(notificationId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: error.message });
  }
}
