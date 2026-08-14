import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { sidebarItems } from "../../data/dashboardData";

const ICON_MAP = {
  LayoutDashboard,
  Users,
  Megaphone,
  GraduationCap,
  Building2,
  CalendarDays,
  BriefcaseBusiness,
  Wallet,
  FileText,
  Settings,
  LogOut,
};

function Sidebar({ activeItem, onItemClick, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  return (
    <>
      {mobileOpen ? <button className="sidebar-backdrop" onClick={onCloseMobile} aria-label="Close menu" /> : null}

      <motion.aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <div className="sidebar-head">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <Building2 size={18} />
            </div>
            {!collapsed ? <span>Women Repsentative system</span> : null}
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

export default Sidebar;
