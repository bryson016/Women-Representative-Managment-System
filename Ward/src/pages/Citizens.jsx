import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import CitizenStats from "../components/citizens/CitizenStats";
import CitizenFilters from "../components/citizens/CitizenFilters";
import CitizenTable from "../components/citizens/CitizenTable";
import CitizenModal from "../components/citizens/CitizenModal";
import CitizenProfile from "../components/citizens/CitizenProfile";
import initialCitizens, { villages } from "../data/citizens";

function Citizens({ onLogout }) {
  const navigate = useNavigate();
  const { citizenId } = useParams();

  const [citizens, setCitizens] = useState(() => {
    const stored = localStorage.getItem("ward-citizens");
    return stored ? JSON.parse(stored) : initialCitizens;
  });
  const [activeItem, setActiveItem] = useState("citizens");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [villageFilter, setVillageFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCitizen, setEditingCitizen] = useState(null);
  const [viewingCitizen, setViewingCitizen] = useState(null);

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
    localStorage.setItem("ward-citizens", JSON.stringify(citizens));
  }, [citizens]);

  // Filtered citizens
  const filteredCitizens = useMemo(() => {
    return citizens.filter((c) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        c.firstName.toLowerCase().includes(term) ||
        c.lastName.toLowerCase().includes(term) ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) ||
        c.nationalId.toLowerCase().includes(term) ||
        c.phoneNumber.includes(term);

      const matchesVillage = !villageFilter || c.village === villageFilter;
      const matchesGender = !genderFilter || c.gender === genderFilter;
      const matchesDate = !dateFilter || c.registrationDate >= dateFilter;

      return matchesSearch && matchesVillage && matchesGender && matchesDate;
    });
  }, [citizens, searchTerm, villageFilter, genderFilter, dateFilter]);

  // Stats
  const totalCitizens = filteredCitizens.length;
  const maleCount = filteredCitizens.filter((c) => c.gender === "Male").length;
  const femaleCount = filteredCitizens.filter((c) => c.gender === "Female").length;
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const newRegistrations = filteredCitizens.filter((c) => {
    const parts = c.registrationDate.split("-");
    const regMonth = parseInt(parts[1], 10);
    const regYear = parseInt(parts[0], 10);
    return regYear === currentYear && regMonth === currentMonth;
  }).length;

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
    setEditingCitizen(null);
    setModalOpen(true);
  };

  const handleEdit = (citizen) => {
    setEditingCitizen(citizen);
    setModalOpen(true);
  };

  const handleSave = (citizenData) => {
    setCitizens((prev) => {
      const exists = prev.find((c) => c.id === citizenData.id);
      if (exists) {
        return prev.map((c) => (c.id === citizenData.id ? citizenData : c));
      }
      return [...prev, citizenData];
    });
  };

  const handleDelete = (citizen) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${citizen.firstName} ${citizen.lastName}? This action cannot be undone.`
    );
    if (confirmed) {
      setCitizens((prev) => prev.filter((c) => c.id !== citizen.id));
    }
  };

  const handleView = (citizen) => {
    setViewingCitizen(citizen);
  };

  const handleBack = () => {
    setViewingCitizen(null);
  };

  // Export functions
  const exportPdf = () => {
    const tableRows = filteredCitizens
      .map(
        (c) =>
          `<tr>
            <td>${c.nationalId}</td>
            <td>${c.firstName} ${c.lastName}</td>
            <td>${c.gender}</td>
            <td>${c.phoneNumber}</td>
            <td>${c.village}</td>
            <td>${c.occupation}</td>
            <td>${c.registrationDate}</td>
            <td>${c.status}</td>
          </tr>`
      )
      .join("");

    const html = `
      <html>
        <head><title>Citizens Export</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #006b3c; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #006b3c; color: white; }
        </style>
        </head>
        <body>
          <h1>Citizen Records - Ward Management System</h1>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead><tr>
              <th>National ID</th><th>Full Name</th><th>Gender</th><th>Phone</th>
              <th>Village</th><th>Occupation</th><th>Reg. Date</th><th>Status</th>
            </tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
          <p style="margin-top:20px;color:#666;">Total: ${filteredCitizens.length} records</p>
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
    setVillageFilter("");
    setGenderFilter("");
    setDateFilter("");
  };

  // Check if we are viewing a profile
  if (viewingCitizen) {
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
            breadcrumb={["Dashboard", "Citizen Management", `${viewingCitizen.firstName} ${viewingCitizen.lastName}`]}
            currentDate={currentDate}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            onOpenMobileMenu={() => setMobileOpen(true)}
          />
          <CitizenProfile citizen={viewingCitizen} onBack={handleBack} />
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
          breadcrumb={["Dashboard", "Citizen Management"]}
          currentDate={currentDate}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <motion.section
          className="welcome-banner"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div>
            <h1>Citizen Management</h1>
            <h2>Manage all registered ward residents.</h2>
            <p>
              View, register, edit, and manage citizen records for the ward. Keep accurate and
              up-to-date information for effective local administration.
            </p>
          </div>
          <div className="welcome-illustration" aria-hidden="true">
            Citizen Records
          </div>
        </motion.section>

        <CitizenStats
          totalCitizens={totalCitizens}
          maleCount={maleCount}
          femaleCount={femaleCount}
          newRegistrations={newRegistrations}
        />

        <CitizenFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          villageFilter={villageFilter}
          onVillageChange={setVillageFilter}
          genderFilter={genderFilter}
          onGenderChange={setGenderFilter}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          villages={villages}
          onRegisterClick={handleRegisterClick}
          onExportPdf={exportPdf}
          onRefresh={handleRefresh}
        />

        <CitizenTable
          citizens={filteredCitizens}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRegisterFirst={handleRegisterClick}
        />

        <CitizenModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          citizen={editingCitizen}
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

export default Citizens;
