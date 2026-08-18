import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Eye,
  FileText,
  CheckCircle,
  Wallet,
  Download,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import { getBeneficiaries } from "../services/bursaryApi";

const STATUS_COLORS = {
  Approved: "bg-green-100 text-green-700",
  Disbursed: "bg-emerald-100 text-emerald-700",
};

function Beneficiaries({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState("beneficiaries");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const currentDate = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const breadcrumb = ["Dashboard", "Beneficiaries"];

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

  async function loadBeneficiaries() {
    setLoading(true);
    try {
      const data = await getBeneficiaries({ search: searchQuery, page: 1, limit: 50 });
      setBeneficiaries(data.beneficiaries || []);
    } catch (error) {
      console.error("Error loading beneficiaries:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBeneficiaries();
  }, [searchQuery]);

  async function handleViewBeneficiary(id) {
    try {
      const data = await getBeneficiaries({ search: "", page: 1, limit: 50 });
      const found = (data.beneficiaries || []).find((b) => b.id === id);
      if (found) {
        setSelectedBeneficiary(found);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error loading beneficiary details:", error);
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

  const filteredBeneficiaries = beneficiaries.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.fullName?.toLowerCase().includes(q) ||
      b.nationalId?.toLowerCase().includes(q) ||
      b.applicationNumber?.toLowerCase().includes(q) ||
      b.institutionName?.toLowerCase().includes(q)
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
              <h3>Beneficiaries</h3>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "1 1 250px" }}>
                  <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                  <input
                    type="text"
                    placeholder="Search beneficiaries..."
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
              </div>
            </div>

            {loading ? (
              <div className="loading-screen">
                <p>Loading beneficiaries...</p>
              </div>
            ) : filteredBeneficiaries.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                <FileText size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                <p>No beneficiaries found.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Application #</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Beneficiary</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Institution</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Ward</th>
                      <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Approved Amount</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Status</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Approved Date</th>
                      <th style={{ padding: "12px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBeneficiaries.map((beneficiary, index) => (
                      <motion.tr
                        key={beneficiary.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={{ padding: "12px", fontSize: "14px", fontWeight: 500 }}>{beneficiary.applicationNumber}</td>
                        <td style={{ padding: "12px", fontSize: "14px" }}>
                          <div>{beneficiary.fullName}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{beneficiary.nationalId}</div>
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px" }}>
                          <div>{beneficiary.institutionName}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{beneficiary.institutionType}</div>
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px" }}>{beneficiary.ward}</td>
                        <td style={{ padding: "12px", fontSize: "14px", textAlign: "right", fontWeight: 500 }}>
                          {formatCurrency(beneficiary.approvedAmount)}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span className="status-pill" style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 500,
                            ...STATUS_COLORS[beneficiary.status] || {},
                          }}>
                            {beneficiary.status.replace("_", " ")}
                          </span>
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px", color: "#64748b" }}>
                          {formatDate(beneficiary.approvedAt)}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                            <button
                              className="icon-btn soft"
                              onClick={() => handleViewBeneficiary(beneficiary.id)}
                              title="View Details"
                            >
                              <Eye size={16} />
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

      {/* Detail Modal */}
      {showDetailModal && selectedBeneficiary && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="modal-header">
              <h2>Beneficiary Details</h2>
              <button className="icon-btn soft" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                <div><strong>Application Number:</strong> {selectedBeneficiary.applicationNumber}</div>
                <div><strong>Full Name:</strong> {selectedBeneficiary.fullName}</div>
                <div><strong>National ID:</strong> {selectedBeneficiary.nationalId}</div>
                <div><strong>Institution:</strong> {selectedBeneficiary.institutionName}</div>
                <div><strong>Institution Type:</strong> {selectedBeneficiary.institutionType}</div>
                <div><strong>Academic Year:</strong> {selectedBeneficiary.academicYear}</div>
                <div><strong>Ward:</strong> {selectedBeneficiary.ward}</div>
                <div><strong>Amount Requested:</strong> {formatCurrency(selectedBeneficiary.amountRequested)}</div>
                <div><strong>Approved Amount:</strong> {formatCurrency(selectedBeneficiary.approvedAmount)}</div>
                <div><strong>Status:</strong> {selectedBeneficiary.status.replace("_", " ")}</div>
                <div><strong>Approved At:</strong> {formatDate(selectedBeneficiary.approvedAt)}</div>
                <div><strong>Disbursed At:</strong> {formatDate(selectedBeneficiary.disbursedAt)}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="gov-btn gov-btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Beneficiaries;
