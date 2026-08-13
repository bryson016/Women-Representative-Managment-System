import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import StaffStats from "../components/staff/StaffStats";
import StaffFilters from "../components/staff/StaffFilters";
import StaffTable from "../components/staff/StaffTable";
import StaffModal from "../components/staff/StaffModal";
import StaffDetails from "../components/staff/StaffDetails";
import StaffCharts from "../components/staff/StaffCharts";
import StaffDashboard from "../components/staff/StaffDashboard";
import initialStaff, { departments, roles, statuses } from "../data/staff";
import { villages } from "../data/citizens";

function Staff({ onLogout }) {
  const navigate = useNavigate();

  const [staff, setStaff] = useState(() => {
    const stored = localStorage.getItem("ward-staff");
    return stored ? JSON.parse(stored) : initialStaff;
  });
  const [activeItem, setActiveItem] = useState("staff");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);

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

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("ward-staff", JSON.stringify(staff));
  }, [staff]);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staff.filter((s) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        s.staffId.toLowerCase().includes(term) ||
        s.firstName.toLowerCase().includes(term) ||
        s.lastName.toLowerCase().includes(term) ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(term) ||
        s.phone.includes(term) ||
        s.email.toLowerCase().includes(term);

      const matchesDepartment = !departmentFilter || s.department === departmentFilter;
      const matchesRole = !roleFilter || s.role === roleFilter;
      const matchesStatus = !statusFilter || s.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    });
  }, [staff, searchTerm, departmentFilter, roleFilter, statusFilter]);

  // Stats
  const totalStaff = filteredStaff.length;
  const onDutyCount = filteredStaff.filter((s) => s.status === "On Duty" || s.status === "Field Visit").length;
  const departmentCount = new Set(filteredStaff.map((s) => s.department)).size;
  const avgPerformance = filteredStaff.length > 0
    ? Math.round(filteredStaff.reduce((sum, s) => sum + s.performanceScore, 0) / filteredStaff.length)
    : 0;

  // Handlers
  const handleItemClick = useCallback(
    (id) => {
      if (id === "logout") {
        onLogout();
        return;
      }
      if (id === "dashboard") {
        navigate("/dashboard");
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
      if (id === "projects") {
        navigate("/projects");
        return;
      }
      if (id === "meetings") {
        navigate("/meetings");
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
      if (id === "settings") {
        navigate("/settings");
        return;
      }
      setActiveItem(id);
      setMobileOpen(false);
    },
    [navigate, onLogout]
  );

  const handleRegisterClick = () => {
    setEditingStaff(null);
    setModalOpen(true);
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setModalOpen(true);
  };

  const handleSave = (staffData) => {
    setStaff((prev) => {
      const exists = prev.find((s) => s.id === staffData.id);
      if (exists) {
        return prev.map((s) => (s.id === staffData.id ? staffData : s));
      }
      return [...prev, staffData];
    });
  };

  const handleDelete = (member) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.firstName} ${member.lastName} (${member.staffId})? This action cannot be undone.`
    );
    if (confirmed) {
      setStaff((prev) => prev.filter((s) => s.id !== member.id));
    }
  };

  const handleView = (member) => {
    setViewingStaff(member);
  };

  const handleBack = () => {
    setViewingStaff(null);
  };

  // Export functions
  const exportPdf = () => {
    const tableRows = filteredStaff
      .map(
        (s) =>
          `<tr>
            <td>${s.staffId}</td>
            <td>${s.firstName} ${s.lastName}</td>
            <td>${s.role}</td>
            <td>${s.department}</td>
            <td>${s.phone}</td>
            <td>${s.email}</td>
            <td>${s.status}</td>
            <td>${s.performanceScore}%</td>
            <td>${s.workload}</td>
            <td>${s.villagesCovered.join(", ")}</td>
          </tr>`
      )
      .join("");

    const html = `
      <html>
        <head><title>Staff Export</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #006b3c; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
          th { background: #006b3c; color: white; }
        </style>
        </head>
        <body>
          <h1>Staff Directory - Ward Management System</h1>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead><tr>
              <th>Staff ID</th><th>Full Name</th><th>Role</th><th>Department</th>
              <th>Phone</th><th>Email</th><th>Status</th><th>Performance</th>
              <th>Workload</th><th>Villages Covered</th>
            </tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
          <p style="margin-top:20px;color:#666;">Total: ${filteredStaff.length} records</p>
        </body>
      </html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    setRoleFilter("");
    setStatusFilter("");
  };

  // Check if we are viewing a staff profile
  if (viewingStaff) {
    return (
      <div className={`dashboard-shell ${isDarkMode ? "dark-mode" : ""}`}>
        <Sidebar
          activeItem={activeItem}
          onItemClick={handleItemClick}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="dashboard-main">
          <TopNavbar
            breadcrumb={["Dashboard", "Staff Management", `${viewingStaff.firstName} ${viewingStaff.lastName}`]}
            currentDate={currentDate}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            onOpenMobileMenu={() => setMobileOpen(true)}
          />
          <StaffDetails staff={viewingStaff} onBack={handleBack} />
          <footer className="dashboard-footer">
            <p>Ward Management System</p>
            <p>© 2026 Advanware. All rights reserved.</p>
            <p>Version 1.0</p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-shell ${isDarkMode ? "dark-mode" : ""}`}>
      <Sidebar
        activeItem={activeItem}
        onItemClick={handleItemClick}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="dashboard-main">
        <TopNavbar
          breadcrumb={["Dashboard", "Staff Management"]}
          currentDate={currentDate}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <motion.section
          className="welcome-banner staff-hero"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div>
            <h1>Staff Management</h1>
            <h2>Manage your ward team and track performance.</h2>
            <p>
              View staff profiles, monitor workloads, track performance scores, and manage
              department assignments across the ward.
            </p>
          </div>
          <div className="welcome-illustration" aria-hidden="true">
            Staff Records
          </div>
        </motion.section>

        <StaffStats
          totalStaff={totalStaff}
          onDutyCount={onDutyCount}
          departmentCount={departmentCount}
          avgPerformance={avgPerformance}
        />

        <StaffDashboard staff={filteredStaff} onViewStaff={handleView} />

        <StaffFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          departmentFilter={departmentFilter}
          onDepartmentChange={setDepartmentFilter}
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          departments={departments}
          roles={roles}
          statuses={statuses}
          onRegisterClick={handleRegisterClick}
          onExportPdf={exportPdf}
          onRefresh={handleRefresh}
        />

        <StaffTable
          staff={filteredStaff}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRegisterFirst={handleRegisterClick}
        />

        <StaffCharts staff={filteredStaff} />

        <StaffModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          staff={editingStaff}
          departments={departments}
          roles={roles}
          statuses={statuses}
          villages={villages}
        />

        <footer className="dashboard-footer">
          <p>Ward Management System</p>
          <p>© 2026 Advanware. All rights reserved.</p>
          <p>Version 1.0</p>
        </footer>
      </div>
    </div>
  );
}

export default Staff;
