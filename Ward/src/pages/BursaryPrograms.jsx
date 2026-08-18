import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Calendar,
  DollarSign,
  Users,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import { getBursaryPrograms, createBursaryProgram, updateBursaryProgram, deleteBursaryProgram } from "../services/bursaryApi";

const STATUS_COLORS = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-700",
  Closed: "bg-red-100 text-red-700",
};

function BursaryPrograms({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState("bursary-programs");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    academicYear: "",
    applicationDeadline: "",
    totalBudget: "",
    eligibilityCriteria: "",
    status: "Active",
  });
  const [saving, setSaving] = useState(false);

  const currentDate = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const breadcrumb = ["Dashboard", "Bursary Programs"];

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

  async function loadPrograms() {
    setLoading(true);
    try {
      const data = await getBursaryPrograms();
      setPrograms(data.programs || []);
    } catch (error) {
      console.error("Error loading programs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrograms();
  }, []);

  function openCreateModal() {
    setEditingProgram(null);
    setFormData({
      name: "",
      description: "",
      academicYear: "",
      applicationDeadline: "",
      totalBudget: "",
      eligibilityCriteria: "",
      status: "Active",
    });
    setShowModal(true);
  }

  function openEditModal(program) {
    setEditingProgram(program);
    setFormData({
      name: program.name || "",
      description: program.description || "",
      academicYear: program.academicYear || "",
      applicationDeadline: program.applicationDeadline ? program.applicationDeadline.split("T")[0] : "",
      totalBudget: program.totalBudget || "",
      eligibilityCriteria: program.eligibilityCriteria || "",
      status: program.status || "Active",
    });
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProgram) {
        await updateBursaryProgram(editingProgram.id, formData);
      } else {
        await createBursaryProgram(formData);
      }
      await loadPrograms();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving program:", error);
      alert("Failed to save program. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this program?")) return;
    try {
      await deleteBursaryProgram(id);
      await loadPrograms();
    } catch (error) {
      console.error("Error deleting program:", error);
      alert("Failed to delete program. Please try again.");
    }
  }

  function formatCurrency(amount) {
    if (!amount) return "KES 0";
    return `KES ${parseFloat(amount).toLocaleString()}`;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const filteredPrograms = programs.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.academicYear?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

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
              <h3>Bursary Programs</h3>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "1 1 250px" }}>
                  <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <button className="gov-btn gov-btn-primary" onClick={openCreateModal}>
                  <Plus size={16} />
                  New Program
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading-screen">
                <p>Loading programs...</p>
              </div>
            ) : filteredPrograms.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                <BookOpen size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                <p>No bursary programs found.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Program Name</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Academic Year</th>
                      <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Budget</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Deadline</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Status</th>
                      <th style={{ padding: "12px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrograms.map((program, index) => (
                      <motion.tr
                        key={program.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={{ padding: "12px", fontSize: "14px", fontWeight: 500 }}>{program.name}</td>
                        <td style={{ padding: "12px", fontSize: "14px" }}>{program.academicYear}</td>
                        <td style={{ padding: "12px", fontSize: "14px", textAlign: "right", fontWeight: 500 }}>
                          {formatCurrency(program.totalBudget)}
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px", color: "#64748b" }}>
                          {formatDate(program.applicationDeadline)}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span className="status-pill" style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 500,
                            ...STATUS_COLORS[program.status] || {},
                          }}>
                            {program.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                            <button
                              className="icon-btn soft"
                              onClick={() => openEditModal(program)}
                              title="Edit Program"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="icon-btn soft"
                              onClick={() => handleDelete(program.id)}
                              title="Delete Program"
                              style={{ color: "#ef4444" }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </motion.main>

        <footer className="dashboard-footer">
          <p>© 2026 Advenware. All rights reserved.</p>
        </footer>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="modal-header">
                <h2>{editingProgram ? "Edit Program" : "New Bursary Program"}</h2>
                <button className="icon-btn soft" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>Program Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", resize: "vertical" }}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>Academic Year *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 2025/2026"
                          value={formData.academicYear}
                          onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                          style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>Application Deadline</label>
                        <input
                          type="date"
                          value={formData.applicationDeadline}
                          onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                          style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>Total Budget (KES)</label>
                        <input
                          type="number"
                          value={formData.totalBudget}
                          onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
                          style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }}>Eligibility Criteria</label>
                      <textarea
                        value={formData.eligibilityCriteria}
                        onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                        rows={3}
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", resize: "vertical" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="gov-btn gov-btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="gov-btn gov-btn-primary" disabled={saving}>
                    <Save size={16} />
                    {saving ? "Saving..." : editingProgram ? "Update Program" : "Create Program"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BursaryPrograms;
