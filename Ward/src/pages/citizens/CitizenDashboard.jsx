import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CircleAlert,
  FolderKanban,
  CalendarDays,
  Megaphone,
  PlusCircle,
  FileText,
  TrendingUp,
  Clock,
  GraduationCap,
} from "lucide-react";
import CitizenLayout from "../../components/citizens/CitizenLayout";
import WelcomeSection from "../../components/citizens/WelcomeSection";
import {
  getCitizenComplaints,
  getWardProjects,
  getWardMeetings,
  getAnnouncements,
  getNotifications,
} from "../../services/citizenApi";

function StatCard({ title, value, description, icon: Icon, trend, index = 0 }) {
  return (
    <motion.article
      className="stat-card citizen-stat-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.28 }}
      whileHover={{ y: -4 }}
    >
      <div className="stat-head">
        <div className="stat-icon">{Icon ? <Icon size={18} /> : null}</div>
        <p className="trend">{trend}</p>
      </div>
      <h3>{value}</h3>
      <h4>{title}</h4>
      <p>{description}</p>
    </motion.article>
  );
}

function CitizenDashboard() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("dashboard");
  const [stats, setStats] = useState({
    myComplaints: 0,
    inProgress: 0,
    resolved: 0,
    upcomingMeetings: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [complaintsRes, projectsRes, meetingsRes, announcementsRes, notificationsRes] = await Promise.all([
          getCitizenComplaints(),
          getWardProjects(),
          getWardMeetings(),
          getAnnouncements(),
          getNotifications(),
        ]);

        const complaints = complaintsRes.complaints || [];
        const projects = projectsRes.projects || [];
        const meetings = meetingsRes.meetings || [];
        const anns = announcementsRes.announcements || [];
        const notifs = notificationsRes.notifications || [];

        setStats({
          myComplaints: complaints.length,
          inProgress: complaints.filter((c) => c.status === "In_Progress" || c.status === "Assigned").length,
          resolved: complaints.filter((c) => c.status === "Resolved" || c.status === "Closed").length,
          upcomingMeetings: meetings.length,
        });

        setRecentComplaints(complaints.slice(0, 5));
        setRecentProjects(projects.slice(0, 3));
        setUpcomingMeetings(meetings.slice(0, 3));
        setAnnouncements(anns.slice(0, 3));
        setNotifications(notifs.slice(0, 5));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const breadcrumb = ["Dashboard", "Overview"];

  const handleItemClick = (id) => {
    setActiveItem(id);
    switch (id) {
      case "dashboard":
        navigate("/citizen/dashboard");
        break;
      case "complaints":
        navigate("/citizen/complaints");
        break;
      case "bursary":
        navigate("/citizen/bursary/tracking");
        break;
      case "projects":
        navigate("/citizen/projects");
        break;
      case "meetings":
        navigate("/citizen/meetings");
        break;
      case "announcements":
        navigate("/citizen/announcements");
        break;
      case "notifications":
        navigate("/citizen/notifications");
        break;
      case "profile":
        navigate("/citizen/profile");
        break;
      default:
        break;
    }
  };

  const statCards = [
    {
      title: "My Complaints",
      value: stats.myComplaints.toString(),
      description: "Total complaints submitted",
      icon: CircleAlert,
      trend: `${stats.inProgress} in progress`,
    },
    {
      title: "In Progress",
      value: stats.inProgress.toString(),
      description: "Currently being handled",
      icon: Clock,
      trend: "Active",
    },
    {
      title: "Resolved",
      value: stats.resolved.toString(),
      description: "Successfully resolved",
      icon: TrendingUp,
      trend: "Completed",
    },
    {
      title: "Upcoming Meetings",
      value: stats.upcomingMeetings.toString(),
      description: "Scheduled ward meetings",
      icon: CalendarDays,
      trend: "Next 30 days",
    },
  ];

  if (loading) {
    return (
      <CitizenLayout activeItem={activeItem} onItemClick={handleItemClick} breadcrumb={breadcrumb}>
        <div className="loading-screen">
          <p>Loading your dashboard...</p>
        </div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout activeItem={activeItem} onItemClick={handleItemClick} breadcrumb={breadcrumb}>
      {/* Hero + Inspiring Stories */}
      <WelcomeSection />

      {/* Quick Actions */}
      <motion.section
        className="citizen-quick-actions"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
      >
        <button className="gov-btn gov-btn-primary" onClick={() => navigate("/citizen/complaints")}>
          <PlusCircle size={18} />
          <span>Report a Complaint</span>
        </button>
        <button className="gov-btn gov-btn-secondary" onClick={() => navigate("/citizen/bursary/apply")}>
          <GraduationCap size={18} />
          <span>Apply for Bursary</span>
        </button>
        <button className="gov-btn gov-btn-secondary" onClick={() => navigate("/citizen/bursary/tracking")}>
          <FileText size={18} />
          <span>My Bursary Applications</span>
        </button>
      </motion.section>

      {/* Quick Stats */}
      <section className="stats-grid citizen-stats-grid">
        {statCards.map((card, index) => (
          <StatCard key={card.title} {...card} index={index} />
        ))}
      </section>

      {/* Recent Complaints */}
      {recentComplaints.length > 0 && (
        <section className="panel-card citizen-panel">
          <div className="card-title-row">
            <h3>My Recent Complaints</h3>
            <button className="gov-btn gov-btn-ghost" onClick={() => navigate("/citizen/complaints")}>
              View All
            </button>
          </div>
          <div className="citizen-complaint-list">
            {recentComplaints.map((complaint, index) => (
              <motion.div
                key={complaint.id}
                className="citizen-complaint-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                whileHover={{ y: -2 }}
              >
                <div className="citizen-complaint-header">
                  <span className="citizen-complaint-code">{complaint.complaintCode}</span>
                  <span className={`status-pill ${complaint.status.toLowerCase().replace("_", "-")}`}>
                    {complaint.status.replace("_", " ")}
                  </span>
                </div>
                <h4>{complaint.category.replace("_", " ")}</h4>
                <p className="citizen-complaint-meta">
                  <span>📅 {complaint.dateReported}</span>
                  <span>📍 {complaint.village}</span>
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Projects & Meetings Grid */}
      <div className="citizen-dashboard-grid">
        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <section className="panel-card citizen-panel">
            <div className="card-title-row">
              <h3>Development Projects</h3>
              <button className="gov-btn gov-btn-ghost" onClick={() => navigate("/citizen/projects")}>
                View All
              </button>
            </div>
            <div className="citizen-project-list">
              {recentProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="citizen-project-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  whileHover={{ y: -2 }}
                >
                  <div className="citizen-project-header">
                    <h4>{project.projectName}</h4>
                    <span className={`status-pill project-${project.status.toLowerCase()}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="citizen-project-desc">{project.description}</p>
                  <div className="citizen-project-progress">
                    <div className="citizen-progress-bar">
                      <div
                        className="citizen-progress-fill"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span>{project.progress}%</span>
                  </div>
                  <p className="citizen-project-meta">
                    <span>📅 Started: {project.startDate}</span>
                    <span>👤 {project.projectManagerName || "TBD"}</span>
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Meetings */}
        {upcomingMeetings.length > 0 && (
          <section className="panel-card citizen-panel">
            <div className="card-title-row">
              <h3>Upcoming Meetings</h3>
              <button className="gov-btn gov-btn-ghost" onClick={() => navigate("/citizen/meetings")}>
                View All
              </button>
            </div>
            <div className="citizen-meeting-list">
              {upcomingMeetings.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  className="citizen-meeting-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  whileHover={{ y: -2 }}
                >
                  <h4>{meeting.title}</h4>
                  <p className="citizen-meeting-meta">
                    <span>📅 {meeting.date}</span>
                    <span>🕐 {meeting.time}</span>
                    <span>📍 {meeting.venue}</span>
                  </p>
                  <span className={`meeting-type-pill ${meeting.type.toLowerCase().replace("_", "-")}`}>
                    {meeting.type.replace("_", " ")}
                  </span>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="panel-card citizen-panel">
          <div className="card-title-row">
            <h3>Ward Announcements</h3>
            <button className="gov-btn gov-btn-ghost" onClick={() => navigate("/citizen/announcements")}>
              View All
            </button>
          </div>
          <div className="citizen-announcement-list">
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                className="citizen-announcement-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                whileHover={{ y: -2 }}
              >
                <div className="citizen-announcement-header">
                  <h4>{announcement.title}</h4>
                  <span className={`announcement-category-pill ${announcement.category.toLowerCase().replace("_", "-")}`}>
                    {announcement.category.replace("_", " ")}
                  </span>
                </div>
                <p>{announcement.description}</p>
                <small>📅 {announcement.publishedAt || announcement.createdAt}</small>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <section className="panel-card citizen-panel">
          <div className="card-title-row">
            <h3>Recent Notifications</h3>
            <button className="gov-btn gov-btn-ghost" onClick={() => navigate("/citizen/notifications")}>
              View All
            </button>
          </div>
          <ul className="notification-list">
            {notifications.map((notification, index) => (
              <motion.li
                key={notification.id}
                className={`notice ${notification.type.toLowerCase().replace("_", "-")} ${!notification.isRead ? "unread" : ""}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <span className="notification-icon">🔔</span>
                <div className="notification-content">
                  <strong>{notification.title}</strong>
                  <p>{notification.message}</p>
                  <small>{new Date(notification.createdAt).toLocaleDateString()}</small>
                </div>
              </motion.li>
            ))}
          </ul>
        </section>
      )}
    </CitizenLayout>
  );
}

export default CitizenDashboard;
