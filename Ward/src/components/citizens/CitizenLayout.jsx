import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CitizenSidebar from "./CitizenSidebar";
import CitizenHeader from "./CitizenHeader";

function normalizeRole(role) {
  if (!role) return "citizen";
  return String(role).toLowerCase().trim();
}

function CitizenLayout({ children, activeItem, onItemClick, breadcrumb }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-KE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    []
  );

  const handleItemClick = (id) => {
    if (id === "logout") {
      logout();
      return;
    }
    onItemClick(id);
    setMobileOpen(false);
  };

  // Only allow citizen role
  if (normalizeRole(user?.role) !== "citizen") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className={`dashboard-shell citizen-dashboard-shell ${isDarkMode ? "dark-mode" : ""}`}>
      <CitizenSidebar
        activeItem={activeItem}
        onItemClick={handleItemClick}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="dashboard-main citizen-dashboard-main">
        <CitizenHeader
          breadcrumb={breadcrumb}
          currentDate={currentDate}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          onOpenMobileMenu={() => setMobileOpen(true)}
          userName={user?.fullName || "Citizen"}
          userRole={user?.ward ? `Ward: ${user.ward}` : "Ward Resident"}
        />

        <motion.main
          className="citizen-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>

        <footer className="dashboard-footer citizen-footer">
          <p>© 2026 Advenware. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default CitizenLayout;
