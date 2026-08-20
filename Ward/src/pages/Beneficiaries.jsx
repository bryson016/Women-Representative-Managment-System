import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Eye,
  FileText,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserPlus,
  Calendar,
  CheckCircle,
  Clock,
  Ban,
  AlertCircle,
  RefreshCw,
  Copy,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import {
  getBeneficiaries,
  getBeneficiaryById,
  exportBeneficiaries,
  getBeneficiaryFilters,
  getBursaryStats,
} from "../services/bursaryApi";

const STATUS_COLORS = {
  Approved: "bg-green-100 text-green-700",
  Disbursed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Submitted: "bg-amber-100 text-amber-700",
  Under_Review: "bg-blue-100 text-blue-700",
  Verified: "bg-indigo-100 text-indigo-700",
  Rejected: "bg-rose-100 text-rose-700",
  Draft: "bg-slate-100 text-slate-500",
};

const STATUS_LABELS = {
  Approved: "Approved",
  Disbursed: "Disbursed",
  Pending: "Pending",
  Submitted: "Submitted",
  Under_Review: "Under Review",
  Verified: "Verified",
  Rejected: "Rejected",
  Draft: "Draft",
};

const STATUS_ICONS = {
  Approved: CheckCircle,
  Disbursed: CheckCircle,
  Pending: Clock,
  Submitted: Clock,
  Under_Review: Clock,
  Verified: CheckCircle,
  Rejected: Ban,
  Draft: FileText,
};

function maskNationalId(nationalId) {
  if (!nationalId) return "—";
  const value = String(nationalId);
  if (value.length <= 4) return "****";
  return `${value.slice(0, 2)}${"*".repeat(Math.max(value.length - 4, 4))}${value.slice(-2)}`;
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "KES 0";
  return `KES ${parseFloat(amount).toLocaleString()}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusPill({ status }) {
  const Icon = STATUS_ICONS[status] || FileText;
  const colorClass = STATUS_COLORS[status] || "bg-slate-100 text-slate-600";
  return (
    <span
      className={`status-pill inline-flex items-center gap-1 ${colorClass}`}
      style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500 }}
    >
      <Icon size={12} />
      {STATUS_LABELS[status] || status.replace("_", " ")}
    </span>
  );
}

function Beneficiaries({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = (user?.role || "").toLowerCase();
  const canCreate = userRole === "admin" || userRole === "officer";

  const [activeItem, setActiveItem] = useState("beneficiaries");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    program: "",
    county: "",
    dateFrom: "",
    dateTo: "",
  });
  const [filterOptions, setFilterOptions] = useState({
    counties: [],
    wards: [],
    academicYears: [],
    programs: [],
    statuses: [],
  });
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const totalPages = Math.max(Math.ceil(totalRecords / pageSize), 1);

  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  const [exportLoading, setExportLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

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
    const routeMap = {
      dashboard: "/dashboard",
      images: "/images",
      citizens: "/citizens",
      complaints: "/complaints",
      bursary: "/bursary",
      beneficiaries: "/beneficiaries",
      payments: "/payments",
      "bursary-programs": "/bursary-programs",
      projects: "/projects",
      meetings: "/meetings",
      staff: "/staff",
      budget: "/budget",
      reports: "/reports",
      notifications: "/notifications",
      settings: "/settings",
    };
    if (routeMap[id]) {
      navigate(routeMap[id]);
      return;
    }
    setActiveItem(id);
    setMobileOpen(false);
  };

  const loadFilters = useCallback(async () => {
    try {
      const data = await getBeneficiaryFilters();
      setFilterOptions({
        counties: data.counties || [],
        wards: data.wards || [],
        academicYears: data.academicYears || [],
        programs: data.programs || [],
        statuses: data.statuses || [],
      });
    } catch (err) {
      console.error("Error loading filter options:", err);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getBursaryStats();
      setStats({
        total: data.totalBeneficiaries || 0,
        approved: data.activeBeneficiaries || 0,
        pending: data.pending || 0,
        rejected: data.rejected || 0,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadBeneficiaries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: searchQuery,
        page: currentPage,
        limit: pageSize,
        status: filters.status || undefined,
        program: filters.program || undefined,
        county: filters.county || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      };
      const data = await getBeneficiaries(params);
      setBeneficiaries(data.beneficiaries || []);
      setTotalRecords(data.pagination?.total || 0);
    } catch (err) {
      console.error("Error loading beneficiaries:", err);
      setError(err?.response?.data?.message || "Failed to load beneficiaries. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, currentPage, pageSize]);

  useEffect(() => {
    loadFilters();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadBeneficiaries();
  }, [loadBeneficiaries]);

  const handleViewBeneficiary = async (id) => {
    setDetailModalOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setSelectedBeneficiary(null);
    try {
      const data = await getBeneficiaryById(id);
      setSelectedBeneficiary(data.beneficiary);
    } catch (err) {
      console.error("Error loading beneficiary details:", err);
      setDetailError(err?.response?.data?.message || "Failed to load beneficiary details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = {
        search: searchQuery,
        status: filters.status || undefined,
        program: filters.program || undefined,
        county: filters.county || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      };
      const blob = await exportBeneficiaries(params);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `beneficiaries_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to export beneficiaries. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: "", program: "", county: "", dateFrom: "", dateTo: "" });
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;
    setCurrentPage(newPage);
  };

  const handleAddBeneficiary = () => {
    // Navigate to a future add-beneficiary route; for now open a placeholder
    setConfirmAction({ type: "add", label: "Add Beneficiary" });
    setConfirmOpen(true);
  };

  const confirmAdd = () => {
    setConfirmOpen(false);
    setConfirmAction(null);
    navigate("/beneficiaries/add");
  };

  const statCards = [
    {
      title: "Total Beneficiaries",
      value: stats.total,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      loading: statsLoading,
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      loading: statsLoading,
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      loading: statsLoading,
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: Ban,
      color: "text-rose-600",
      bg: "bg-rose-50",
      loading: statsLoading,
    },
  ];

  const activeFiltersCount = Object.values(filters).filter((v) => v).length;

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
          userName={user?.fullName || user?.username || "Administrator"}
          userRole={user?.role || "admin"}
        />

        <motion.main
          className="bursary-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Page header */}
          <section className="panel-card" style={{ marginBottom: "24px" }}>
            <div className="card-title-row">
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 600, color: "var(--gov-gray-900)" }}>
                  Beneficiaries
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--gov-gray-500)" }}>
                  Manage and monitor all registered beneficiaries
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: "1 1 250px" }}>
                  <Search
                    size={16}
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#64748b",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, ID, application number..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="gov-input"
                    style={{ width: "100%", padding: "10px 12px 10px 36px" }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Statistics cards */}
          <section className="panel-card" style={{ marginBottom: "24px" }}>
            <div
              className="stat-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              {statCards.map((card) => (
                <StatCard key={card.title} card={card} />
              ))}
            </div>
          </section>

          {/* Filters & actions */}
          <section className="panel-card" style={{ marginBottom: "24px" }}>
            <div className="card-title-row" style={{ marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Filters</h3>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {activeFiltersCount > 0 && (
                  <span
                    className="status-pill"
                    style={{
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      background: "rgba(124, 58, 237, 0.1)",
                      color: "var(--gov-primary-dark)",
                    }}
                  >
                    {activeFiltersCount} active
                  </span>
                )}
                <button
                  className="icon-btn soft"
                  onClick={() => setShowFilters((prev) => !prev)}
                  aria-label={showFilters ? "Hide filters" : "Show filters"}
                  title={showFilters ? "Hide filters" : "Show filters"}
                >
                  <Filter size={16} />
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div
                    className="filters-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <FilterSelect
                      label="Status"
                      value={filters.status}
                      options={filterOptions.statuses}
                      onChange={(v) => handleFilterChange("status", v)}
                      placeholder="All statuses"
                    />
                    <FilterSelect
                      label="Program"
                      value={filters.program}
                      options={filterOptions.programs}
                      onChange={(v) => handleFilterChange("program", v)}
                      placeholder="All programs"
                    />
                    <FilterSelect
                      label="County"
                      value={filters.county}
                      options={filterOptions.counties}
                      onChange={(v) => handleFilterChange("county", v)}
                      placeholder="All counties"
                    />
                    <FilterSelect
                      label="Academic Year"
                      value={filters.academicYear}
                      options={filterOptions.academicYears}
                      onChange={(v) => handleFilterChange("academicYear", v)}
                      placeholder="All years"
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 500, color: "#64748b" }}>
                        Registration Date
                      </label>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                          className="gov-input"
                          style={{ flex: 1, padding: "8px 10px", fontSize: "13px" }}
                        />
                        <input
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                          className="gov-input"
                          style={{ flex: 1, padding: "8px 10px", fontSize: "13px" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    <button className="gov-btn gov-btn-secondary" onClick={clearFilters}>
                      Clear All
                    </button>
                    <button className="gov-btn" onClick={() => setShowFilters(false)}>
                      Apply
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showFilters && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                <button
                  className="gov-btn"
                  onClick={() => setShowFilters(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Filter size={14} />
                  Filters
                </button>
                {canCreate && (
                  <button
                    className="gov-btn"
                    onClick={handleAddBeneficiary}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <UserPlus size={14} />
                    Add Beneficiary
                  </button>
                )}
                <button
                  className="gov-btn gov-btn-secondary"
                  onClick={handleExport}
                  disabled={exportLoading}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  {exportLoading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                  Export
                </button>
              </div>
            )}
          </section>

          {/* Beneficiaries table */}
          <section className="panel-card">
            <div className="card-title-row" style={{ marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Registered Beneficiaries</h3>
              <div style={{ fontSize: "13px", color: "#64748b" }}>
                {totalRecords} record{totalRecords !== 1 ? "s" : ""} found
              </div>
            </div>

            {error ? (
              <ErrorState message={error} onRetry={loadBeneficiaries} />
            ) : loading ? (
              <LoadingState rows={pageSize} />
            ) : beneficiaries.length === 0 ? (
              <EmptyState
                icon={<FileText size={48} />}
                title="No beneficiaries found"
                description={
                  activeFiltersCount > 0
                    ? "Try adjusting your search or filter criteria."
                    : "No registered beneficiaries match your query."
                }
                action={activeFiltersCount > 0 ? clearFilters : undefined}
                actionLabel="Clear filters"
              />
            ) : (
              <>
                <div className="table-responsive" style={{ overflowX: "auto" }}>
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>Beneficiary</th>
                        <th>Beneficiary ID</th>
                        <th>National ID</th>
                        <th>Institution</th>
                        <th>Approved</th>
                        <th>Paid</th>
                        <th>Balance</th>
                        <th>Status</th>
                        <th>Registration Date</th>
                        <th style={{ textAlign: "center" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {beneficiaries.map((beneficiary, index) => (
                          <motion.tr
                            key={beneficiary.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: index * 0.02, duration: 0.2 }}
                            className="hover-row"
                          >
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <BeneficiaryAvatar
                                  photoUrl={beneficiary.photoUrl}
                                  fullName={beneficiary.fullName}
                                />
                                <div>
                                  <div style={{ fontWeight: 500, color: "var(--gov-gray-900)" }}>
                                    {beneficiary.fullName || "—"}
                                  </div>
                                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                                    {beneficiary.phoneNumber || "—"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontSize: "13px", color: "#334155" }}>
                              {beneficiary.beneficiaryNumber || "—"}
                            </td>
                            <td style={{ fontSize: "13px", color: "#334155" }}>
                              {maskNationalId(beneficiary.nationalId)}
                            </td>
                            <td style={{ fontSize: "13px", color: "#334155" }}>
                              {beneficiary.institutionName || "—"}
                              <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                                {beneficiary.institutionType || ""}
                              </div>
                            </td>
                            <td style={{ fontSize: "13px", color: "#334155", fontWeight: 500 }}>
                              {formatCurrency(beneficiary.approvedAmount)}
                            </td>
                            <td style={{ fontSize: "13px", color: "#334155" }}>
                              {formatCurrency(beneficiary.totalDisbursed)}
                            </td>
                            <td style={{ fontSize: "13px", color: "#334155", fontWeight: 500 }}>
                              {formatCurrency(beneficiary.remainingBalance)}
                            </td>
                            <td>
                              <StatusPill status={beneficiary.status} />
                            </td>
                            <td style={{ fontSize: "13px", color: "#64748b" }}>
                              {formatDate(beneficiary.createdAt)}
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                <button
                                  className="icon-btn soft"
                                  onClick={() => handleViewBeneficiary(beneficiary.id)}
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  className="icon-btn soft"
                                  onClick={() => {
                                    navigator.clipboard.writeText(beneficiary.beneficiaryNumber || "");
                                  }}
                                  title="Copy Beneficiary ID"
                                >
                                  <Copy size={16} />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalRecords={totalRecords}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </section>

          <footer className="dashboard-footer">
            <p>© 2026 Advenware. All rights reserved.</p>
          </footer>
        </motion.main>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailModalOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDetailModalOpen(false)}
          >
            <motion.div
              className="modal-content"
              layoutId="beneficiary-detail"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "900px", maxHeight: "90vh", overflowY: "auto" }}
            >
              <div className="modal-header">
                <h2>Beneficiary Profile</h2>
                <button
                  className="icon-btn soft"
                  onClick={() => setDetailModalOpen(false)}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                {detailLoading ? (
                  <div style={{ padding: "20px 0", textAlign: "center", color: "#64748b" }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 12px" }} />
                    <p>Loading beneficiary details...</p>
                  </div>
                ) : detailError ? (
                  <ErrorState message={detailError} onRetry={() => selectedBeneficiary && handleViewBeneficiary(selectedBeneficiary.id)} />
                ) : selectedBeneficiary ? (
                  <BeneficiaryDetail beneficiary={selectedBeneficiary} />
                ) : null}
              </div>

              <div className="modal-footer">
                <button className="gov-btn gov-btn-secondary" onClick={() => setDetailModalOpen(false)}>
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmOpen(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "420px" }}
            >
              <div className="modal-header">
                <h2>
                  <AlertCircle size={20} style={{ marginRight: "8px", color: "#f59e0b" }} />
                  {confirmAction?.label}
                </h2>
                <button className="icon-btn soft" onClick={() => setConfirmOpen(false)} aria-label="Close">
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p style={{ color: "#475569", lineHeight: 1.5 }}>
                  Beneficiaries are automatically created when bursary applications are approved.
                  To register a new beneficiary, approve an application in the Bursary Applications module.
                </p>
              </div>
              <div className="modal-footer">
                <button className="gov-btn gov-btn-secondary" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </button>
                <button className="gov-btn" onClick={confirmAdd}>
                  Go to Bursary Applications
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ card }) {
  const { title, value, icon: Icon, color, bg, loading } = card;
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        background: "var(--gov-white)",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
        border: "1px solid var(--gov-border)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        className={bg}
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} className={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "12px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.04em" }}>
          {title}
        </div>
        {loading ? (
          <div style={{ height: "22px", width: "60%", background: "#f1f5f9", borderRadius: "4px", marginTop: "4px" }} />
        ) : (
          <div style={{ fontSize: "22px", fontWeight: 700, color: "var(--gov-gray-900)", marginTop: "4px" }}>
            {value.toLocaleString()}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function BeneficiaryAvatar({ photoUrl, fullName }) {
  const initials = useMemo(() => {
    const name = fullName || "";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) return "?";
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }, [fullName]);

  if (photoUrl) {
    return (
      <div
        className="beneficiary-avatar"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          overflow: "hidden",
          flexShrink: 0,
          background: "#e2e8f0",
        }}
      >
        <img src={photoUrl} alt={fullName || "Beneficiary"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <div
      className="beneficiary-avatar"
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        flexShrink: 0,
        background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
        color: "var(--gov-white)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: "14px",
      }}
    >
      {initials}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <label style={{ fontSize: "12px", fontWeight: 500, color: "#64748b" }}>{label}</label>
      <select
        className="gov-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px 10px",
          fontSize: "13px",
          border: "1px solid var(--gov-border)",
          borderRadius: "8px",
          background: "var(--gov-white)",
          color: "var(--gov-gray-700)",
          cursor: "pointer",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function LoadingState({ rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="gov-table">
        <thead>
          <tr>
            <th>Beneficiary</th>
            <th>Beneficiary ID</th>
            <th>National ID</th>
            <th>Program</th>
            <th>County / Location</th>
            <th>Status</th>
            <th>Registration Date</th>
            <th style={{ textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: 8 }).map((_, j) => (
                <td key={j}>
                  <div
                    className="skeleton"
                    style={{
                      height: "14px",
                      width: j === 0 ? "100%" : j === 7 ? "60px" : "80%",
                      borderRadius: "4px",
                      background: "#f1f5f9",
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ icon, title, description, action, actionLabel }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 24px",
        color: "#64748b",
      }}
    >
      <div style={{ marginBottom: "16px", opacity: 0.5 }}>{icon}</div>
      <h4 style={{ margin: "0 0 6px", fontSize: "16px", color: "#334155" }}>{title}</h4>
      <p style={{ margin: "0 0 16px", fontSize: "13px", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
        {description}
      </p>
      {action && actionLabel ? (
        <button className="gov-btn gov-btn-secondary" onClick={action}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 24px",
        color: "#b91c1c",
      }}
    >
      <AlertCircle size={48} style={{ marginBottom: "16px", opacity: 0.7 }} />
      <h4 style={{ margin: "0 0 6px", fontSize: "16px" }}>Something went wrong</h4>
      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#7f1d1d" }}>{message}</p>
      {onRetry && (
        <button className="gov-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

function Pagination({ currentPage, totalPages, totalRecords, pageSize, onPageChange }) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalRecords);

  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div
      className="pagination-bar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
        borderTop: "1px solid var(--gov-border)",
        fontSize: "13px",
        color: "#64748b",
      }}
    >
      <div style={{ fontSize: "13px", color: "#64748b" }}>
        Showing <strong>{start}</strong>–<strong>{end}</strong> of <strong>{totalRecords}</strong>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <button
          className="icon-btn soft"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          title="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            className={`icon-btn soft ${page === currentPage ? "active" : ""}`}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            style={
              page === currentPage
                ? {
                    background: "var(--gov-primary)",
                    color: "var(--gov-white)",
                    borderRadius: "6px",
                  }
                : undefined
            }
          >
            {page}
          </button>
        ))}
        <button
          className="icon-btn soft"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          title="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function BeneficiaryDetail({ beneficiary }) {
  const fullName = beneficiary.fullName || "—";
  const maskedId = maskNationalId(beneficiary.nationalId);

  const infoGrid = [
    { label: "Beneficiary ID", value: beneficiary.applicationNumber },
    { label: "Full Name", value: fullName },
    { label: "National ID", value: maskedId },
    { label: "Gender", value: beneficiary.gender },
    { label: "Date of Birth", value: formatDate(beneficiary.dateOfBirth) },
    { label: "Phone Number", value: beneficiary.phoneNumber },
    { label: "Email", value: beneficiary.email || "—" },
    { label: "County", value: beneficiary.county || "—" },
    { label: "Constituency", value: beneficiary.constituency || "—" },
    { label: "Ward", value: beneficiary.ward || "—" },
    { label: "Residential Address", value: beneficiary.residentialAddress || "—" },
  ];

  const programGrid = [
    { label: "Institution", value: beneficiary.institutionName },
    { label: "Institution Type", value: beneficiary.institutionType },
    { label: "Course / Form", value: beneficiary.courseOrForm || "—" },
    { label: "Academic Year", value: beneficiary.academicYear },
    { label: "Admission Number", value: beneficiary.admissionNumber || "—" },
    { label: "Student Reg. No.", value: beneficiary.studentRegistrationNumber || "—" },
    { label: "Year of Study", value: beneficiary.yearOfStudy || "—" },
  ];

  const financialGrid = [
    { label: "Total Fees", value: formatCurrency(beneficiary.totalFees) },
    { label: "Amount Paid", value: formatCurrency(beneficiary.amountPaid) },
    { label: "Outstanding Balance", value: formatCurrency(beneficiary.outstandingBalance) },
    { label: "Amount Requested", value: formatCurrency(beneficiary.amountRequested) },
    { label: "Approved Amount", value: beneficiary.approvedAmount ? formatCurrency(beneficiary.approvedAmount) : "—" },
    { label: "Total Disbursed", value: formatCurrency(beneficiary.totalDisbursed) },
    { label: "Remaining Balance", value: formatCurrency(beneficiary.remainingBalance) },
  ];

  const parentGrid = [
    { label: "Parent / Guardian", value: beneficiary.parentFullName || "—" },
    { label: "Relationship", value: beneficiary.parentRelationship || "—" },
    { label: "Parent Phone", value: beneficiary.parentPhone || "—" },
    { label: "Parent Occupation", value: beneficiary.parentOccupation || "—" },
    { label: "Dependants", value: beneficiary.numberOfDependants },
    { label: "Household Income", value: formatCurrency(beneficiary.householdMonthlyIncome) },
  ];

  const documentTypeLabels = {
    National_ID: "National ID",
    Birth_Certificate: "Birth Certificate",
    Admission_Letter: "Admission Letter",
    Fee_Structure: "Fee Structure",
    Academic_Results: "Academic Results",
    Parent_ID: "Parent ID",
    Other: "Other",
  };

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {/* Header: photo + verification */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          padding: "16px",
          background: "var(--gov-gray-50)",
          borderRadius: "10px",
        }}
      >
        <BeneficiaryAvatar photoUrl={beneficiary.photoUrl} fullName={fullName} />
        <div>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "var(--gov-gray-900)" }}>
            {fullName}
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
            Beneficiary ID: {beneficiary.applicationNumber}
          </p>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <StatusPill status={beneficiary.status} />
          <div style={{ marginTop: "6px", fontSize: "12px", color: "#64748b" }}>
            Verification:{" "}
            <strong
              style={{
                color:
                  beneficiary.verificationStatus === "Verified"
                    ? "#16a34a"
                    : beneficiary.verificationStatus === "Pending Verification"
                    ? "#d97706"
                    : "#64748b",
              }}
            >
              {beneficiary.verificationStatus}
            </strong>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600, color: "var(--gov-gray-700)" }}>
          Personal Information
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          {infoGrid.map((item) => (
            <InfoRow key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </div>

      {/* Program / Benefit Information */}
      <div>
        <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600, color: "var(--gov-gray-700)" }}>
          Program & Benefit Information
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          {programGrid.map((item) => (
            <InfoRow key={item.label} label={item.label} value={item.value} />
          ))}
          {financialGrid.map((item) => (
            <InfoRow key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </div>

      {/* Parent / Guardian */}
      <div>
        <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600, color: "var(--gov-gray-700)" }}>
          Parent / Guardian Information
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
          }}
        >
          {parentGrid.map((item) => (
            <InfoRow key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </div>

      {/* Documents */}
      <div>
        <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600, color: "var(--gov-gray-700)" }}>
          Documents
        </h4>
        {beneficiary.documents && beneficiary.documents.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {beneficiary.documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  background: "var(--gov-white)",
                  border: "1px solid var(--gov-border)",
                  borderRadius: "8px",
                }}
              >
                <FileText size={18} style={{ color: "#64748b", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--gov-gray-900)" }}>
                    {documentTypeLabels[doc.documentType] || doc.documentType}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", truncate: "middle" }}>
                    {doc.fileName}
                  </div>
                </div>
                {doc.secureUrl && (
                  <a
                    href={doc.secureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="icon-btn soft"
                    title="View document"
                    style={{ flexShrink: 0 }}
                  >
                    <Eye size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText size={36} />}
            title="No documents uploaded"
            description="No supporting documents have been attached to this beneficiary record."
          />
        )}
      </div>

      {/* Payment History */}
      {beneficiary.payments && beneficiary.payments.length > 0 && (
        <div>
          <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600, color: "var(--gov-gray-700)" }}>
            Payment History
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {beneficiary.payments.map((payment) => (
              <div
                key={payment.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  background: "var(--gov-white)",
                  border: "1px solid var(--gov-border)",
                  borderRadius: "8px",
                }}
              >
                <Wallet size={18} style={{ color: "#64748b", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--gov-gray-900)" }}>
                    {formatCurrency(payment.amount)} via {payment.method}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {payment.paymentCode} • {formatDate(payment.createdAt)} • {payment.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit / Activity History */}
      <div>
        <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 600, color: "var(--gov-gray-700)" }}>
          Audit & Activity History
        </h4>
        {beneficiary.history && beneficiary.history.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {beneficiary.history.map((h) => (
              <div
                key={h.id}
                style={{
                  padding: "10px 12px",
                  background: "var(--gov-white)",
                  border: "1px solid var(--gov-border)",
                  borderRadius: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--gov-gray-900)" }}>
                    {h.action}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>{formatDate(h.createdAt)}</div>
                </div>
                {(h.previousStatus || h.newStatus) && (
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                    {h.previousStatus ? `${h.previousStatus} → ` : ""}
                    {h.newStatus || ""}
                  </div>
                )}
                {h.performedByName && (
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                    by {h.performedByName}
                  </div>
                )}
                {h.notes && <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>{h.notes}</div>}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FileText size={36} />}
            title="No activity recorded"
            description="There is no audit or activity history for this beneficiary record."
          />
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.03em" }}>
        {label}
      </div>
      <div style={{ fontSize: "13px", color: "var(--gov-gray-700)", marginTop: "2px", wordBreak: "break-word" }}>
        {value === null || value === undefined || value === "" ? "—" : String(value)}
      </div>
    </div>
  );
}

export default Beneficiaries;
