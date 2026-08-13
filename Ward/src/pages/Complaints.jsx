import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import ComplaintStats from "../components/complaints/ComplaintStats";
import ComplaintFilters from "../components/complaints/ComplaintFilters";
import ComplaintTable from "../components/complaints/ComplaintTable";
import ComplaintModal from "../components/complaints/ComplaintModal";
import ComplaintDetails from "../components/complaints/ComplaintDetails";
import ComplaintCharts from "../components/complaints/ComplaintCharts";
import initialComplaints, { categories, priorities, statuses, villages, officers } from "../data/complaints";

function Complaints({ onLogout }) {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState(() => {
    const stored = localStorage.getItem("ward-complaints");
    return stored ? JSON.parse(stored) : initialComplaints;
  });
  const [activeItem, setActiveItem] = useState("complaints");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [villageFilter, setVillageFilter] = useState("");
  const [officerFilter, setOfficerFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [viewingComplaint, setViewingComplaint] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningComplaint, setAssigningComplaint] = useState(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolvingComplaint, setResolvingComplaint] = useState(null);

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
    localStorage.setItem("ward-complaints", JSON.stringify(complaints));
  }, [complaints]);

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        c.id.toLowerCase().includes(term) ||
        c.citizenName.toLowerCase().includes(term) ||
        c.nationalId.toLowerCase().includes(term) ||
        c.phoneNumber.includes(term);

      const matchesCategory = !categoryFilter || c.category === categoryFilter;
      const matchesPriority = !priorityFilter || c.priority === priorityFilter;
      const matchesStatus = !statusFilter || c.status === statusFilter;
      const matchesVillage = !villageFilter || c.village === villageFilter;
      const matchesOfficer = !officerFilter || c.assignedOfficer === officerFilter;
      const matchesDate = !dateFilter || c.dateReported >= dateFilter;

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesVillage && matchesOfficer && matchesDate;
    });
  }, [complaints, searchTerm, categoryFilter, priorityFilter, statusFilter, villageFilter, officerFilter, dateFilter]);

  // Stats
  const totalComplaints = filteredComplaints.length;
  const openCount = filteredComplaints.filter((c) => c.status === "Open" || c.status === "Assigned").length;
  const inProgressCount = filteredComplaints.filter((c) => c.status === "In Progress").length;
  const resolvedCount = filteredComplaints.filter((c) => c.status === "Resolved" || c.status === "Closed").length;

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
    setEditingComplaint(null);
    setModalOpen(true);
  };

  const handleEdit = (complaint) => {
    setEditingComplaint(complaint);
    setModalOpen(true);
  };

  const handleSave = (complaintData) => {
    setComplaints((prev) => {
      const exists = prev.find((c) => c.id === complaintData.id);
      if (exists) {
        return prev.map((c) => (c.id === complaintData.id ? complaintData : c));
      }
      return [...prev, complaintData];
    });
  };

  const handleDelete = (complaint) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete complaint ${complaint.id} from ${complaint.citizenName}? This action cannot be undone.`
    );
    if (confirmed) {
      setComplaints((prev) => prev.filter((c) => c.id !== complaint.id));
    }
  };

  const handleView = (complaint) => {
    setViewingComplaint(complaint);
  };

  const handleBack = () => {
    setViewingComplaint(null);
  };

  const handleAssign = (complaint) => {
    setAssigningComplaint(complaint);
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = (complaintId, officerName) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              assignedOfficer: officerName,
              status: "Assigned",
              lastUpdated: new Date().toISOString().split("T")[0],
              communicationHistory: [
                ...c.communicationHistory,
                { date: new Date().toISOString().split("T")[0], action: `Assigned to ${officerName}`, by: "System" },
              ],
            }
          : c
      )
    );
    setAssignModalOpen(false);
    setAssigningComplaint(null);
  };

  const handleResolve = (complaint) => {
    setResolvingComplaint(complaint);
    setResolveModalOpen(true);
  };

  const handleResolveSubmit = (complaintId, resolutionNotes) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === complaintId
          ? {
              ...c,
              status: "Resolved",
              resolutionNotes: resolutionNotes,
              lastUpdated: new Date().toISOString().split("T")[0],
              communicationHistory: [
                ...c.communicationHistory,
                { date: new Date().toISOString().split("T")[0], action: "Complaint resolved", by: "System" },
              ],
            }
          : c
      )
    );
    setResolveModalOpen(false);
    setResolvingComplaint(null);
  };

  // Export functions
  const exportPdf = () => {
    const tableRows = filteredComplaints
      .map(
        (c) =>
          `<tr>
            <td>${c.id}</td>
            <td>${c.citizenName}</td>
            <td>${c.nationalId}</td>
            <td>${c.phoneNumber}</td>
            <td>${c.category}</td>
            <td>${c.priority}</td>
            <td>${c.village}</td>
            <td>${c.assignedOfficer || "Unassigned"}</td>
            <td>${c.status}</td>
            <td>${c.dateReported}</td>
            <td>${c.lastUpdated}</td>
          </tr>`
      )
      .join("");

    const html = `
      <html>
        <head><title>Complaints Export</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #006b3c; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
          th { background: #006b3c; color: white; }
        </style>
        </head>
        <body>
          <h1>Complaint Records - Ward Management System</h1>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead><tr>
              <th>Complaint ID</th><th>Citizen</th><th>National ID</th><th>Phone</th>
              <th>Category</th><th>Priority</th><th>Village</th><th>Officer</th>
              <th>Status</th><th>Date Reported</th><th>Last Updated</th>
            </tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
          <p style="margin-top:20px;color:#666;">Total: ${filteredComplaints.length} records</p>
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
    setCategoryFilter("");
    setPriorityFilter("");
    setStatusFilter("");
    setVillageFilter("");
    setOfficerFilter("");
    setDateFilter("");
  };

  // Check if we are viewing a complaint detail
  if (viewingComplaint) {
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
            breadcrumb={["Dashboard", "Complaint Management", viewingComplaint.id]}
            currentDate={currentDate}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            onOpenMobileMenu={() => setMobileOpen(true)}
          />
          <ComplaintDetails complaint={viewingComplaint} onBack={handleBack} />
          <footer className="dashboard-footer">
            <p>Ward Management System</p>
            <p>Academic Demonstration Project</p>
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
          breadcrumb={["Dashboard", "Complaint Management"]}
          currentDate={currentDate}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <motion.section
          className="welcome-banner complaints-hero"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div>
            <h1>Complaint Management</h1>
            <h2>Track, assign and resolve ward complaints efficiently.</h2>
            <p>
              Manage citizen complaints, assign officers, monitor progress, and improve service delivery
              through one centralized dashboard.
            </p>
          </div>
          <div className="welcome-illustration" aria-hidden="true">
            Complaint Records
          </div>
        </motion.section>

        <ComplaintStats
          totalComplaints={totalComplaints}
          openCount={openCount}
          inProgressCount={inProgressCount}
          resolvedCount={resolvedCount}
        />

        <ComplaintFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          villageFilter={villageFilter}
          onVillageChange={setVillageFilter}
          officerFilter={officerFilter}
          onOfficerChange={setOfficerFilter}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          categories={categories}
          priorities={priorities}
          statuses={statuses}
          villages={villages}
          officers={officers}
          onRegisterClick={handleRegisterClick}
          onExportPdf={exportPdf}
          onRefresh={handleRefresh}
        />

        <ComplaintTable
          complaints={filteredComplaints}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAssign={handleAssign}
          onResolve={handleResolve}
          onRegisterFirst={handleRegisterClick}
        />

        <ComplaintCharts complaints={filteredComplaints} />

        <ComplaintModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          complaint={editingComplaint}
          categories={categories}
          priorities={priorities}
          statuses={statuses}
          villages={villages}
          officers={officers}
        />

        {/* Assign Officer Modal */}
        {assignModalOpen && assigningComplaint && (
          <>
            <div className="modal-backdrop" onClick={() => setAssignModalOpen(false)} />
            <div className="modal-container" style={{ maxWidth: "450px" }}>
              <div className="modal-header">
                <h2>Assign Officer</h2>
                <button className="modal-close" onClick={() => setAssignModalOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const officer = form.officer.value;
                if (officer) handleAssignSubmit(assigningComplaint.id, officer);
              }}>
                <div className="modal-body">
                  <p style={{ fontSize: "0.85rem", color: "#475569", marginBottom: "0.8rem" }}>
                    Assigning complaint <strong>{assigningComplaint.id}</strong> from <strong>{assigningComplaint.citizenName}</strong>
                  </p>
                  <div className="form-group">
                    <label>Select Officer</label>
                    <select name="officer" required style={{
                      width: "100%", border: "1px solid var(--gov-border)", borderRadius: "0.6rem",
                      padding: "0.5rem 0.6rem", fontSize: "0.85rem", background: "#fff", color: "#0f172a"
                    }}>
                      <option value="">Choose an officer...</option>
                      {officers.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="gov-btn gov-btn-ghost" onClick={() => setAssignModalOpen(false)}>Cancel</button>
                  <button type="submit" className="gov-btn gov-btn-primary">Assign Officer</button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* Resolve Complaint Modal */}
        {resolveModalOpen && resolvingComplaint && (
          <>
            <div className="modal-backdrop" onClick={() => setResolveModalOpen(false)} />
            <div className="modal-container" style={{ maxWidth: "500px" }}>
              <div className="modal-header">
                <h2>Resolve Complaint</h2>
                <button className="modal-close" onClick={() => setResolveModalOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const notes = form.resolutionNotes.value;
                handleResolveSubmit(resolvingComplaint.id, notes);
              }}>
                <div className="modal-body">
                  <p style={{ fontSize: "0.85rem", color: "#475569", marginBottom: "0.8rem" }}>
                    Resolving complaint <strong>{resolvingComplaint.id}</strong> from <strong>{resolvingComplaint.citizenName}</strong>
                  </p>
                  <div className="form-group">
                    <label>Resolution Notes</label>
                    <textarea
                      name="resolutionNotes"
                      required
                      rows={4}
                      placeholder="Describe how the complaint was resolved..."
                      style={{
                        width: "100%", border: "1px solid var(--gov-border)", borderRadius: "0.6rem",
                        padding: "0.5rem 0.6rem", fontSize: "0.85rem", fontFamily: "inherit", resize: "vertical"
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="gov-btn gov-btn-ghost" onClick={() => setResolveModalOpen(false)}>Cancel</button>
                  <button type="submit" className="gov-btn gov-btn-primary">Mark as Resolved</button>
                </div>
              </form>
            </div>
          </>
        )}

        <footer className="dashboard-footer">
          <p>Ward Management System</p>
          <p>© 2026 Advanware. All rights reserved.</p>
          <p>Version 1.0</p>
        </footer>
      </div>
    </div>
  );
}

export default Complaints;
