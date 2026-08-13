import { motion } from "framer-motion";
import { BarChart3, PieChart as PieIcon, Download, Wallet, TrendingUp, Banknote } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["#006B3C", "#0E8A4B", "#2D936C", "#65A30D", "#C9A227", "#15803D", "#4D7C0F", "#047857"];

function BudgetCharts({ categories, distribution, summary }) {
  const formatKES = (amount) => {
    if (amount >= 1000000000) return `KES ${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `KES ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `KES ${(amount / 1000).toFixed(0)}K`;
    return `KES ${amount}`;
  };

  const barData = categories.map((c) => ({
    name: c.name,
    allocated: Math.round(c.allocated / 1000000),
    utilized: Math.round(c.utilized / 1000000),
  }));

  const summaryItems = [
    { label: "Approved Budget", value: formatKES(summary.approved), icon: Wallet },
    { label: "Allocated Budget", value: formatKES(summary.allocated), icon: PieIcon },
    { label: "Utilized Budget", value: formatKES(summary.utilized), icon: TrendingUp },
    { label: "Remaining Balance", value: formatKES(summary.remaining), icon: Banknote },
  ];

  const handleDownload = () => {
    const html = `
      <html>
        <head><title>Ward Budget Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #006b3c; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
          th { background: #006b3c; color: white; }
        </style>
        </head>
        <body>
          <h1>Ward Budget Report - ${summary.financialYear}</h1>
          <p>County: ${summary.county} | Status: ${summary.status}</p>
          <p>Approved: ${formatKES(summary.approved)} | Allocated: ${formatKES(summary.allocated)} | Utilized: ${formatKES(summary.utilized)} | Remaining: ${formatKES(summary.remaining)}</p>
          <table>
            <thead><tr><th>Category</th><th>Allocated</th><th>Utilized</th></tr></thead>
            <tbody>
              ${categories.map((c) => `<tr><td>${c.name}</td><td>${formatKES(c.allocated)}</td><td>${formatKES(c.utilized)}</td></tr>`).join("")}
            </tbody>
          </table>
          <p style="margin-top:20px;color:#666;">Generated: ${new Date().toLocaleDateString()}</p>
        </body>
      </html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  return (
    <div className="budget-analytics-grid">
      {/* Budget Allocation vs Utilization */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><BarChart3 size={16} /> Budget Allocation vs Budget Utilization</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData}>
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip formatter={(value) => `KES ${value}M`} />
            <Legend wrapperStyle={{ fontSize: "0.7rem" }} />
            <Bar dataKey="allocated" name="Allocated (M)" fill="#006B3C" radius={[4, 4, 0, 0]} />
            <Bar dataKey="utilized" name="Utilized (M)" fill="#d4a017" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Budget Distribution */}
      <motion.div
        className="chart-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><PieIcon size={16} /> Budget Distribution</h3>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <RechartsPieChart>
            <Pie
              data={distribution}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend wrapperStyle={{ fontSize: "0.7rem" }} />
          </RechartsPieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Budget Summary Card */}
      <motion.div
        className="chart-card budget-summary-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Wallet size={16} /> Budget Summary</h3>
        </div>
        <div className="budget-summary-list">
          {summaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="budget-summary-item">
                <div className="quick-stat-icon">
                  <Icon size={16} />
                </div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{item.value}</span>
                  <span className="quick-stat-label">{item.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        <button className="gov-btn gov-btn-primary budget-download-btn" onClick={handleDownload}>
          <Download size={16} />
          Download Budget Report
        </button>
      </motion.div>
    </div>
  );
}

export default BudgetCharts;
