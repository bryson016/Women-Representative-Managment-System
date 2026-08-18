import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Wallet,
  Users,
  GraduationCap,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import {
  getAllBursaryApplications,
  getBursaryApplication,
  updateBursaryStatus,
  getBursaryStats,
  getBursaryReports,
} from "../services/bursaryApi";

const STATUS_COLORS = {
  Draft: "bg-gray-100 text-gray-700",
  Submitted: "bg-blue-100 text-blue-700",
  Under_Review: "bg-yellow-100 text-yellow-700",
  Verified: "bg-purple-100 text-purple-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Disbursed: "bg-emerald-100 text-emerald-700",
};

const INSTITUTION_TYPES = [
  "Secondary School",
  "College",
  "University",
  "TVET",
  "Other",
];

function BursaryApplications({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState("bursary");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: "",
    approvedAmount: "",
    rejectionReason: "",
    reviewComments: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWard, setFilterWard] = useState("");
  const [filterInstitutionType, setFilterInstitutionType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAcademicYear, setFilterAcademicYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Reports state
  const [showReports, setShowReports] = useState(false);
  const [reportsData, setReportsData] = useState(null);
  const [loadingReports, setLoadingReports] = useState(false);

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

  const breadcrumb = ["Dashboard", "Bursary Applications"];

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

  async function loadReports() {
    setLoadingReports(true);
    try {
      const data = await getBursaryReports({
        ward: filterWard,
        institutionType: filterInstitutionType,
        academicYear: filterAcademicYear,
        status: filterStatus,
      });
      setReportsData(data);
      setShowReports(true);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoadingReports(false);
    }
  }

  useEffect(() => {
    loadApplications();
    loadStats();
  }, [searchQuery, filterWard, filterInstitutionType, filterStatus, filterAcademicYear, currentPage]);

  async function loadApplications() {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        ward: filterWard,
        institutionType: filterInstitutionType,
        status: filterStatus,
        academicYear: filterAcademicYear,
        page: currentPage,
        limit: 15,
        sortBy: "created_at",
        sortOrder: "DESC",
      };
      const data = await getAllBursaryApplications(params);
      setApplications(data.applications || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const data = await getBursaryStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  }

  async function handleViewApplication(id) {
    try {
      const data = await getBursaryApplication(id);
      setSelectedApplication(data.application);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error loading application details:", error);
    }
  }

  async function handleReviewSubmit() {
    if (!selectedApplication) return;

    setSubmitting(true);
    try {
      await updateBursaryStatus(selectedApplication.id, reviewForm);
      setShowReviewModal(false);
      setReviewForm({ status: "", approvedAmount: "", rejectionReason: "", reviewComments: "" });
      loadApplications();
      loadStats();
      // Refresh detail view
      if (selectedApplication) {
        const data = await getBursaryApplication(selectedApplication.id);
        setSelectedApplication(data.application);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  }

  function openReviewModal(status) {
    setReviewForm({
      status,
      approvedAmount: selectedApplication?.approvedAmount?.toString() || "",
      rejectionReason: "",
      reviewComments: "",
    });
    setShowReviewModal(true);
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

  const statCards = stats
    ? [
        { title: "Total Applications", value: stats.totalApplications, icon: FileText, color: "#7c3aed" },
        { title: "Pending", value: stats.pending, icon: Clock, color: "#3b82f6" },
        { title: "Under Review", value: stats.underReview, icon: AlertCircle, color: "#f59e0b" },
        { title: "Verified", value: stats.verified, icon: CheckCircle, color: "#8b5cf6" },
        { title: "Approved", value: stats.approved, icon: CheckCircle, color: "#10b981" },
        { title: "Rejected", value: stats.rejected, icon: XCircle, color: "#ef4444" },
        { title: "Disbursed", value: stats.disbursed, icon: Wallet, color: "#059669" },
        { title: "Total Requested", value: formatCurrency(stats.totalAmountRequested), icon: Wallet, color: "#6366f1" },
        { title: "Total Approved", value: formatCurrency(stats.totalAmountApproved), icon: CheckCircle, color: "#10b981" },
      ]
    : [];

  return (
    <div className={`dashboard-shell ${isDarkMode ? "dark-mode" : ""}`}>
      <Sidebar
        activeItem={activeItem}
        userRole={user?.role}
        onItemClick={handleItemClick}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
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
          className="citizen-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Stats Grid */}
          {stats && (
            <section className="stats-grid" style={{ marginBottom: "24px" }}>
              {statCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  className="stat-card"
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
          )}

          {/* Filters and Search */}
          <section className="panel-card" style={{ marginBottom: "24px" }}>
            <div className="card-title-row">
              <h3>Bursary Applications</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="gov-btn gov-btn-ghost"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={16} />
                  <span>Filters</span>
                </button>
                <button className="gov-btn gov-btn-ghost" onClick={loadApplications}>
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 250px", position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="text"
                  placeholder="Search by name, ID, application number, or institution..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
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

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}
              >
                <select
                  value={filterWard}
                  onChange={(e) => { setFilterWard(e.target.value); setCurrentPage(1); }}
                  style={{ padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                >
                  <option value="">All Wards</option>
                  <option value="Westlands">Westlands</option>
                  <option value="Kangemi">Kangemi</option>
                  <option value="Kitisuru">Kitisuru</option>
                  <option value="Parklands">Parklands</option>
                </select>

                <select
                  value={filterInstitutionType}
                  onChange={(e) => { setFilterInstitutionType(e.target.value); setCurrentPage(1); }}
                  style={{ padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                >
                  <option value="">All Institution Types</option>
                  {INSTITUTION_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                  style={{ padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                >
                  <option value="">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under_Review">Under Review</option>
                  <option value="Verified">Verified</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Disbursed">Disbursed</option>
                </select>

                <input
                  type="text"
                  placeholder="Academic Year (e.g., 2026)"
                  value={filterAcademicYear}
                  onChange={(e) => { setFilterAcademicYear(e.target.value); setCurrentPage(1); }}
                  style={{ padding: "10px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", width: "150px" }}
                />
              </motion.div>
            )}
          </section>

          {/* Applications Table */}
          <section className="panel-card">
            {loading ? (
              <div className="loading-screen">
                <p>Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                <FileText size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                <p>No bursary applications found.</p>
              </div>
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Application #</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Applicant</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Institution</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Ward</th>
                        <th style={{ padding: "12px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Amount</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Status</th>
                        <th style={{ padding: "12px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Date</th>
                        <th style={{ padding: "12px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app, index) => (
                        <motion.tr
                          key={app.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.2 }}
                          style={{ borderBottom: "1px solid #f1f5f9" }}
                        >
                          <td style={{ padding: "12px", fontSize: "14px", fontWeight: 500 }}>{app.applicationNumber}</td>
                          <td style={{ padding: "12px", fontSize: "14px" }}>
                            <div>{app.fullName}</div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>{app.nationalId}</div>
                          </td>
                          <td style={{ padding: "12px", fontSize: "14px" }}>
                            <div>{app.institutionName}</div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>{app.institutionType}</div>
                          </td>
                          <td style={{ padding: "12px", fontSize: "14px" }}>{app.ward}</td>
                          <td style={{ padding: "12px", fontSize: "14px", textAlign: "right", fontWeight: 500 }}>
                            {formatCurrency(app.amountRequested)}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span className={`status-pill ${app.status.toLowerCase().replace("_", "-")}`} style={{
                              padding: "4px 12px",
                              borderRadius: "20px",
                              fontSize: "12px",
                              fontWeight: 500,
                              ...STATUS_COLORS[app.status] || {}
                            }}>
                              {app.status.replace("_", " ")}
                            </span>
                          </td>
                          <td style={{ padding: "12px", fontSize: "14px", color: "#64748b" }}>
                            {formatDate(app.createdAt)}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                              <button
                                className="icon-btn soft"
                                onClick={() => handleViewApplication(app.id)}
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              {app.status === "Submitted" && (
                                <button
                                  className="icon-btn soft"
                                  onClick={() => { handleViewApplication(app.id); setTimeout(() => openReviewModal("Under_Review"), 100); }}
                                  title="Start Review"
                                >
                                  <Clock size={16} />
                                </button>
                              )}
                              {app.status === "Under_Review" && (
                                <button
                                  className="icon-btn soft"
                                  onClick={() => { handleViewApplication(app.id); setTimeout(() => openReviewModal("Verified"), 100); }}
                                  title="Verify"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              {app.status === "Verified" && (
                                <>
                                  <button
                                    className="icon-btn soft"
                                    onClick={() => { handleViewApplication(app.id); setTimeout(() => openReviewModal("Approved"), 100); }}
                                    title="Approve"
                                  >
                                    <CheckCircle size={16} style={{ color: "#10b981" }} />
                                  </button>
                                  <button
                                    className="icon-btn soft"
                                    onClick={() => { handleViewApplication(app.id); setTimeout(() => openReviewModal("Rejected"), 100); }}
                                    title="Reject"
                                  >
                                    <XCircle size={16} style={{ color: "#ef4444" }} />
                                  </button>
                                </>
                              )}
                              {app.status === "Approved" && (
                                <button
                                  className="icon-btn soft"
                                  onClick={() => { handleViewApplication(app.id); setTimeout(() => openReviewModal("Disbursed"), 100); }}
                                  title="Mark as Disbursed"
                                >
                                  <Wallet size={16} style={{ color: "#059669" }} />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px", padding: "16px" }}>
                    <button
                      className="gov-btn gov-btn-ghost"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: "14px", color: "#64748b" }}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="gov-btn gov-btn-ghost"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Reports Section */}
          <section className="panel-card" style={{ marginTop: "24px" }}>
            <div className="card-title-row">
              <h3><BarChart3 size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Bursary Reports</h3>
              <button className="gov-btn gov-btn-ghost" onClick={loadReports} disabled={loadingReports}>
                {loadingReports ? "Loading..." : "Generate Report"}
              </button>
            </div>

            {showReports && reportsData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: "20px" }}
              >
                {/* Summary */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                  <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Total Applications</div>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: "#7c3aed" }}>{reportsData.summary?.total_applications || 0}</div>
                  </div>
                  <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Approved</div>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: "#10b981" }}>{reportsData.summary?.approved_count || 0}</div>
                  </div>
                  <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Rejected</div>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: "#ef4444" }}>{reportsData.summary?.rejected_count || 0}</div>
                  </div>
                  <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Total Requested</div>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: "#6366f1" }}>KES {(reportsData.summary?.total_requested || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>Total Approved</div>
                    <div style={{ fontSize: "24px", fontWeight: 700, color: "#059669" }}>KES {(reportsData.summary?.total_approved || 0).toLocaleString()}</div>
                  </div>
                </div>

                {/* By Ward */}
                {reportsData.byWard && reportsData.byWard.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>By Ward</h4>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                            <th style={{ padding: "8px", textAlign: "left" }}>Ward</th>
                            <th style={{ padding: "8px", textAlign: "right" }}>Applications</th>
                            <th style={{ padding: "8px", textAlign: "right" }}>Requested</th>
                            <th style={{ padding: "8px", textAlign: "right" }}>Approved</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportsData.byWard.map((row, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "8px" }}>{row.ward}</td>
                              <td style={{ padding: "8px", textAlign: "right" }}>{row.count}</td>
                              <td style={{ padding: "8px", textAlign: "right" }}>KES {(row.total_requested || 0).toLocaleString()}</td>
                              <td style={{ padding: "8px", textAlign: "right" }}>KES {(row.total_approved || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* By Institution Type */}
                {reportsData.byInstitutionType && reportsData.byInstitutionType.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>By Institution Type</h4>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                            <th style={{ padding: "8px", textAlign: "left" }}>Type</th>
                            <th style={{ padding: "8px", textAlign: "right" }}>Applications</th>
                            <th style={{ padding: "8px", textAlign: "right" }}>Requested</th>
                            <th style={{ padding: "8px", textAlign: "right" }}>Approved</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportsData.byInstitutionType.map((row, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "8px" }}>{row.institution_type}</td>
                              <td style={{ padding: "8px", textAlign: "right" }}>{row.count}</td>
                              <td style={{ padding: "8px", textAlign: "right" }}>KES {(row.total_requested || 0).toLocaleString()}</td>
                              <td style={{ padding: "8px", textAlign: "right" }}>KES {(row.total_approved || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* By Status */}
                {reportsData.byStatus && reportsData.byStatus.length > 0 && (
                  <div style={{ marginBottom: "24px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>By Status</h4>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {reportsData.byStatus.map((row, i) => (
                        <div key={i} style={{ padding: "12px 16px", background: "#f8fafc", borderRadius: "8px", minWidth: "150px" }}>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{row.status.replace("_", " ")}</div>
                          <div style={{ fontSize: "20px", fontWeight: 700, color: "#7c3aed" }}>{row.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Monthly Trend */}
                {reportsData.monthlyTrend && reportsData.monthlyTrend.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Monthly Trend</h4>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                            <th style={{ padding: "8px", textAlign: "left" }}>Month</th>
                            <th style={{ padding: "8px", textAlign: "right" }}>Applications</th>
                            <th style={{ padding: "8px", textAlign: "right" }}>Requested</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportsData.monthlyTrend.map((row, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                              <td style={{ padding: "8px" }}>{row.month}</td>
                              <td style={{ padding: "8px", textAlign: "right" }}>{row.count}</td>
                              <td style={{ padding: "8px", textAlign: "right" }}>KES {(row.total_requested || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {!showReports && !loadingReports && (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                <BarChart3 size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                <p>Click "Generate Report" to view bursary analytics.</p>
              </div>
            )}
          </section>
        </motion.main>

        <footer className="dashboard-footer">
          <p>© 2026 Advenware. All rights reserved.</p>
        </footer>
      </div>

      {/* Application Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "900px", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="icon-btn soft" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Applicant Information */}
              <section style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#7c3aed" }}>
                  Applicant Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "12px" }}>
                  <div><strong>Full Name:</strong> {selectedApplication.fullName}</div>
                  <div><strong>National ID:</strong> {selectedApplication.nationalId}</div>
                  <div><strong>Date of Birth:</strong> {formatDate(selectedApplication.dateOfBirth)}</div>
                  <div><strong>Gender:</strong> {selectedApplication.gender}</div>
                  <div><strong>Phone:</strong> {selectedApplication.phoneNumber}</div>
                  <div><strong>Email:</strong> {selectedApplication.email || "N/A"}</div>
                  <div><strong>Address:</strong> {selectedApplication.residentialAddress || "N/A"}</div>
                  <div><strong>County:</strong> {selectedApplication.county || "N/A"}</div>
                  <div><strong>Constituency:</strong> {selectedApplication.constituency || "N/A"}</div>
                  <div><strong>Ward:</strong> {selectedApplication.ward}</div>
                </div>
              </section>

              {/* Education Information */}
              <section style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#7c3aed" }}>
                  Education Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "12px" }}>
                  <div><strong>Institution:</strong> {selectedApplication.institutionName}</div>
                  <div><strong>Type:</strong> {selectedApplication.institutionType}</div>
                  <div><strong>Course/Form:</strong> {selectedApplication.courseOrForm || "N/A"}</div>
                  <div><strong>Year of Study:</strong> {selectedApplication.yearOfStudy || "N/A"}</div>
                  <div><strong>Admission No:</strong> {selectedApplication.admissionNumber || "N/A"}</div>
                  <div><strong>Academic Year:</strong> {selectedApplication.academicYear}</div>
                  <div><strong>Student Reg No:</strong> {selectedApplication.studentRegistrationNumber || "N/A"}</div>
                </div>
              </section>

              {/* Parent/Guardian Information */}
              <section style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#7c3aed" }}>
                  Parent / Guardian Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "12px" }}>
                  <div><strong>Name:</strong> {selectedApplication.parentFullName}</div>
                  <div><strong>Relationship:</strong> {selectedApplication.parentRelationship}</div>
                  <div><strong>Phone:</strong> {selectedApplication.parentPhone}</div>
                  <div><strong>Occupation:</strong> {selectedApplication.parentOccupation || "N/A"}</div>
                  <div><strong>Dependants:</strong> {selectedApplication.numberOfDependants}</div>
                  <div><strong>Monthly Income:</strong> {formatCurrency(selectedApplication.householdMonthlyIncome)}</div>
                </div>
              </section>

              {/* Financial Information */}
              <section style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#7c3aed" }}>
                  Financial Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "12px" }}>
                  <div><strong>Total Fees:</strong> {formatCurrency(selectedApplication.totalFees)}</div>
                  <div><strong>Amount Paid:</strong> {formatCurrency(selectedApplication.amountPaid)}</div>
                  <div><strong>Outstanding Balance:</strong> {formatCurrency(selectedApplication.outstandingBalance)}</div>
                  <div><strong>Amount Requested:</strong> {formatCurrency(selectedApplication.amountRequested)}</div>
                  <div><strong>Approved Amount:</strong> {selectedApplication.approvedAmount ? formatCurrency(selectedApplication.approvedAmount) : "N/A"}</div>
                  <div><strong>Previous Bursary:</strong> {selectedApplication.previousBursaryReceived}</div>
                  {selectedApplication.previousBursaryReceived === "Yes" && (
                    <div><strong>Previous Amount:</strong> {formatCurrency(selectedApplication.previousBursaryAmount)}</div>
                  )}
                  <div><strong>Other Assistance:</strong> {selectedApplication.otherFinancialAssistance || "N/A"}</div>
                </div>
                <div style={{ marginTop: "12px", padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                  <strong>Reason for Application:</strong>
                  <p style={{ marginTop: "4px", color: "#475569" }}>{selectedApplication.reasonForApplication}</p>
                </div>
              </section>

              {/* Supporting Documents */}
              <section style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#7c3aed" }}>
                  Supporting Documents
                </h3>
                {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {selectedApplication.documents.map((doc) => (
                      <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "#f8fafc", borderRadius: "8px" }}>
                        <FileText size={18} style={{ color: "#7c3aed" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "14px", fontWeight: 500 }}>{doc.documentType.replace("_", " ")}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{doc.fileName}</div>
                        </div>
                        <a
                          href={doc.secureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gov-btn gov-btn-ghost"
                          style={{ padding: "6px 12px", fontSize: "12px" }}
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#64748b", fontSize: "14px" }}>No documents uploaded.</p>
                )}
              </section>

              {/* Application History */}
              <section style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#7c3aed" }}>
                  Application History
                </h3>
                {selectedApplication.history && selectedApplication.history.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {selectedApplication.history.map((entry) => (
                      <div key={entry.id} style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", borderLeft: "3px solid #7c3aed" }}>
                        <div style={{ fontSize: "14px", fontWeight: 500 }}>{entry.action}</div>
                        {entry.newStatus && (
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            Status: {entry.previousStatus || "N/A"} → {entry.newStatus.replace("_", " ")}
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
                ) : (
                  <p style={{ color: "#64748b", fontSize: "14px" }}>No history available.</p>
                )}
              </section>

              {/* Review Information */}
              <section>
                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", color: "#7c3aed" }}>
                  Review Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "12px" }}>
                  <div><strong>Current Status:</strong> 
                    <span className={`status-pill ${selectedApplication.status.toLowerCase().replace("_", "-")}`} style={{
                      marginLeft: "8px", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
                      ...STATUS_COLORS[selectedApplication.status] || {}
                    }}>
                      {selectedApplication.status.replace("_", " ")}
                    </span>
                  </div>
                  <div><strong>Reviewed By:</strong> {selectedApplication.reviewedByName || "N/A"}</div>
                  <div><strong>Reviewed At:</strong> {formatDate(selectedApplication.reviewedAt)}</div>
                  <div><strong>Verified At:</strong> {formatDate(selectedApplication.verifiedAt)}</div>
                  <div><strong>Approved At:</strong> {formatDate(selectedApplication.approvedAt)}</div>
                  <div><strong>Disbursed At:</strong> {formatDate(selectedApplication.disbursedAt)}</div>
                  {selectedApplication.reviewComments && (
                    <div style={{ gridColumn: "1 / -1" }}><strong>Review Comments:</strong> {selectedApplication.reviewComments}</div>
                  )}
                  {selectedApplication.rejectionReason && (
                    <div style={{ gridColumn: "1 / -1" }}><strong>Rejection Reason:</strong> {selectedApplication.rejectionReason}</div>
                  )}
                </div>
              </section>
            </div>

            <div className="modal-footer">
              <button className="gov-btn gov-btn-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
              {selectedApplication.status === "Submitted" && (
                <button className="gov-btn gov-btn-primary" onClick={() => openReviewModal("Under_Review")}>
                  Start Review
                </button>
              )}
              {selectedApplication.status === "Under_Review" && (
                <button className="gov-btn gov-btn-primary" onClick={() => openReviewModal("Verified")}>
                  Verify Application
                </button>
              )}
              {selectedApplication.status === "Verified" && (
                <>
                  <button className="gov-btn gov-btn-primary" onClick={() => openReviewModal("Approved")}>
                    Approve
                  </button>
                  <button className="gov-btn gov-btn-secondary" style={{ background: "#fef2f2", color: "#ef4444" }} onClick={() => openReviewModal("Rejected")}>
                    Reject
                  </button>
                </>
              )}
              {selectedApplication.status === "Approved" && (
                <button className="gov-btn gov-btn-primary" onClick={() => openReviewModal("Disbursed")}>
                  Mark as Disbursed
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px" }}
          >
            <div className="modal-header">
              <h2>Update Application Status</h2>
              <button className="icon-btn soft" onClick={() => setShowReviewModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
                  New Status
                </label>
                <div style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: "8px", fontSize: "14px", fontWeight: 500 }}>
                  {reviewForm.status.replace("_", " ")}
                </div>
              </div>

              {reviewForm.status === "Approved" && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
                    Approved Amount (KES) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={reviewForm.approvedAmount}
                    onChange={(e) => setReviewForm({ ...reviewForm, approvedAmount: e.target.value })}
                    placeholder="Enter approved amount"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px" }}
                  />
                </div>
              )}

              {reviewForm.status === "Rejected" && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
                    Rejection Reason <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    value={reviewForm.rejectionReason}
                    onChange={(e) => setReviewForm({ ...reviewForm, rejectionReason: e.target.value })}
                    placeholder="Enter reason for rejection"
                    rows={3}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", resize: "vertical" }}
                  />
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>
                  Review Comments
                </label>
                <textarea
                  value={reviewForm.reviewComments}
                  onChange={(e) => setReviewForm({ ...reviewForm, reviewComments: e.target.value })}
                  placeholder="Add any comments or notes..."
                  rows={3}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "14px", resize: "vertical" }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="gov-btn gov-btn-secondary" onClick={() => setShowReviewModal(false)} disabled={submitting}>
                Cancel
              </button>
              <button
                className="gov-btn gov-btn-primary"
                onClick={handleReviewSubmit}
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update Status"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default BursaryApplications;
