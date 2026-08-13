import { useMemo, useState } from "react";
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

const PIE_COLORS = ["#006B3C", "#0E8A4B", "#2D936C", "#65A30D", "#C9A227"];

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const handleItemClick = (id) => {
    if (id === "logout") {
      onLogout();
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
    if (id === "settings") {
      navigate("/settings");
      return;
    }
    setActiveItem(id);
    setMobileOpen(false);
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
              Hon. Gabriel Kithaka
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
                Ward: Westlands
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
        </section>

        <section className="charts-grid">
          <ChartCard title="Complaint Trends">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={complaintTrends}>
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="complaints" stroke="#006B3C" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Projects by Status">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={projectStatusData}>
                <XAxis dataKey="status" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill="#0E8A4B" radius={[8, 8, 0, 0]} />
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
                  <QuickActionCard key={action.id} {...action} index={index} />
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
