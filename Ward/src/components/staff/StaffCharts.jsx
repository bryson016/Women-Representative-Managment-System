import { motion } from "framer-motion";
import { BarChart3, PieChart, TrendingUp, Users, Award, MapPin } from "lucide-react";

function StaffCharts({ staff }) {
  // Calculate chart data
  const departmentData = {};
  const statusData = {};
  const roleData = {};
  const villageData = {};

  staff.forEach((s) => {
    departmentData[s.department] = (departmentData[s.department] || 0) + 1;
    statusData[s.status] = (statusData[s.status] || 0) + 1;
    roleData[s.role] = (roleData[s.role] || 0) + 1;
    s.villagesCovered.forEach((v) => {
      villageData[v] = (villageData[v] || 0) + 1;
    });
  });

  const avgPerformance = staff.length > 0
    ? Math.round(staff.reduce((sum, s) => sum + s.performanceScore, 0) / staff.length)
    : 0;
  const totalWorkload = staff.reduce((sum, s) => sum + s.workload, 0);
  const onDutyCount = (statusData["On Duty"] || 0) + (statusData["Field Visit"] || 0);
  const maxDepartment = Math.max(...Object.values(departmentData), 1);
  const maxVillage = Math.max(...Object.values(villageData), 1);

  const departmentColors = {
    "Administration": "#006b3c",
    "Health Services": "#b91c1c",
    "Public Works": "#d4a017",
    "Water & Sanitation": "#0e8a4b",
    "Education": "#1d4ed8",
    "Security": "#7c3aed",
    "Community Development": "#f59e0b",
    "Finance": "#64748b",
  };

  const statusColors = {
    "On Duty": "#166534",
    "Off Duty": "#64748b",
    "On Leave": "#f59e0b",
    "Field Visit": "#1d4ed8",
  };

  return (
    <div className="charts-grid" style={{ marginTop: "0.85rem" }}>
      {/* Staff by Department */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><BarChart3 size={16} /> Staff by Department</h3>
        </div>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {Object.entries(departmentData).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
            <div key={dept} style={{ display: "grid", gap: "0.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                <span style={{ color: "#334155" }}>{dept}</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{count}</span>
              </div>
              <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(count / maxDepartment) * 100}%`,
                  background: departmentColors[dept] || "#006b3c",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Staff by Status */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><PieChart size={16} /> Staff Availability</h3>
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
                  width: `${(count / staff.length) * 100}%`,
                  background: statusColors[status] || "#006b3c",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Staff by Role */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Users size={16} /> Staff by Role</h3>
        </div>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {Object.entries(roleData).sort((a, b) => b[1] - a[1]).map(([role, count]) => (
            <div key={role} style={{ display: "grid", gap: "0.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                <span style={{ color: "#334155" }}>{role}</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{count}</span>
              </div>
              <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(count / Math.max(...Object.values(roleData))) * 100}%`,
                  background: "#0e8a4b",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Village Coverage */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><MapPin size={16} /> Village Coverage</h3>
        </div>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {Object.entries(villageData).sort((a, b) => b[1] - a[1]).map(([village, count]) => (
            <div key={village} style={{ display: "grid", gap: "0.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                <span style={{ color: "#334155" }}>{village}</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{count} staff</span>
              </div>
              <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(count / maxVillage) * 100}%`,
                  background: "#d4a017",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Team Performance */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Award size={16} /> Team Performance</h3>
        </div>
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#0f172a" }}>
            {avgPerformance}%
          </div>
          <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.3rem" }}>
            Average performance score
          </div>
          <div style={{ marginTop: "0.8rem", height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${avgPerformance}%`,
              background: avgPerformance >= 90 ? "#166534" : avgPerformance >= 80 ? "#0e8a4b" : "#f59e0b",
              borderRadius: "999px",
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.3rem" }}>
            Target: 85%
          </div>
        </div>
      </motion.div>

      {/* Workload Overview */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><TrendingUp size={16} /> Workload Overview</h3>
        </div>
        <div style={{ display: "grid", gap: "0.8rem", padding: "0.5rem 0" }}>
          <div className="quick-stat-item">
            <div className="quick-stat-icon"><Users size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{staff.length}</span>
              <span className="quick-stat-label">Total Staff</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon" style={{ background: "#ecfdf3", color: "#166534" }}><TrendingUp size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{onDutyCount}</span>
              <span className="quick-stat-label">On Duty / Field</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon" style={{ background: "#eff6ff", color: "#1d4ed8" }}><BarChart3 size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{totalWorkload}</span>
              <span className="quick-stat-label">Total Workload</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon" style={{ background: "#fff7ed", color: "#c2410c" }}><Award size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{staff.filter((s) => s.performanceScore >= 90).length}</span>
              <span className="quick-stat-label">Top Performers</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default StaffCharts;
