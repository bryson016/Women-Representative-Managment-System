import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Filter } from "lucide-react";
import CitizenLayout from "../../components/citizens/CitizenLayout";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../services/citizenApi";

function CitizenNotifications() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("notifications");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await getNotifications();
        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.isRead);
    } else if (filter === "read") {
      return notifications.filter((n) => n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const breadcrumb = ["Dashboard", "Notifications"];

  const handleItemClick = (id) => {
    setActiveItem(id);
    switch (id) {
      case "dashboard":
        navigate("/citizen/dashboard");
        break;
      case "complaints":
        navigate("/citizen/complaints");
        break;
      case "projects":
        navigate("/citizen/projects");
        break;
      case "meetings":
        navigate("/citizen/meetings");
        break;
      case "announcements":
        navigate("/citizen/announcements");
        break;
      case "notifications":
        navigate("/citizen/notifications");
        break;
      case "profile":
        navigate("/citizen/profile");
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "Complaint_Update":
        return "📋";
      case "Meeting_Reminder":
        return "📅";
      case "Project_Update":
        return "🏗️";
      case "Announcement":
        return "📢";
      default:
        return "🔔";
    }
  };

  return (
    <CitizenLayout activeItem={activeItem} onItemClick={handleItemClick} breadcrumb={breadcrumb}>
      {/* Actions Bar */}
      <div className="citizen-actions-bar">
        <div className="citizen-filter-tabs">
          <button
            className={`citizen-filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({notifications.length})
          </button>
          <button
            className={`citizen-filter-tab ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </button>
          <button
            className={`citizen-filter-tab ${filter === "read" ? "active" : ""}`}
            onClick={() => setFilter("read")}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>
        {unreadCount > 0 && (
          <button className="gov-btn gov-btn-secondary" onClick={handleMarkAllAsRead}>
            <CheckCheck size={18} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="loading-screen">
          <p>Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <motion.div
          className="panel-card empty-state-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="empty-state">
            <div className="empty-illustration">
              <Bell size={64} strokeWidth={1} />
            </div>
            <h3>No notifications</h3>
            <p>You're all caught up! No notifications to show.</p>
          </div>
        </motion.div>
      ) : (
        <div className="citizen-notifications-list">
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              className={`citizen-notification-card ${!notification.isRead ? "unread" : ""}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ y: -2 }}
            >
              <div className="citizen-notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="citizen-notification-content">
                <div className="citizen-notification-header">
                  <h4>{notification.title}</h4>
                  {!notification.isRead && <span className="unread-dot" />}
                </div>
                <p>{notification.message}</p>
                <small>
                  {new Date(notification.createdAt).toLocaleDateString("en-KE", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
              {!notification.isRead && (
                <button
                  className="gov-btn gov-btn-ghost"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <CheckCheck size={16} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </CitizenLayout>
  );
}

export default CitizenNotifications;
