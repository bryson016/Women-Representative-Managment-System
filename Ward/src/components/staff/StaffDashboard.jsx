import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Building2,
  Clock,
  MapPin,
  Phone,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

function StaffDashboard({ staff, onViewStaff }) {
  // Group staff by department
  const departments = useMemo(() => {
    const map = {};
    staff.forEach((s) => {
      if (!map[s.department]) map[s.department] = [];
      map[s.department].push(s);
    });
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [staff]);

  // Top performers
  const topPerformers = useMemo(() => {
    return [...staff].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5);
  }, [staff]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = { "On Duty": 0, "Off Duty": 0, "On Leave": 0, "Field Visit": 0 };
    staff.forEach((s) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return counts;
  }, [staff]);

  // Recent activity (simulated from lastActive)
  const recentActivity = useMemo(() => {
    return [...staff]
      .filter((s) => s.lastActive && s.lastActive.startsWith("Today"))
      .sort((a, b) => {
        const timeA = parseInt(a.lastActive.match(/(\d+):(\d+)/)?.[1] || "0", 10);
        const timeB = parseInt(b.lastActive.match(/(\d+):(\d+)/)?.[1] || "0", 10);
        return timeB - timeA;
      })
      .slice(0, 6);
  }, [staff]);

  const avgPerformance = staff.length > 0
    ? Math.round(staff.reduce((sum, s) => sum + s.performanceScore, 0) / staff.length)
    : 0;

  const getStatusClass = (status) => {
    switch (status) {
      case "On Duty": return "status-pill staff-on-duty";
      case "Off Duty": return "status-pill staff-off-duty";
      case "On Leave": return "status-pill staff-on-leave";
      case "Field Visit": return "status-pill staff-field-visit";
      default: return "status-pill";
    }
  };

  const getInitials = (s) => `${s.firstName[0]}${s.lastName[0]}`;

  return (
    <div className="staff-dashboard-grid">
      {/* Department Team Cards */}
      <motion.section
        className="panel-card staff-team-section"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Building2 size={16} /> Department Teams</h3>
          <span className="citizen-count">{departments.length} departments</span>
        </div>
        <div className="staff-team-grid">
          {departments.map(([dept, members], deptIndex) => (
            <motion.div
              key={dept}
              className="staff-team-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: deptIndex * 0.05, duration: 0.25 }}
              whileHover={{ y: -3 }}
            >
              <div className="staff-team-head">
                <div className="staff-team-icon">
                  <Building2 size={16} />
                </div>
                <div>
                  <h4>{dept}</h4>
                  <span>{members.length} member{members.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
              <div className="staff-team-avatars">
                {members.slice(0, 5).map((member) => (
                  <button
                    key={member.id}
                    className="staff-avatar-btn"
                    onClick={() => onViewStaff(member)}
                    title={`${member.firstName} ${member.lastName} - ${member.role}`}
                  >
                    {getInitials(member)}
                  </button>
                ))}
                {members.length > 5 && (
                  <span className="staff-avatar-more">+{members.length - 5}</span>
                )}
              </div>
              <div className="staff-team-meta">
                <span>
                  <TrendingUp size={12} />
                  {Math.round(members.reduce((sum, m) => sum + m.performanceScore, 0) / members.length)}% avg
                </span>
                <span>
                  <MapPin size={12} />
                  {new Set(members.flatMap((m) => m.villagesCovered)).size} villages
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Top Performers Leaderboard */}
      <motion.section
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Award size={16} /> Top Performers</h3>
          <span className="citizen-count">This month</span>
        </div>
        <div className="leaderboard">
          {topPerformers.map((member, index) => (
            <motion.button
              key={member.id}
              className={`leaderboard-item ${index === 0 ? "rank-1" : ""}`}
              onClick={() => onViewStaff(member)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06, duration: 0.25 }}
              whileHover={{ x: 4 }}
            >
              <span className={`leaderboard-rank ${index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : ""}`}>
                {index + 1}
              </span>
              <span className="leaderboard-avatar">{getInitials(member)}</span>
              <span className="leaderboard-info">
                <strong>{member.firstName} {member.lastName}</strong>
                <small>{member.role} • {member.department}</small>
              </span>
              <span className="leaderboard-score">{member.performanceScore}%</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* On-Duty Status Board */}
      <motion.section
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><UserCheck size={16} /> Staff Availability</h3>
          <span className="citizen-count">Live</span>
        </div>
        <div className="status-board">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="status-board-item">
              <span className={getStatusClass(status)}>{status}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
        <div className="status-board-progress">
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.3rem" }}>
            <span style={{ color: "#334155" }}>Active workforce</span>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>
              {((statusCounts["On Duty"] + statusCounts["Field Visit"]) / staff.length * 100).toFixed(0)}%
            </span>
          </div>
          <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${((statusCounts["On Duty"] + statusCounts["Field Visit"]) / staff.length * 100)}%`,
              background: "linear-gradient(90deg, #7c3aed, #7c3aed)",
              borderRadius: "999px",
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      </motion.section>

      {/* Recent Staff Activity */}
      <motion.section
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Clock size={16} /> Recent Activity</h3>
          <span className="citizen-count">Today</span>
        </div>
        <ul className="timeline">
          {recentActivity.map((member, index) => (
            <li key={member.id} className="timeline-item">
              <span className="dot" />
              {index < recentActivity.length - 1 && <span className="line" />}
              <h4>{member.firstName} {member.lastName}</h4>
              <p>{member.role} • {member.department}</p>
              <small>{member.lastActive}</small>
            </li>
          ))}
          {recentActivity.length === 0 && (
            <li className="no-data">No activity recorded today yet.</li>
          )}
        </ul>
      </motion.section>

      {/* Team Summary */}
      <motion.section
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Users size={16} /> Team Summary</h3>
        </div>
        <div className="quick-stats-grid">
          <div className="quick-stat-item">
            <div className="quick-stat-icon"><Users size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{staff.length}</span>
              <span className="quick-stat-label">Total Staff</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon" style={{ background: "#f5f3ff", color: "#6d28d9" }}><TrendingUp size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{avgPerformance}%</span>
              <span className="quick-stat-label">Avg Performance</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon" style={{ background: "#eff6ff", color: "#1d4ed8" }}><Building2 size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{departments.length}</span>
              <span className="quick-stat-label">Departments</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon" style={{ background: "#fff7ed", color: "#c2410c" }}><Phone size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{staff.reduce((sum, s) => sum + s.workload, 0)}</span>
              <span className="quick-stat-label">Total Workload</span>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default StaffDashboard;
