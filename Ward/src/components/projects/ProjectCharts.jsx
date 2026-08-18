import { motion } from "framer-motion";
import { BarChart3, PieChart, TrendingUp, Clock, Wallet, MapPin } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["#7c3aed", "#7c3aed", "#2D936C", "#65A30D", "#C9A227", "#B91C1C"];

function ProjectCharts({ projects }) {
  // Calculate chart data
  const categoryData = {};
  const statusData = {};
  const wardData = {};
  const budgetData = [];
  let completedYears = 0;
  let totalCompletionDays = 0;

  projects.forEach((p) => {
    categoryData[p.category] = (categoryData[p.category] || 0) + 1;
    statusData[p.status] = (statusData[p.status] || 0) + 1;
    wardData[p.ward] = (wardData[p.ward] || 0) + 1;

    if (p.status === "Completed") {
      const start = new Date(p.startDate);
      const end = new Date(p.expectedCompletion);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      totalCompletionDays += days;
      completedYears++;
    }
  });

  const avgCompletionTime = completedYears > 0 ? Math.round(totalCompletionDays / completedYears / 30) : 0;

  const maxCategory = Math.max(...Object.values(categoryData), 1);
  const maxWard = Math.max(...Object.values(wardData), 1);

  const categoryColors = {
    "Roads & Transport": "#7c3aed",
    "Water & Sanitation": "#7c3aed",
    "Health Services": "#b91c1c",
    "Education Support": "#1d4ed8",
    "Public Markets": "#a78bfa",
    "Street Lighting": "#f59e0b",
    "Drainage & Flood Control": "#7c3aed",
    "Community Facilities": "#64748b",
  };

  const statusColors = {
    "Planning": "#f59e0b",
    "Approved": "#1d4ed8",
    "Ongoing": "#7c3aed",
    "Delayed": "#dc2626",
    "Completed": "#6d28d9",
    "Cancelled": "#64748b",
  };

  const budgetComparisonData = projects
    .filter((p) => p.status === "Ongoing" || p.status === "Delayed" || p.status === "Approved" || p.status === "Planning")
    .slice(0, 6)
    .map((p) => ({
      name: p.projectCode,
      allocated: Math.round(p.budget / 1000000),
      utilized: Math.round(p.amountSpent / 1000000),
    }));

  const monthlyProgressData = [
    { month: "Jan", progress: 8 },
    { month: "Feb", progress: 15 },
    { month: "Mar", progress: 24 },
    { month: "Apr", progress: 33 },
    { month: "May", progress: 45 },
    { month: "Jun", progress: 58 },
    { month: "Jul", progress: 66 },
  ];

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.amountSpent, 0);
  const utilizationRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const ongoingProjects = projects.filter((p) => p.status === "Ongoing" || p.status === "Delayed").length;

  return (
    <div className="charts-grid">
      {/* Projects by Category */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><BarChart3 size={16} /> Projects by Category</h3>
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

      {/* Projects by Status */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><PieChart size={16} /> Projects by Status</h3>
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
                  width: `${(count / projects.length) * 100}%`,
                  background: statusColors[status] || "#7c3aed",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Budget Allocation vs Utilization */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Wallet size={16} /> Budget Allocation vs Utilization</h3>
        </div>
        {budgetComparisonData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={budgetComparisonData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: "0.7rem" }} />
              <Bar dataKey="allocated" name="Allocated (M)" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="utilized" name="Utilized (M)" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="no-data">No active projects to compare.</p>
        )}
      </motion.div>

      {/* Projects by Ward */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><MapPin size={16} /> Projects by Ward</h3>
        </div>
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {Object.entries(wardData).sort((a, b) => b[1] - a[1]).map(([ward, count]) => (
            <div key={ward} style={{ display: "grid", gap: "0.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                <span style={{ color: "#334155" }}>{ward}</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{count}</span>
              </div>
              <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(count / maxWard) * 100}%`,
                  background: "#7c3aed",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Average Completion Time */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Clock size={16} /> Average Project Completion Time</h3>
        </div>
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#0f172a" }}>
            {avgCompletionTime} months
          </div>
          <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.3rem" }}>
            Average from start to completion
          </div>
          <div style={{ marginTop: "0.8rem", height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${Math.min((avgCompletionTime / 18) * 100, 100)}%`,
              background: avgCompletionTime <= 8 ? "#6d28d9" : avgCompletionTime <= 12 ? "#f59e0b" : "#b91c1c",
              borderRadius: "999px",
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.3rem" }}>
            Target: 8 months
          </div>
        </div>
      </motion.div>

      {/* Monthly Progress */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><TrendingUp size={16} /> Monthly Project Progress</h3>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyProgressData}>
            <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip />
            <Line type="monotone" dataKey="progress" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

export default ProjectCharts;
