import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CircleAlert,
  FolderKanban,
  CalendarDays,
  Megaphone,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const ICON_MAP = {
  LayoutDashboard,
  CircleAlert,
  FolderKanban,
  CalendarDays,
  Megaphone,
  Bell,
  User,
  LogOut,
};

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { id: "complaints", label: "My Complaints", icon: "CircleAlert" },
  { id: "projects", label: "Projects", icon: "FolderKanban" },
  { id: "meetings", label: "Meetings", icon: "CalendarDays" },
  { id: "announcements", label: "Announcements", icon: "Megaphone" },
  { id: "notifications", label: "Notifications", icon: "Bell" },
  { id: "profile", label: "My Profile", icon: "User" },
  { id: "logout", label: "Logout", icon: "LogOut" },
];

function CitizenSidebar({ activeItem, onItemClick, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  return (
    <>
      {mobileOpen ? <button className="sidebar-backdrop" onClick={onCloseMobile} aria-label="Close menu" /> : null}

      <motion.aside
        className={`sidebar citizen-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <div className="sidebar-head">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <LayoutDashboard size={18} />
            </div>
            {!collapsed ? <span>Citizen Portal</span> : null}
          </div>

          <div className="sidebar-head-actions">
            <button className="icon-btn soft" onClick={onToggleCollapse} aria-label="Toggle sidebar">
              <Menu size={16} />
            </button>
            <button className="icon-btn soft mobile-only" onClick={onCloseMobile} aria-label="Close menu">
              <X size={16} />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => {
            const Icon = ICON_MAP[item.icon] || LayoutDashboard;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                onClick={() => onItemClick(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} />
                {!collapsed ? <span>{item.label}</span> : null}
              </button>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
}

export default CitizenSidebar;
