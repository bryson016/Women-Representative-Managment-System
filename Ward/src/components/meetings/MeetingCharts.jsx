import { motion } from "framer-motion";
import { BarChart3, CalendarDays, CalendarCheck2, Users, CheckCircle2, Clock, AlertTriangle, ClipboardList, MapPin } from "lucide-react";

function MeetingCharts({ meetings }) {
  // Calculate chart data
  const typeData = {};
  const statusData = {};
  const villageData = {};
  let totalExpected = 0;
  let totalActual = 0;
  let completedCount = 0;
  let completedActions = 0;
  let totalActions = 0;

  meetings.forEach((m) => {
    typeData[m.type] = (typeData[m.type] || 0) + 1;
    statusData[m.status] = (statusData[m.status] || 0) + 1;
    villageData[m.village] = (villageData[m.village] || 0) + 1;

    totalExpected += m.expectedAttendance;
    totalActual += m.actualAttendance;

    if (m.status === "Completed") {
      completedCount++;
    }

    if (m.actionItems && m.actionItems.length > 0) {
      totalActions += m.actionItems.length;
      completedActions += m.actionItems.filter((a) => a.status === "Completed").length;
    }
  });

  const attendanceRate = totalExpected > 0 ? Math.round((totalActual / totalExpected) * 100) : 0;
  const actionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
  const upcoming = (statusData["Scheduled"] || 0) + (statusData["In Progress"] || 0);
  const inProgressCount = statusData["In Progress"] || 0;

  const maxType = Math.max(...Object.values(typeData), 1);
  const maxVillage = Math.max(...Object.values(villageData), 1);

  const typeColors = {
    "Ward Development Committee": "#006b3c",
    "Public Baraza": "#d4a017",
    "Budget Review": "#0e8a4b",
    "Planning Session": "#1d4ed8",
    "Town Hall": "#7c3aed",
    "Project Steering Committee": "#b91c1c",
    "Health & Sanitation Forum": "#f59e0b",
    "Education Committee": "#0e7490",
    "Security Committee": "#64748b",
    "Water & Environment Committee": "#0891b2",
  };

  const statusColors = {
    "Scheduled": "#1d4ed8",
    "In Progress": "#f59e0b",
    "Completed": "#166534",
    "Postponed": "#7c3aed",
    "Cancelled": "#64748b",
  };

  const statusDotColors = {
    "Scheduled": "#dbeafe",
    "In Progress": "#fef3c7",
    "Completed": "#dcfce7",
    "Postponed": "#f3e8ff",
    "Cancelled": "#f1f5f9",
  };

  return (
    <div className="charts-grid" style={{ marginTop: "0.85rem" }}>
      {/* Meetings by Type */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><BarChart3 size={16} /> Meetings by Type</h3>
        </div>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {Object.entries(typeData).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([type, count]) => (
            <div key={type} style={{ display: "grid", gap: "0.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                <span style={{ color: "#334155" }}>{type}</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{count}</span>
              </div>
              <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(count / maxType) * 100}%`,
                  background: typeColors[type] || "#006b3c",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Meetings by Status */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Clock size={16} /> Meetings by Status</h3>
        </div>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {Object.entries(statusData).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
            <div key={status} style={{ display: "grid", gap: "0.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                <span style={{ color: "#334155" }}>{status}</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{count}</span>
              </div>
              <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(count / meetings.length) * 100}%`,
                  background: statusColors[status] || "#006b3c",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Upcoming Schedule / Next 7 days */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><CalendarDays size={16} /> Upcoming Schedule</h3>
        </div>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {meetings
            .filter((m) => m.status === "Scheduled" || m.status === "In Progress")
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 5)
            .map((m, index) => {
              const dateObj = new Date(m.date + "T00:00:00");
              const day = dateObj.toLocaleDateString("en-KE", { weekday: "short" });
              const dayNum = dateObj.toLocaleDateString("en-KE", { day: "2-digit" });
              return (
                <div key={m.id} style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  border: "1px solid var(--gov-gray-200)", borderRadius: "0.6rem",
                  padding: "0.5rem 0.6rem",
                }}>
                  <div style={{
                    width: "2.4rem", height: "2.4rem", borderRadius: "0.55rem",
                    background: "#e8f6ee", color: "#0e8a4b", display: "grid",
                    placeItems: "center", flexShrink: 0,
                  }}>
                    <div style={{ textAlign: "center", lineHeight: 1.05 }}>
                      <div style={{ fontSize: "0.62rem", fontWeight: 600 }}>{day}</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{dayNum}</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: "0.1rem", minWidth: 0 }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.title}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: "#64748b" }}>
                      <Clock size={11} />
                      <span>{m.time}</span>
                      <span style={{ margin: "0 0.1rem" }}>•</span>
                      <MapPin size={11} />
                      <span>{m.venue}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </motion.div>

      {/* Meetings by Village */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><BarChart3 size={16} /> Meetings by Village</h3>
        </div>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {Object.entries(villageData).sort((a, b) => b[1] - a[1]).map(([village, count]) => (
            <div key={village} style={{ display: "grid", gap: "0.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                <span style={{ color: "#334155" }}>{village}</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{count}</span>
              </div>
              <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(count / maxVillage) * 100}%`,
                  background: "#0e8a4b",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Attendance Performance */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Users size={16} /> Attendance Performance</h3>
        </div>
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#0f172a" }}>
            {attendanceRate}%
          </div>
          <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.3rem" }}>
            Average attendance rate
          </div>
          <div style={{ marginTop: "0.8rem", height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.min(attendanceRate, 100)}%`,
              background: attendanceRate >= 70 ? "#166534" : attendanceRate >= 50 ? "#f59e0b" : "#b91c1c",
              borderRadius: "999px",
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.3rem" }}>
            {totalActual} attended out of {totalExpected} invited
          </div>
        </div>
      </motion.div>

      {/* Meetings Overview */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><ClipboardList size={16} /> Meetings Overview</h3>
        </div>
        <div style={{ display: "grid", gap: "0.8rem", padding: "0.5rem 0" }}>
          <div className="quick-stat-item">
            <div className="quick-stat-icon"><CalendarCheck2 size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{completedCount}</span>
              <span className="quick-stat-label">Completed Meetings</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon" style={{ background: "#eff6ff", color: "#1d4ed8" }}><CalendarDays size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{upcoming}</span>
              <span className="quick-stat-label">Upcoming / In Progress</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon" style={{ background: "#fff7ed", color: "#c2410c" }}><Clock size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{inProgressCount}</span>
              <span className="quick-stat-label">Meetings In Progress</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon" style={{ background: "#ecfdf3", color: "#166534" }}><CheckCircle2 size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{actionRate}%</span>
              <span className="quick-stat-label">Action Items Completed</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default MeetingCharts;
