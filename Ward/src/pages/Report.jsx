import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle,
  ClipboardCheck,
  Clock,
  Download,
  Eye,
  FileChartColumnIncreasing,
  FileText,
  Filter,
  MessageSquareWarning,
  Search,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import DashboardCard from "../components/DashboardCard";
import ChartCard from "../components/ChartCard";
import {
  reportActivityData,
  reportCategoryData,
  reportStats,
  recentReports,
  quickReports,
  reportTypes,
  departments,
  periods,
  wardPerformanceData,
} from "../data/reports";

const PIE_COLORS = ["#006B3C", "#0E8A4B", "#2D936C", "#65A30D", "#C9A227", "#047857"];

const ICON_MAP = {
  FileText,
  CheckCircle,
  Clock,
  FileChartColumnIncreasing,
  BarChart3,
  MessageSquareWarning,
  Building2,
  Wallet,
  Users,
  ClipboardCheck,
};

function Report({ onLogout }) {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("reports");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    reportType: "",
    period: "",
    department: "",
    format: "PDF",
  });

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

  const breadcrumb = ["Dashboard", "Reports"];

  const handleItemClick = (id) => {
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
    if (id === "staff") {
      navigate("/staff");
      return;
    }
    if (id === "budget") {
      navigate("/budget");
      return;
    }
    if (id === "settings") {
      navigate("/settings");
      return;
    }
    setActiveItem(id);
    setMobileOpen(false);
  };

  const filteredReports = recentReports.filter((report) => {
    const matchesSearch =
      !searchQuery ||
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.generatedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || report.category === selectedCategory;
    const matchesStatus = !selectedStatus || report.status === selectedStatus;
    const matchesPeriod = !selectedPeriod || report.period.includes(selectedPeriod);
    return matchesSearch && matchesCategory && matchesStatus && matchesPeriod;
  });

  const handleGenerateReport = () => {
    if (!generateForm.reportType || !generateForm.period || !generateForm.department) {
      return;
    }
    alert(
      `Report Generated!\n\nType: ${generateForm.reportType}\nPeriod: ${generateForm.period}\nDepartment: ${generateForm.department}\nFormat: ${generateForm.format}`
    );
    setShowGenerateModal(false);
    setGenerateForm({ reportType: "", period: "", department: "", format: "PDF" });
  };

  const handleQuickReport = (reportId) => {
    alert(`Generating ${reportId.replace(/-/g, " ")} report...`);
  };

  const handlePreview = (reportName) => {
    alert(`Previewing: ${reportName}`);
  };

  const handleDownload = (reportName, format) => {
    alert(`Downloading ${reportName} as ${format}...`);
  };

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
          breadcrumb={breadcrumb}
          currentDate={currentDate}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <motion.section
          className="welcome-banner reports-hero"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div>
            <h1>Reports Dashboard</h1>
            <h2>
              Generate, track, and manage ward reports with complete transparency and
              accountability.
            </h2>
            <div className="ward-meta">
              <span>
                <CalendarDays size={14} />
                Financial Year: 2026/2027
              </span>
              <span>
                <Building2 size={14} />
                County: Nairobi
              </span>
              <span>
                <FileText size={14} />
                Ward: Westlands
              </span>
            </div>
          </div>
        </motion.section>

        <section className="stats-grid">
          {reportStats.map((card, index) => {
            const Icon = ICON_MAP[card.icon] || FileText;
            return (
              <DashboardCard
                key={card.id}
                title={card.title}
                value={card.value}
                description={card.description}
                trend={card.trend}
                icon={Icon}
                index={index}
              />
            );
          })}
        </section>

        <section className="reports-generate-section">
          <div className="card-title-row">
            <h3>Generate New Report</h3>
            <button
              className="gov-btn gov-btn-primary"
              onClick={() => setShowGenerateModal(true)}
            >
              <FileChartColumnIncreasing size={16} />
              Generate Report
            </button>
          </div>
          <div className="generate-form-grid">
            <div className="filter-item">
              <label>Report Type</label>
              <select
                value={generateForm.reportType}
                onChange={(e) =>
                  setGenerateForm((prev) => ({ ...prev, reportType: e.target.value }))
                }
              >
                <option value="">Select report type</option>
                {reportTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Period</label>
              <select
                value={generateForm.period}
                onChange={(e) =>
                  setGenerateForm((prev) => ({ ...prev, period: e.target.value }))
                }
              >
                <option value="">Select period</option>
                {periods.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Department</label>
              <select
                value={generateForm.department}
                onChange={(e) =>
                  setGenerateForm((prev) => ({ ...prev, department: e.target.value }))
                }
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label>Format</label>
              <select
                value={generateForm.format}
                onChange={(e) =>
                  setGenerateForm((prev) => ({ ...prev, format: e.target.value }))
                }
              >
                <option value="PDF">PDF</option>
                <option value="Excel">Excel</option>
              </select>
            </div>
          </div>
        </section>

        <section className="charts-grid">
          <ChartCard title="Report Activity">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={reportActivityData}>
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="reports"
                  stroke="#006B3C"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Total Reports"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#0E8A4B"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#C9A227"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="Pending"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Report Categories">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={reportCategoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {reportCategoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Ward Performance">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={wardPerformanceData}>
                <XAxis dataKey="ward" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar
                  dataKey="score"
                  fill="#006B3C"
                  radius={[8, 8, 0, 0]}
                  name="Performance Score"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        <section className="reports-filters-section">
          <div className="filters-bar">
            <div className="search-input-group">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search reports by name, category, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-search-input"
              />
            </div>
            <div className="filters-select-group">
              <div className="filter-item">
                <label>Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {reportTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="filter-item">
                <label>Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="">All Periods</option>
                  {periods.map((period) => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
              <button
                className="gov-btn gov-btn-ghost"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("");
                  setSelectedStatus("");
                  setSelectedPeriod("");
                }}
              >
                <Filter size={14} />
                Clear Filters
              </button>
            </div>
          </div>
        </section>

        <section className="recent-reports-section">
          <div className="card-title-row">
            <h3>Recent Reports</h3>
            <span className="report-count">
              {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""} found
            </span>
          </div>
          <div className="table-wrap">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Category</th>
                  <th>Period</th>
                  <th>Generated By</th>
                  <th>Date</th>
                  <th>Format</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td className="td-report-name">{report.name}</td>
                    <td>{report.category}</td>
                    <td>{report.period}</td>
                    <td>{report.generatedBy}</td>
                    <td>{report.date}</td>
                    <td>
                      <span className="format-badge">{report.format}</span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${report.status.toLowerCase()}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="td-actions">
                      <div className="action-btn-group">
                        <button
                          className="table-action-btn"
                          onClick={() => handlePreview(report.name)}
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="table-action-btn"
                          onClick={() => handleDownload(report.name, report.format)}
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="quick-reports-section">
          <div className="card-title-row">
            <h3>Quick Reports</h3>
          </div>
          <div className="quick-reports-grid">
            {quickReports.map((report, index) => {
              const Icon = ICON_MAP[report.icon] || FileText;
              return (
                <motion.button
                  key={report.id}
                  className="quick-report-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.24 }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQuickReport(report.id)}
                >
                  <div className="quick-report-icon">
                    <Icon size={20} />
                  </div>
                  <span>{report.label}</span>
                </motion.button>
              );
            })}
          </div>
        </section>

        <footer className="dashboard-footer">
          <p>Ward Management System</p>
          <p>© 2026 Advanware. All rights reserved.</p>
          <p>Version 1.0</p>
        </footer>
      </div>

      {showGenerateModal && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowGenerateModal(false)}
        >
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Generate New Report</h3>
              <button
                className="icon-btn"
                onClick={() => setShowGenerateModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="filter-item">
                <label>Report Type</label>
                <select
                  value={generateForm.reportType}
                  onChange={(e) =>
                    setGenerateForm((prev) => ({ ...prev, reportType: e.target.value }))
                  }
                >
                  <option value="">Select report type</option>
                  {reportTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-item">
                <label>Period</label>
                <select
                  value={generateForm.period}
                  onChange={(e) =>
                    setGenerateForm((prev) => ({ ...prev, period: e.target.value }))
                  }
                >
                  <option value="">Select period</option>
                  {periods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-item">
                <label>Department</label>
                <select
                  value={generateForm.department}
                  onChange={(e) =>
                    setGenerateForm((prev) => ({ ...prev, department: e.target.value }))
                  }
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-item">
                <label>Format</label>
                <select
                  value={generateForm.format}
                  onChange={(e) =>
                    setGenerateForm((prev) => ({ ...prev, format: e.target.value }))
                  }
                >
                  <option value="PDF">PDF</option>
                  <option value="Excel">Excel</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="gov-btn gov-btn-secondary"
                onClick={() => setShowGenerateModal(false)}
              >
                Cancel
              </button>
              <button
                className="gov-btn gov-btn-primary"
                onClick={handleGenerateReport}
                disabled={!generateForm.reportType || !generateForm.period || !generateForm.department}
              >
                <FileChartColumnIncreasing size={16} />
                Generate Report
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Report;
