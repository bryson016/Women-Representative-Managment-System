import { motion } from "framer-motion";
import { Activity, CalendarClock, CheckCircle2, TrendingUp, Wallet } from "lucide-react";

function ProjectSidebar({ projects }) {
  const formatKES = (amount) => {
    if (amount >= 1000000000) return `KES ${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `KES ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `KES ${(amount / 1000).toFixed(0)}K`;
    return `KES ${amount}`;
  };

  // Recent activities from all projects
  const recentActivities = projects
    .flatMap((p) =>
      (p.activityTimeline || []).map((a) => ({ ...a, projectCode: p.projectCode, projectName: p.projectName }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Upcoming milestones - pending or on track
  const upcomingMilestones = projects
    .flatMap((p) =>
      (p.milestones || [])
        .filter((m) => m.status === "Pending" || m.status === "On Track" || m.status === "Ongoing")
        .map((m) => ({ ...m, projectCode: p.projectCode, projectName: p.projectName }))
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // Recent budget updates
  const recentBudgetUpdates = projects
    .flatMap((p) =>
      (p.budgetUpdates || [])
        .filter((b) => b.type !== "returned")
        .map((b) => ({ ...b, projectCode: p.projectCode, projectName: p.projectName }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  // Latest completed projects
  const completedProjects = projects
    .filter((p) => p.status === "Completed")
    .sort((a, b) => new Date(b.expectedCompletion) - new Date(a.expectedCompletion))
    .slice(0, 4);

  // Quick summary stats
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.amountSpent, 0);
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0;

  return (
    <div className="projects-sidebar">
      {/* Recent Project Activities */}
      <motion.div
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Activity size={16} /> Recent Project Activities</h3>
        </div>
        {recentActivities.length > 0 ? (
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {recentActivities.map((activity, index) => (
              <div key={index} className="project-activity-item">
                <div className="milestone-head">
                  <strong>{activity.action}</strong>
                </div>
                <div className="milestone-meta">
                  <span>{activity.projectCode}</span>
                  <span>· {activity.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No recent activities.</p>
        )}
      </motion.div>

      {/* Upcoming Milestones */}
      <motion.div
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><CalendarClock size={16} /> Upcoming Milestones</h3>
        </div>
        {upcomingMilestones.length > 0 ? (
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {upcomingMilestones.map((milestone, index) => (
              <div key={index} className="milestone-item">
                <div className="milestone-head">
                  <span className="milestone-title">{milestone.title}</span>
                  <span className="status-pill project-planning">{milestone.status}</span>
                </div>
                <div className="milestone-meta">
                  <span>{milestone.projectCode}</span>
                  <span>· Due: {milestone.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No upcoming milestones.</p>
        )}
      </motion.div>

      {/* Recent Budget Updates */}
      <motion.div
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Wallet size={16} /> Recent Budget Updates</h3>
        </div>
        {recentBudgetUpdates.length > 0 ? (
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {recentBudgetUpdates.map((update, index) => (
              <div key={index} className="project-activity-item">
                <div className="milestone-head">
                  <span className="milestone-title">{update.item}</span>
                </div>
                <div className="milestone-meta">
                  <span style={{ fontWeight: 700, color: "#166534" }}>{formatKES(update.amount)}</span>
                  <span>· {update.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No budget updates.</p>
        )}
      </motion.div>

      {/* Latest Completed Projects */}
      <motion.div
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><CheckCircle2 size={16} /> Latest Completed Projects</h3>
        </div>
        {completedProjects.length > 0 ? (
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {completedProjects.map((project, index) => (
              <div key={index} className="project-activity-item">
                <div className="milestone-head">
                  <span className="milestone-title">{project.projectName}</span>
                </div>
                <div className="milestone-meta">
                  <span>{project.projectCode}</span>
                  <span>· {project.expectedCompletion}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No completed projects yet.</p>
        )}
      </motion.div>

      {/* Quick Summary */}
      <motion.div
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><TrendingUp size={16} /> Quick Summary</h3>
        </div>
        <div className="quick-stats-grid">
          <div className="quick-stat-item">
            <div className="quick-stat-icon"><Wallet size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{formatKES(totalBudget)}</span>
              <span className="quick-stat-label">Total Budget</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon"><TrendingUp size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{formatKES(totalSpent)}</span>
              <span className="quick-stat-label">Total Spent</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon"><Activity size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{avgProgress}%</span>
              <span className="quick-stat-label">Avg Progress</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon"><CalendarClock size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{upcomingMilestones.length}</span>
              <span className="quick-stat-label">Milestones Due</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ProjectSidebar;
