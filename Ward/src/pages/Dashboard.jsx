import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
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
import { CheckCircle, GraduationCap, Clock, XCircle, Wallet, BarChart3 } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import DashboardCard from "../components/DashboardCard";
import QuickActionCard from "../components/QuickActionCard";
import ChartCard from "../components/ChartCard";
import ActivityTimeline from "../components/ActivityTimeline";
import NotificationPanel from "../components/NotificationPanel";
import MeetingCard from "../components/MeetingCard";
import ComplaintTable from "../components/ComplaintTable";
import {
  budgetAllocationData,
  complaintTrends,
  notifications,
  projectStatusData,
  quickActions,
  recentActivities,
  recentComplaints,
  statCards,
  upcomingMeetings,
} from "../data/dashboardData";
import { getBursaryStats } from "../services/bursaryApi";

const PIE_COLORS = ["#7c3aed", "#8b5cf6", "#2D936C", "#65A30D", "#C9A227"];

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bursaryStats, setBursaryStats] = useState(null);

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

  const breadcrumb = ["Dashboard", activeItem === "dashboard" ? "Overview" : activeItem];

  useEffect(() => {
    async function loadBursaryStats() {
      try {
        const data = await getBursaryStats();
        setBursaryStats(data);
      } catch (error) {
        console.error("Error loading bursary stats:", error);
      }
    }
    loadBursaryStats();
  }, []);

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
    if (id === "my-applications") {
      navigate("/citizen/bursary/tracking");
      return;
    }
    setActiveItem(id);
    setMobileOpen(false);
  };

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

        <motion.section
          className="welcome-banner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            >
              Welcome Back,
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            >
              Hon. Nancy Wangari
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
            >
              Monitor ward activities, development projects, citizen services, and public complaints from one
              centralized dashboard.
            </motion.p>
            <motion.div
              className="ward-meta"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.55, ease: "easeOut" }}
              >
                County: Nairobi
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.65, ease: "easeOut" }}
              >
                Ward: Narok
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.75, ease: "easeOut" }}
              >
                Financial Year: 2026/2027
              </motion.span>
            </motion.div>
          </div>
        </motion.section>

        <section className="stats-grid">
          {statCards.map((card, index) => (
            <DashboardCard key={card.id} {...card} index={index} />
          ))}
          {bursaryStats && (
            <>
              <motion.div
                className="stat-card"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.28 }}
                whileHover={{ y: -4 }}
              >
                <div className="stat-head">
                  <div className="stat-icon" style={{ background: "#7c3aed15", color: "#7c3aed" }}>
                    <GraduationCap size={18} />
                  </div>
                </div>
                <h3>{bursaryStats.totalApplications}</h3>
                <h4>Total Applications</h4>
                <p>{bursaryStats.pending} pending review</p>
              </motion.div>
              <motion.div
                className="stat-card"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.28 }}
                whileHover={{ y: -4 }}
              >
                <div className="stat-head">
                  <div className="stat-icon" style={{ background: "#f59e0b15", color: "#f59e0b" }}>
                    <Clock size={18} />
                  </div>
                </div>
                <h3>{bursaryStats.underReview}</h3>
                <h4>Under Review</h4>
                <p>Awaiting decision</p>
              </motion.div>
              <motion.div
                className="stat-card"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.28 }}
                whileHover={{ y: -4 }}
              >
                <div className="stat-head">
                  <div className="stat-icon" style={{ background: "#10b98115", color: "#10b981" }}>
                    <CheckCircle size={18} />
                  </div>
                </div>
                <h3>{bursaryStats.approved}</h3>
                <h4>Approved</h4>
                <p>KES {bursaryStats.totalAmountApproved?.toLocaleString() || 0}</p>
              </motion.div>
              <motion.div
                className="stat-card"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.28 }}
                whileHover={{ y: -4 }}
              >
                <div className="stat-head">
                  <div className="stat-icon" style={{ background: "#ef444415", color: "#ef4444" }}>
                    <XCircle size={18} />
                  </div>
                </div>
                <h3>{bursaryStats.rejected}</h3>
                <h4>Rejected</h4>
                <p>Not approved</p>
              </motion.div>
              <motion.div
                className="stat-card"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.28 }}
                whileHover={{ y: -4 }}
              >
                <div className="stat-head">
                  <div className="stat-icon" style={{ background: "#05966915", color: "#059669" }}>
                    <Wallet size={18} />
                  </div>
                </div>
                <h3>{bursaryStats.disbursed}</h3>
                <h4>Disbursed</h4>
                <p>Payments made</p>
              </motion.div>
              <motion.div
                className="stat-card"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.28 }}
                whileHover={{ y: -4 }}
              >
                <div className="stat-head">
                  <div className="stat-icon" style={{ background: "#6366f115", color: "#6366f1" }}>
                    <BarChart3 size={18} />
                  </div>
                </div>
                <h3>KES {bursaryStats.totalAmountRequested?.toLocaleString() || 0}</h3>
                <h4>Total Requested</h4>
                <p>All applications</p>
              </motion.div>
            </>
          )}
        </section>

        <section className="charts-grid">
          <ChartCard title="Complaint Trends">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={complaintTrends}>
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="complaints" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Projects by Status">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={projectStatusData}>
                <XAxis dataKey="status" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Ward Budget Allocation">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={budgetAllocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95}>
                  {budgetAllocationData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        <section className="content-grid">
          <ComplaintTable rows={recentComplaints} />

          <div className="stacked-panels">
            <section className="panel-card">
              <div className="card-title-row">
                <h3>Upcoming Meetings</h3>
              </div>
              <div className="meeting-grid">
                {upcomingMeetings.map((meeting, index) => (
                  <MeetingCard key={meeting.id} meeting={meeting} index={index} />
                ))}
              </div>
            </section>

            <section className="panel-card">
              <div className="card-title-row">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-grid">
                {quickActions.map((action, index) => (
                  <QuickActionCard
                    key={action.id}
                    {...action}
                    index={index}
                    onClick={() => {
                      if (action.id === "register-citizen") navigate("/citizens");
                      else if (action.id === "record-complaint") navigate("/complaints");
                      else if (action.id === "add-project") navigate("/projects");
                      else if (action.id === "schedule-meeting") navigate("/meetings");
                      else if (action.id === "manage-staff") navigate("/staff");
                      else if (action.id === "generate-report") navigate("/reports");
                    }}
                  />
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="bottom-grid">
          <ActivityTimeline items={recentActivities} />
          <NotificationPanel items={notifications} />
        </section>

        <footer className="dashboard-footer">
          <p>© 2026 Advanware. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;
