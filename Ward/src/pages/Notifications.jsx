import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Check,
  FileText,
  DollarSign,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import { getBursaryNotifications, markBursaryNotificationAsRead } from "../services/bursaryApi";

const NOTIFICATION_ICONS = {
  application_submitted: FileText,
  application_approved: CheckCircle,
  application_rejected: AlertTriangle,
  payment_processed: DollarSign,
  documents_required: FileText,
  announcement: Info,
  default: Bell,
};

const NOTIFICATION_COLORS = {
  application_submitted: "bg-blue-100 text-blue-700",
  application_approved: "bg-green-100 text-green-700",
  application_rejected: "bg-red-100 text-red-700",
  payment_processed: "bg-emerald-100 text-emerald-700",
  documents_required: "bg-yellow-100 text-yellow-700",
  announcement: "bg-purple-100 text-purple-700",
  default: "bg-gray-100 text-gray-700",
};

function Notifications({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState("notifications");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const currentDate = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const breadcrumb = ["Dashboard", "Notifications"];

  const handleItemClick = (id) => {
    if (id === "logout") {
      onLogout();
      return;
    }
    if (id === "dashboard") {
      navigate("/dashboard");
      return;
    }
    if (id === "images") {
      navigate("/images");
      return;
    }
    if (id === "citizens") {
      navigate("/citizens");
      return;
    }
    if (id === "complaints") {
      navigate("/complaints");
      return;
    }
    if (id === "bursary") {
      navigate("/bursary");
      return;
    }
    if (id === "beneficiaries") {
      navigate("/beneficiaries");
      return;
    }
    if (id === "payments") {
      navigate("/payments");
      return;
    }
    if (id === "bursary-programs") {
      navigate("/bursary-programs");
      return;
    }
    if (id === "projects") {
      navigate("/projects");
      return;
    }
    if (id === "meetings") {
      navigate("/meetings");
      return;
    }
    if (id === "staff") {
      navigate("/staff");
      return;
    }
    if (id === "budget") {
      navigate("/budget");
      return;
    }
    if (id === "reports") {
      navigate("/reports");
      return;
    }
    if (id === "notifications") {
      navigate("/notifications");
      return;
    }
    if (id === "settings") {
      navigate("/settings");
      return;
    }
    setActiveItem(id);
    setMobileOpen(false);
  };

  async function loadNotifications() {
    setLoading(true);
    try {
      const data = await getBursaryNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleMarkAsRead(id) {
    try {
      await markBursaryNotificationAsRead(id);
      await loadNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className={`dashboard-shell ${isDarkMode ? "dark-mode" : ""}`}>
      <Sidebar
        activeItem={activeItem}
        onItemClick={handleItemClick}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        userRole={user?.role}
      />

      <div className="dashboard-main">
        <TopNavbar
          breadcrumb={breadcrumb}
          currentDate={currentDate}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <motion.main
          className="bursary-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <section className="panel-card" style={{ marginBottom: "24px" }}>
            <div className="card-title-row">
              <h3>Notifications</h3>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={{ padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread ({unreadCount})</option>
                  <option value="application_submitted">Applications</option>
                  <option value="application_approved">Approvals</option>
                  <option value="application_rejected">Rejections</option>
                  <option value="payment_processed">Payments</option>
                  <option value="documents_required">Documents</option>
                  <option value="announcement">Announcements</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading-screen">
                <p>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                <Bell size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                <p>No notifications found.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredNotifications.map((notification, index) => {
                  const IconComponent = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default;
                  const colorClass = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.default;
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        padding: "16px",
                        borderRadius: "8px",
                        backgroundColor: notification.isRead ? "#f8fafc" : "#eff6ff",
                        border: `1px solid ${notification.isRead ? "#e2e8f0" : "#bfdbfe"}`,
                      }}
                    >
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        ...colorClass,
                      }}>
                        <IconComponent size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <h4 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>{notification.title}</h4>
                          {!notification.isRead && (
                            <span style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor: "#3b82f6",
                              flexShrink: 0,
                            }} />
                          )}
                        </div>
                        <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 8px 0" }}>{notification.message}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>{formatDate(notification.createdAt)}</span>
                          {!notification.isRead && (
                            <button
                              className="icon-btn soft"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="Mark as read"
                              style={{ fontSize: "12px", padding: "4px 8px" }}
                            >
                              <Check size={14} />
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </motion.main>

        <footer className="dashboard-footer">
          <p>© 2026 Advenware. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default Notifications;
