import { motion } from "framer-motion";
import { BarChart3, Gauge, Lightbulb, TrendingUp, Trophy, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const INSIGHT_COLORS = ["#006B3C", "#0E8A4B", "#2D936C", "#65A30D", "#C9A227", "#15803D", "#4D7C0F", "#047857"];

function BudgetInsights({ monthly, performance, topSpending, leastUtilized }) {
  const formatKES = (amount) => {
    if (amount >= 1000000000) return `KES ${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `KES ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `KES ${(amount / 1000).toFixed(0)}K`;
    return `KES ${amount}`;
  };

  const monthlyData = monthly.map((m) => ({
    month: m.month,
    spent: Math.round(m.spent / 1000000),
  }));

  const maxEfficiency = Math.max(...performance.map((p) => p.efficiency), 1);
  const avgEfficiency = performance.length > 0
    ? Math.round(performance.reduce((sum, p) => sum + p.efficiency, 0) / performance.length)
    : 0;

  return (
    <motion.div
      className="budget-insights-section"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.28 }}
    >
      <div className="card-title-row">
        <h3><Lightbulb size={16} /> Budget Insights</h3>
      </div>

      <div className="budget-insights-grid">
        {/* Monthly Expenditure Trend */}
        <div className="chart-card">
          <div className="card-title-row">
            <h3><TrendingUp size={16} /> Monthly Expenditure Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip formatter={(value) => `KES ${value}M`} />
              <Line type="monotone" dataKey="spent" stroke="#006B3C" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Performance by Department */}
        <div className="chart-card">
          <div className="card-title-row">
            <h3><BarChart3 size={16} /> Budget Performance by Department</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={performance}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={9} interval={0} angle={-25} textAnchor="end" height={55} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="efficiency" name="Efficiency" radius={[4, 4, 0, 0]}>
                {performance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={INSIGHT_COLORS[index % INSIGHT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Efficiency */}
        <div className="chart-card">
          <div className="card-title-row">
            <h3><Gauge size={16} /> Allocation Efficiency</h3>
          </div>
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#0f172a" }}>
              {avgEfficiency}%
            </div>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.3rem" }}>
              Average allocation efficiency
            </div>
            <div style={{ marginTop: "0.8rem", height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${avgEfficiency}%`,
                  background: avgEfficiency >= 75 ? "#166534" : avgEfficiency >= 60 ? "#f59e0b" : "#b91c1c",
                  borderRadius: "999px",
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.3rem" }}>
              Target: 75%
            </div>
          </div>
        </div>

        {/* Top Spending Departments */}
        <div className="chart-card">
          <div className="card-title-row">
            <h3><Trophy size={16} /> Top Spending Departments</h3>
          </div>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {topSpending.map((dept, index) => {
              const max = topSpending[0]?.amount || 1;
              return (
                <div key={dept.name} style={{ display: "grid", gap: "0.2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                    <span style={{ color: "#334155" }}>{dept.name}</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>{formatKES(dept.amount)}</span>
                  </div>
                  <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(dept.amount / max) * 100}%`,
                        background: INSIGHT_COLORS[index % INSIGHT_COLORS.length],
                        borderRadius: "999px",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Least Utilized Funds */}
        <div className="chart-card">
          <div className="card-title-row">
            <h3><Wallet size={16} /> Least Utilized Funds</h3>
          </div>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {leastUtilized.map((dept, index) => {
              const max = leastUtilized[leastUtilized.length - 1]?.amount || 1;
              return (
                <div key={dept.name} style={{ display: "grid", gap: "0.2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                    <span style={{ color: "#334155" }}>{dept.name}</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>{formatKES(dept.amount)}</span>
                  </div>
                  <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${(dept.amount / max) * 100}%`,
                        background: "#C9A227",
                        borderRadius: "999px",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default BudgetInsights;
