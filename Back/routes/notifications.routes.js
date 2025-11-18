import express from "express";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
} from "../controllers/notifications.controller.js";

const router = express.Router();

// Get all notifications for a user
// Query params: ?limit=20&unreadOnly=true
router.get("/:userId", getNotifications);

// Get unread count
router.get("/:userId/unread/count", getUnreadNotificationCount);

// Mark notification as read
router.patch("/:userId/:notificationId/read", markNotificationAsRead);

// Mark all as read
router.patch("/:userId/read-all", markAllNotificationsAsRead);

// Delete notification
router.delete("/:userId/:notificationId", deleteNotificationById);

export default router;
