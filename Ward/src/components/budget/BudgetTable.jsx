import { motion } from "framer-motion";
import { Table2 } from "lucide-react";

function BudgetTable({ data }) {
  const formatKES = (amount) => `KES ${amount.toLocaleString()}`;

  const getStatusClass = (status) => {
    switch (status) {
      case "On Track":
        return "status-pill budget-on-track";
      case "Nearing Limit":
        return "status-pill budget-nearing-limit";
      case "Low Utilization":
        return "status-pill budget-low-utilization";
      default:
        return "status-pill";
    }
  };

  const getProgressColor = (utilized, allocated) => {
    const pct = allocated > 0 ? (utilized / allocated) * 100 : 0;
    if (pct >= 90) return "#b91c1c";
    if (pct >= 75) return "#f59e0b";
    return "#006b3c";
  };

  return (
    <motion.div
      className="panel-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.28 }}
    >
      <div className="card-title-row">
        <h3><Table2 size={16} /> Budget Details</h3>
        <span className="citizen-count">{data.length} categories</span>
      </div>
      <div className="table-wrap">
        <table className="budget-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Approved Budget</th>
              <th>Allocated</th>
              <th>Utilized</th>
              <th>Remaining</th>
              <th>Progress</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const remaining = row.allocated - row.utilized;
              const pct = row.allocated > 0 ? Math.round((row.utilized / row.allocated) * 100) : 0;
              return (
                <tr key={row.category}>
                  <td className="td-fullname">{row.category}</td>
                  <td>{formatKES(row.approved)}</td>
                  <td>{formatKES(row.allocated)}</td>
                  <td>{formatKES(row.utilized)}</td>
                  <td>{formatKES(remaining)}</td>
                  <td>
                    <div style={{ display: "grid", gap: "0.25rem", minWidth: "120px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
                        <span style={{ color: "#64748b" }}>{pct}%</span>
                      </div>
                      <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min(pct, 100)}%`,
                            background: getProgressColor(row.utilized, row.allocated),
                            borderRadius: "999px",
                            transition: "width 0.5s ease",
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={getStatusClass(row.status)}>{row.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default BudgetTable;
