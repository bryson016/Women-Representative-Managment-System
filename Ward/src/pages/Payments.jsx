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
  Calendar,
  Hash,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import { getPayments } from "../services/bursaryApi";

const STATUS_COLORS = {
  Disbursed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

function Payments({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState("payments");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const currentDate = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const breadcrumb = ["Dashboard", "Payments & Disbursements"];

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

  async function loadPayments() {
    setLoading(true);
    try {
      const data = await getPayments({ search: searchQuery, page: 1, limit: 50 });
      setPayments(data.payments || []);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, [searchQuery]);

  async function handleViewPayment(id) {
    try {
      const data = await getPayments({ search: "", page: 1, limit: 50 });
      const found = (data.payments || []).find((p) => p.id === id);
      if (found) {
        setSelectedPayment(found);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error loading payment details:", error);
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

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.fullName?.toLowerCase().includes(q) ||
      p.applicationNumber?.toLowerCase().includes(q) ||
      p.paymentReference?.toLowerCase().includes(q) ||
      p.institutionName?.toLowerCase().includes(q)
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
              <h3>Payments & Disbursements</h3>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "1 1 250px" }}>
                  <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                  <input
                    type="text"
                    placeholder="Search payments..."
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
                <p>Loading payments...</p>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                <Wallet size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                <p>No payments found.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Payment Ref</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Application #</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Beneficiary</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Institution</th>
                      <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Amount</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Payment Date</th>
                      <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Status</th>
                      <th style={{ padding: "12px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment, index) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.2 }}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={{ padding: "12px", fontSize: "14px", fontWeight: 500 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Hash size={14} />
                            {payment.paymentReference}
                          </div>
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px" }}>{payment.applicationNumber}</td>
                        <td style={{ padding: "12px", fontSize: "14px" }}>
                          <div>{payment.fullName}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{payment.nationalId}</div>
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px" }}>{payment.institutionName}</td>
                        <td style={{ padding: "12px", fontSize: "14px", textAlign: "right", fontWeight: 500 }}>
                          {formatCurrency(payment.approvedAmount)}
                        </td>
                        <td style={{ padding: "12px", fontSize: "14px", color: "#64748b" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Calendar size={14} />
                            {formatDate(payment.disbursedAt)}
                          </div>
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span className="status-pill disbursed" style={{
                            padding: "4px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: 500,
                            ...STATUS_COLORS[payment.status] || {},
                          }}>
                            {payment.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                            <button
                              className="icon-btn soft"
                              onClick={() => handleViewPayment(payment.id)}
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
      {showDetailModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="modal-header">
              <h2>Payment Details</h2>
              <button className="icon-btn soft" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                <div><strong>Payment Reference:</strong> {selectedPayment.paymentReference}</div>
                <div><strong>Application Number:</strong> {selectedPayment.applicationNumber}</div>
                <div><strong>Beneficiary:</strong> {selectedPayment.fullName}</div>
                <div><strong>National ID:</strong> {selectedPayment.nationalId}</div>
                <div><strong>Institution:</strong> {selectedPayment.institutionName}</div>
                <div><strong>Amount:</strong> {formatCurrency(selectedPayment.approvedAmount)}</div>
                <div><strong>Payment Date:</strong> {formatDate(selectedPayment.disbursedAt)}</div>
                <div><strong>Status:</strong> {selectedPayment.status}</div>
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

export default Payments;
