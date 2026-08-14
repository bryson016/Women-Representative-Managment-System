import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Eye,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  Search,
  Filter,
} from "lucide-react";
import CitizenLayout from "../../components/citizens/CitizenLayout";
import { getMyBursaryApplications } from "../../services/bursaryApi";

const STATUS_COLORS = {
  Draft: "bg-gray-100 text-gray-700",
  Submitted: "bg-blue-100 text-blue-700",
  Under_Review: "bg-yellow-100 text-yellow-700",
  Verified: "bg-purple-100 text-purple-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Disbursed: "bg-emerald-100 text-emerald-700",
};

function CitizenBursaryTracking() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("bursary");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    try {
      const data = await getMyBursaryApplications();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewApplication(id) {
    try {
      const data = await getMyBursaryApplications();
      const app = data.applications.find((a) => a.id === id);
      if (app) {
        setSelectedApplication(app);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error("Error loading application:", error);
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

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = !searchQuery ||
      app.applicationNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.institutionName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statCards = [
    { title: "Total Applications", value: applications.length, icon: FileText, color: "#7c3aed" },
    { title: "Pending", value: applications.filter((a) => a.status === "Submitted").length, icon: Clock, color: "#3b82f6" },
    { title: "Under Review", value: applications.filter((a) => a.status === "Under_Review").length, icon: Clock, color: "#f59e0b" },
    { title: "Approved", value: applications.filter((a) => a.status === "Approved" || a.status === "Disbursed").length, icon: CheckCircle, color: "#10b981" },
    { title: "Rejected", value: applications.filter((a) => a.status === "Rejected").length, icon: XCircle, color: "#ef4444" },
  ];

  return (
    <CitizenLayout activeItem={activeItem} onItemClick={setActiveItem} breadcrumb={["Bursary", "My Applications"]}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Stats */}
        <section className="stats-grid" style={{ marginBottom: "24px" }}>
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              className="stat-card citizen-stat-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.28 }}
              whileHover={{ y: -4 }}
            >
              <div className="stat-head">
                <div className="stat-icon" style={{ background: `${card.color}15`, color: card.color }}>
                  <card.icon size={18} />
                </div>
              </div>
              <h3>{card.value}</h3>
              <h4>{card.title}</h4>
            </motion.div>
          ))}
        </section>

        {/* Actions */}
        <section style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", gap: "12px", flex: "1 1 300px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: "1 1 250px" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
              <input
                type="text"
                placeholder="Search applications..."
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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under_Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Disbursed">Disbursed</option>
            </select>
          </div>
          <button className="gov-btn gov-btn-primary" onClick={() => navigate("/citizen/bursary/apply")}>
            <PlusCircle size={18} />
            <span>New Application</span>
          </button>
        </section>

        {/* Applications List */}
        <section className="panel-card">
          {loading ? (
            <div className="loading-screen">
              <p>Loading your applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
              <FileText size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
              <p>No bursary applications found.</p>
              <button className="gov-btn gov-btn-primary" style={{ marginTop: "16px" }} onClick={() => navigate("/citizen/bursary/apply")}>
                <PlusCircle size={18} />
                <span>Apply for Bursary</span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filteredApplications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: "1 1 200px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{app.applicationNumber}</div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>{app.institutionName} • {app.academicYear}</div>
                  </div>
                  <div style={{ flex: "1 1 150px", textAlign: "center" }}>
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>{formatCurrency(app.amountRequested)}</div>
                    {app.approvedAmount && (
                      <div style={{ fontSize: "12px", color: "#10b981" }}>Approved: {formatCurrency(app.approvedAmount)}</div>
                    )}
                  </div>
                  <div style={{ flex: "1 1 120px", textAlign: "center" }}>
                    <span className={`status-pill ${app.status.toLowerCase().replace("_", "-")}`} style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 500,
                      ...STATUS_COLORS[app.status] || {}
                    }}>
                      {app.status.replace("_", " ")}
                    </span>
                  </div>
                  <div style={{ flex: "1 1 100px", textAlign: "right", fontSize: "13px", color: "#64748b" }}>
                    {formatDate(app.createdAt)}
                  </div>
                  <button
                    className="icon-btn soft"
                    onClick={() => handleViewApplication(app.id)}
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </motion.div>

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "700px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="icon-btn soft" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: "20px", padding: "16px", background: "#f8fafc", borderRadius: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontSize: "18px", fontWeight: 700, color: "#7c3aed", letterSpacing: "1px" }}>{selectedApplication.applicationNumber}</span>
                  <span className={`status-pill ${selectedApplication.status.toLowerCase().replace("_", "-")}`} style={{
                    padding: "4px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 500,
                    ...STATUS_COLORS[selectedApplication.status] || {}
                  }}>
                    {selectedApplication.status.replace("_", " ")}
                  </span>
                </div>
                <div style={{ fontSize: "14px", color: "#64748b" }}>
                  {selectedApplication.institutionName} • {selectedApplication.academicYear}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                <div><strong>Amount Requested:</strong> {formatCurrency(selectedApplication.amountRequested)}</div>
                <div><strong>Approved Amount:</strong> {selectedApplication.approvedAmount ? formatCurrency(selectedApplication.approvedAmount) : "Pending"}</div>
                <div><strong>Total Fees:</strong> {formatCurrency(selectedApplication.totalFees)}</div>
                <div><strong>Outstanding:</strong> {formatCurrency(selectedApplication.outstandingBalance)}</div>
                <div><strong>Submitted:</strong> {formatDate(selectedApplication.submittedAt || selectedApplication.createdAt)}</div>
                <div><strong>Institution Type:</strong> {selectedApplication.institutionType}</div>
              </div>

              {selectedApplication.rejectionReason && (
                <div style={{ padding: "12px", background: "#fef2f2", borderRadius: "8px", marginBottom: "16px" }}>
                  <strong style={{ color: "#ef4444" }}>Rejection Reason:</strong>
                  <p style={{ marginTop: "4px", color: "#7f1d1d" }}>{selectedApplication.rejectionReason}</p>
                </div>
              )}

              {selectedApplication.reviewComments && (
                <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "8px", marginBottom: "16px" }}>
                  <strong>Review Comments:</strong>
                  <p style={{ marginTop: "4px", color: "#475569" }}>{selectedApplication.reviewComments}</p>
                </div>
              )}

              {selectedApplication.history && selectedApplication.history.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Application History</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {selectedApplication.history.map((entry) => (
                      <div key={entry.id} style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", borderLeft: "3px solid #7c3aed" }}>
                        <div style={{ fontSize: "14px", fontWeight: 500 }}>{entry.action}</div>
                        {entry.newStatus && (
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            {entry.previousStatus || "N/A"} → {entry.newStatus.replace("_", " ")}
                          </div>
                        )}
                        {entry.notes && (
                          <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>{entry.notes}</div>
                        )}
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                          {entry.performedByName} • {formatDate(entry.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="gov-btn gov-btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </CitizenLayout>
  );
}

export default CitizenBursaryTracking;
