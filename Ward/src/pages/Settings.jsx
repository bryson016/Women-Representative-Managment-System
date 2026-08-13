import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CircleAlert,
  Database,
  FileChartColumnIncreasing,
  FolderKanban,
  ShieldCheck,
  Settings,
  Users,
  Wallet,
  X,
  Save,
  Upload,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import {
  settingsCategories,
} from "../data/settings";
import {
  fetchSettings,
  updateSettings,
  fetchSystemStatus,
  fetchActivities,
  uploadLogo,
} from "../services/settingsService";
import { storeAuthSession, getStoredUser } from "../utils/tokenStorage";

const ICON_MAP = {
  Settings,
  Users,
  Bell,
  FolderKanban,
  Wallet,
  CircleAlert,
  CalendarDays,
  FileChartColumnIncreasing,
  ShieldCheck,
  Database,
};

const SETTINGS_KEYS = {
  wardName: "ward_name",
  wardCode: "ward_code",
  county: "county",
  systemName: "system_name",
  financialYear: "financial_year",
  timeZone: "time_zone",
  email: "email",
  phone: "phone",
  officeAddress: "office_address",
  logoBase64: "logo_base64",
};

function SettingsPage({ onLogout }) {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("settings");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState("general");

  const [formData, setFormData] = useState({
    wardName: "",
    wardCode: "",
    county: "",
    systemName: "",
    financialYear: "",
    timeZone: "",
    email: "",
    phone: "",
    officeAddress: "",
    logoBase64: "",
  });

  const [logoPreview, setLogoPreview] = useState("/Advenware.jpeg");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [systemStatus, setSystemStatus] = useState({
    system: { status: "Online", description: "All systems operational" },
    database: { status: "Connected", description: "Last backup: --" },
    activeUsers: { value: "--", description: "Users currently active" },
    storage: { value: "--", description: "Storage currently used" },
  });

  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

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

  const breadcrumb = ["Dashboard", "Settings"];

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
    if (id === "reports") {
      navigate("/reports");
      return;
    }
    setActiveItem(id);
    setMobileOpen(false);
  };

  const handleCategoryClick = useCallback((categoryId) => {
    setActiveCategory(categoryId);
  }, []);

  // Load settings from backend
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await fetchSettings();
        const settingsMap = {};
        data.forEach((s) => {
          const key = Object.keys(SETTINGS_KEYS).find(
            (k) => SETTINGS_KEYS[k] === s.setting_key
          );
          if (key) {
            settingsMap[key] = s.setting_value;
          }
        });
        setFormData((prev) => ({ ...prev, ...settingsMap }));

        // Set logo preview if exists
        if (settingsMap.logoBase64) {
          setLogoPreview(settingsMap.logoBase64);
        }
      } catch (err) {
        console.error("Load settings error:", err);
        // Fallback to localStorage
        const stored = localStorage.getItem("ward-settings");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setFormData((prev) => ({ ...prev, ...parsed }));
            if (parsed.logoBase64) {
              setLogoPreview(parsed.logoBase64);
            }
          } catch {
            // ignore
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Load system status
  useEffect(() => {
    async function loadSystemStatus() {
      try {
        const data = await fetchSystemStatus();
        setSystemStatus(data);
      } catch (err) {
        console.error("Load system status error:", err);
      }
    }
    loadSystemStatus();
  }, []);

  // Load activities
  useEffect(() => {
    async function loadActivities() {
      try {
        setActivitiesLoading(true);
        const data = await fetchActivities(1, 50);
        setActivities(data);
      } catch (err) {
        console.error("Load activities error:", err);
      } finally {
        setActivitiesLoading(false);
      }
    }
    loadActivities();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    try {
      setUploadingLogo(true);
      setError("");
      setSuccess("");

      // Create local preview immediately
      const localPreview = URL.createObjectURL(file);
      setLogoPreview(localPreview);

      // Upload to Cloudinary via backend
      const result = await uploadLogo(file);
      
      if (result?.media?.url) {
        setLogoPreview(result.media.url);
        setFormData((prev) => ({ ...prev, logoBase64: result.media.url }));
        setSuccess("Logo uploaded successfully to Cloudinary!");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to upload logo.";
      setError(message);
      console.error("Upload logo error:", err);
      // Revert to previous preview on error
      setLogoPreview(formData.logoBase64 || "/Advenware.jpeg");
    } finally {
      setUploadingLogo(false);
    }
  };

  const validateForm = () => {
    if (!formData.wardName.trim()) {
      setError("Ward Name is required.");
      return false;
    }
    if (!formData.wardCode.trim()) {
      setError("Ward Code is required.");
      return false;
    }
    if (!formData.county.trim()) {
      setError("County is required.");
      return false;
    }
    if (!formData.systemName.trim()) {
      setError("System Name is required.");
      return false;
    }
    if (!formData.financialYear.trim()) {
      setError("Financial Year is required.");
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Valid email is required.");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required.");
      return false;
    }
    if (!formData.officeAddress.trim()) {
      setError("Office Address is required.");
      return false;
    }
    return true;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const settingsToUpdate = Object.entries(SETTINGS_KEYS).map(([formKey, dbKey]) => ({
        key: dbKey,
        value: formData[formKey] || "",
      }));

      await updateSettings(settingsToUpdate);
      setSuccess("Settings saved successfully!");
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to save settings. Please try again.";
      setError(message);
      console.error("Save settings error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Fallback: load from localStorage if backend fails
  useEffect(() => {
    if (loading) return;
    const stored = localStorage.getItem("ward-settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    }
  }, [loading]);

  // Persist to localStorage as fallback
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("ward-settings", JSON.stringify(formData));
    }
  }, [formData, loading]);

  const handleCategoryNavigation = (categoryId) => {
    const routeMap = {
      general: "/settings",
      users: "/citizens",
      notifications: "/dashboard",
      projects: "/projects",
      budget: "/budget",
      complaints: "/complaints",
      meetings: "/meetings",
      reports: "/reports",
      security: "/dashboard",
      system: "/dashboard",
    };
    const route = routeMap[categoryId];
    if (route) {
      navigate(route);
    }
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case "general":
        return (
          <motion.section
            className="settings-content-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="card-title-row">
              <h3>General Settings</h3>
              <span className="settings-subtitle">Ward information and system details</span>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <div className="settings-form-grid">
              <div className="settings-form-group">
                <label htmlFor="wardName">Ward Name</label>
                <input
                  type="text"
                  id="wardName"
                  name="wardName"
                  value={formData.wardName}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="settings-form-group">
                <label htmlFor="wardCode">Ward Code</label>
                <input
                  type="text"
                  id="wardCode"
                  name="wardCode"
                  value={formData.wardCode}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="settings-form-group">
                <label htmlFor="county">County</label>
                <input
                  type="text"
                  id="county"
                  name="county"
                  value={formData.county}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="settings-form-group">
                <label htmlFor="systemName">System Name</label>
                <input
                  type="text"
                  id="systemName"
                  name="systemName"
                  value={formData.systemName}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="settings-form-group">
                <label htmlFor="financialYear">Financial Year</label>
                <input
                  type="text"
                  id="financialYear"
                  name="financialYear"
                  value={formData.financialYear}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="settings-form-group">
                <label htmlFor="timeZone">Time Zone</label>
                <input
                  type="text"
                  id="timeZone"
                  name="timeZone"
                  value={formData.timeZone}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="settings-form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="settings-form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="settings-form-group full-width">
                <label htmlFor="officeAddress">Office Address</label>
                <input
                  type="text"
                  id="officeAddress"
                  name="officeAddress"
                  value={formData.officeAddress}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="settings-form-group full-width">
                <label>Logo</label>
                <div className="logo-upload-area">
                  <div className="logo-preview">
                    <img src={logoPreview} alt="Current Logo" />
                  </div>
                  <div className="logo-upload-actions">
                    <label className="gov-btn gov-btn-secondary" htmlFor="logo-upload-input">
                      <Upload size={16} />
                      {uploadingLogo ? "Uploading..." : "Upload New Logo"}
                    </label>
                    <input
                      id="logo-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="settings-actions">
              <button
                className="gov-btn gov-btn-primary"
                onClick={handleSaveChanges}
                disabled={saving || loading || uploadingLogo}
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.section>
        );
      case "users":
        return (
          <motion.section
            className="settings-content-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="card-title-row">
              <h3>Users & Roles</h3>
              <span className="settings-subtitle">Manage users and permissions</span>
            </div>
            <div className="settings-placeholder">
              <Users size={48} />
              <h4>User Management</h4>
              <p>Configure user accounts, roles, and permissions for ward administration staff.</p>
              <button className="gov-btn gov-btn-primary" onClick={() => navigate("/citizens")}>
                Manage Users
              </button>
            </div>
          </motion.section>
        );
      case "notifications":
        return (
          <motion.section
            className="settings-content-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="card-title-row">
              <h3>Notifications</h3>
              <span className="settings-subtitle">Configure alerts and reminders</span>
            </div>
            <div className="settings-placeholder">
              <Bell size={48} />
              <h4>Notification Preferences</h4>
              <p>Set up email, SMS, and in-app notifications for ward activities and alerts.</p>
              <button className="gov-btn gov-btn-primary" onClick={() => navigate("/dashboard")}>
                Configure Notifications
              </button>
            </div>
          </motion.section>
        );
      case "projects":
        return (
          <motion.section
            className="settings-content-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="card-title-row">
              <h3>Project Settings</h3>
              <span className="settings-subtitle">Configure project categories and statuses</span>
            </div>
            <div className="settings-placeholder">
              <FolderKanban size={48} />
              <h4>Project Configuration</h4>
              <p>Define project categories, statuses, workflows, and approval processes.</p>
              <button className="gov-btn gov-btn-primary" onClick={() => navigate("/projects")}>
                Configure Projects
              </button>
            </div>
          </motion.section>
        );
      case "budget":
        return (
          <motion.section
            className="settings-content-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="card-title-row">
              <h3>Budget Settings</h3>
              <span className="settings-subtitle">Configure financial years, categories, and limits</span>
            </div>
            <div className="settings-placeholder">
              <Wallet size={48} />
              <h4>Budget Configuration</h4>
              <p>Set financial years, budget categories, approval limits, and allocation rules.</p>
              <button className="gov-btn gov-btn-primary" onClick={() => navigate("/budget")}>
                Configure Budget
              </button>
            </div>
          </motion.section>
        );
      case "complaints":
        return (
          <motion.section
            className="settings-content-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="card-title-row">
              <h3>Complaint Settings</h3>
              <span className="settings-subtitle">Configure complaint categories, priorities, and workflows</span>
            </div>
            <div className="settings-placeholder">
              <CircleAlert size={48} />
              <h4>Complaint Configuration</h4>
              <p>Define complaint categories, priority levels, escalation rules, and response times.</p>
              <button className="gov-btn gov-btn-primary" onClick={() => navigate("/complaints")}>
                Configure Complaints
              </button>
            </div>
          </motion.section>
        );
      case "meetings":
        return (
          <motion.section
            className="settings-content-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="card-title-row">
              <h3>Meeting Settings</h3>
              <span className="settings-subtitle">Configure meeting preferences</span>
            </div>
            <div className="settings-placeholder">
              <CalendarDays size={48} />
              <h4>Meeting Configuration</h4>
              <p>Set meeting types, venues, notification preferences, and attendance tracking.</p>
              <button className="gov-btn gov-btn-primary" onClick={() => navigate("/meetings")}>
                Configure Meetings
              </button>
            </div>
          </motion.section>
        );
      case "reports":
        return (
          <motion.section
            className="settings-content-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="card-title-row">
              <h3>Reports & Export Settings</h3>
              <span className="settings-subtitle">Configure reports and data exports</span>
            </div>
            <div className="settings-placeholder">
              <FileChartColumnIncreasing size={48} />
              <h4>Reports Configuration</h4>
              <p>Configure report templates, export formats, scheduling, and distribution lists.</p>
              <button className="gov-btn gov-btn-primary" onClick={() => navigate("/reports")}>
                Configure Reports
              </button>
            </div>
          </motion.section>
        );
      case "security":
        return (
          <motion.section
            className="settings-content-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="card-title-row">
              <h3>Security & Audit Logs</h3>
              <span className="settings-subtitle">Monitor system activity and audit records</span>
            </div>
            <div className="settings-placeholder">
              <ShieldCheck size={48} />
              <h4>Security & Audit</h4>
              <p>View audit logs, manage security policies, and monitor system access.</p>
              <button className="gov-btn gov-btn-primary" onClick={() => navigate("/dashboard")}>
                View Audit Logs
              </button>
            </div>
          </motion.section>
        );
      case "system":
        return (
          <motion.section
            className="settings-content-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="card-title-row">
              <h3>System & Database</h3>
              <span className="settings-subtitle">Manage backups, database status, and system health</span>
            </div>
            <div className="settings-placeholder">
              <Database size={48} />
              <h4>System Management</h4>
              <p>Manage database backups, system health checks, and maintenance schedules.</p>
              <button className="gov-btn gov-btn-primary" onClick={() => navigate("/dashboard")}>
                System Health Check
              </button>
            </div>
          </motion.section>
        );
      default:
        return null;
    }
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
          className="welcome-banner settings-hero"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div>
            <h1>Settings</h1>
            <h2>
              Manage system preferences, users, permissions, notifications, and administrative
              configurations.
            </h2>
            <div className="ward-meta">
              <span>
                <Settings size={14} />
                System Administration
              </span>
              <span>
                <ShieldCheck size={14} />
                Secure Access
              </span>
            </div>
          </div>
        </motion.section>

        <section className="settings-layout">
          <div className="settings-sidebar">
            <div className="settings-sidebar-header">
              <h3>Settings Categories</h3>
            </div>
            <nav className="settings-nav">
              {settingsCategories.map((category) => {
                const Icon = ICON_MAP[category.icon] || Settings;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    className={`settings-nav-item ${isActive ? "active" : ""}`}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <Icon size={18} />
                    <div className="settings-nav-text">
                      <span className="settings-nav-label">{category.label}</span>
                      <span className="settings-nav-desc">{category.description}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="settings-main">
            {renderCategoryContent()}

            {activeCategory === "general" && (
              <>
                <section className="system-status-grid">
                  <motion.div
                    className="status-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.25 }}
                  >
                    <div className={`status-indicator ${systemStatus.system.status === "Online" ? "online" : "offline"}`} />
                    <h4>System Status</h4>
                    <p className="status-value">{systemStatus.system.status}</p>
                    <p className="status-desc">{systemStatus.system.description}</p>
                  </motion.div>
                  <motion.div
                    className="status-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.25 }}
                  >
                    <div className={`status-indicator ${systemStatus.database.status === "Connected" ? "online" : "offline"}`} />
                    <h4>Database Status</h4>
                    <p className="status-value">{systemStatus.database.status}</p>
                    <p className="status-desc">{systemStatus.database.description}</p>
                  </motion.div>
                  <motion.div
                    className="status-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.25 }}
                  >
                    <div className="status-indicator online" />
                    <h4>Active Users</h4>
                    <p className="status-value">{systemStatus.activeUsers.value}</p>
                    <p className="status-desc">{systemStatus.activeUsers.description}</p>
                  </motion.div>
                  <motion.div
                    className="status-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.25 }}
                  >
                    <div className="status-indicator online" />
                    <h4>Storage Usage</h4>
                    <p className="status-value">{systemStatus.storage.value}</p>
                    <p className="status-desc">{systemStatus.storage.description}</p>
                  </motion.div>
                </section>

                <section className="recent-activities-section">
                  <div className="card-title-row">
                    <h3>Recent System Activities</h3>
                    <button className="gov-btn gov-btn-ghost" onClick={() => navigate("/dashboard")}>
                      View All Logs
                    </button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Activity</th>
                          <th>User</th>
                          <th>Details</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activitiesLoading ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                              Loading activities...
                            </td>
                          </tr>
                        ) : activities.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                              No activities found.
                            </td>
                          </tr>
                        ) : (
                          activities.map((activity) => (
                            <tr key={activity.id}>
                              <td className="td-activity">{activity.activity}</td>
                              <td>{activity.user_name}</td>
                              <td>{activity.details}</td>
                              <td>{new Date(activity.created_at).toLocaleString("en-KE")}</td>
                              <td>
                                <span className={`status-pill ${activity.status === "Success" ? "resolved" : "pending"}`}>
                                  {activity.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </div>
        </section>

        <footer className="dashboard-footer">
          <p>Ward Management System</p>
          <p>© 2026 Advanware. All rights reserved.</p>
          <p>Version 1.0</p>
        </footer>
      </div>
    </div>
  );
}

export default SettingsPage;
