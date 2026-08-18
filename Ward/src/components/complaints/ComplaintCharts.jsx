import { motion } from "framer-motion";
import { BarChart3, PieChart, TrendingUp, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

function ComplaintCharts({ complaints }) {
  // Calculate chart data
  const categoryData = {};
  const statusData = {};
  const priorityData = {};
  const villageData = {};
  let totalResolutionDays = 0;
  let resolvedCount = 0;

  complaints.forEach((c) => {
    categoryData[c.category] = (categoryData[c.category] || 0) + 1;
    statusData[c.status] = (statusData[c.status] || 0) + 1;
    priorityData[c.priority] = (priorityData[c.priority] || 0) + 1;
    villageData[c.village] = (villageData[c.village] || 0) + 1;

    if (c.status === "Resolved" || c.status === "Closed") {
      const reported = new Date(c.dateReported);
      const resolved = new Date(c.lastUpdated);
      const days = Math.ceil((resolved - reported) / (1000 * 60 * 60 * 24));
      totalResolutionDays += days;
      resolvedCount++;
    }
  });

  const avgResolutionTime = resolvedCount > 0 ? Math.round(totalResolutionDays / resolvedCount) : 0;
  const openCount = (statusData["Open"] || 0) + (statusData["Assigned"] || 0);
  const inProgressCount = statusData["In Progress"] || 0;
  const resolvedTotal = (statusData["Resolved"] || 0) + (statusData["Closed"] || 0);
  const satisfactionRate = complaints.length > 0 ? Math.round((resolvedTotal / complaints.length) * 100) : 0;

  const maxCategory = Math.max(...Object.values(categoryData), 1);
  const maxVillage = Math.max(...Object.values(villageData), 1);

  const categoryColors = {
    "Sanitation": "#7c3aed",
    "Road Repair": "#a78bfa",
    "Water Supply": "#7c3aed",
    "Street Lighting": "#f59e0b",
    "Waste Management": "#64748b",
    "Health Services": "#b91c1c",
    "Education": "#1d4ed8",
    "Security": "#7c3aed",
    "Other": "#94a3b8",
  };

  const priorityColors = {
    "Low": "#94a3b8",
    "Medium": "#f59e0b",
    "High": "#b91c1c",
    "Urgent": "#7c3aed",
  };

  const statusColors = {
    "Open": "#c2410c",
    "Assigned": "#1d4ed8",
    "In Progress": "#f59e0b",
    "Resolved": "#6d28d9",
    "Closed": "#64748b",
  };

  return (
    <div className="charts-grid" style={{ marginTop: "0.85rem" }}>
      {/* Complaints by Category */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><BarChart3 size={16} /> Complaints by Category</h3>
        </div>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {Object.entries(categoryData).sort((a, b) => b[1] - a[1]).map(([category, count]) => (
            <div key={category} style={{ display: "grid", gap: "0.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                <span style={{ color: "#334155" }}>{category}</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{count}</span>
              </div>
              <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(count / maxCategory) * 100}%`,
                  background: categoryColors[category] || "#7c3aed",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Complaints by Status */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><PieChart size={16} /> Complaints by Status</h3>
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
                  width: `${(count / complaints.length) * 100}%`,
                  background: statusColors[status] || "#7c3aed",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Complaints by Priority */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><AlertTriangle size={16} /> Complaints by Priority</h3>
        </div>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {Object.entries(priorityData).sort((a, b) => b[1] - a[1]).map(([priority, count]) => (
            <div key={priority} style={{ display: "grid", gap: "0.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                <span style={{ color: "#334155" }}>{priority}</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{count}</span>
              </div>
              <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(count / Math.max(...Object.values(priorityData))) * 100}%`,
                  background: priorityColors[priority] || "#7c3aed",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Complaints by Village */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><BarChart3 size={16} /> Complaints by Village</h3>
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
                  background: "#7c3aed",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Average Resolution Time */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Clock size={16} /> Average Resolution Time</h3>
        </div>
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#0f172a" }}>
            {avgResolutionTime}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.3rem" }}>
            Days to resolve
          </div>
          <div style={{ marginTop: "0.8rem", height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.min((avgResolutionTime / 14) * 100, 100)}%`,
              background: avgResolutionTime <= 7 ? "#6d28d9" : avgResolutionTime <= 10 ? "#f59e0b" : "#b91c1c",
              borderRadius: "999px",
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.3rem" }}>
            Target: 14 days
          </div>
        </div>
      </motion.div>

      {/* Citizen Satisfaction */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><TrendingUp size={16} /> Resolution Overview</h3>
        </div>
        <div style={{ display: "grid", gap: "0.8rem", padding: "0.5rem 0" }}>
          <div className="quick-stat-item">
            <div className="quick-stat-icon"><CheckCircle2 size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{resolvedTotal}</span>
              <span className="quick-stat-label">Resolved / Closed</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon" style={{ background: "#fff7ed", color: "#c2410c" }}><AlertTriangle size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{openCount}</span>
              <span className="quick-stat-label">Open / Unassigned</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon" style={{ background: "#eff6ff", color: "#1d4ed8" }}><Clock size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{inProgressCount}</span>
              <span className="quick-stat-label">In Progress</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon" style={{ background: "#f5f3ff", color: "#6d28d9" }}><TrendingUp size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{satisfactionRate}%</span>
              <span className="quick-stat-label">Resolution Rate</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ComplaintCharts;
