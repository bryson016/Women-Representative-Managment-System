import { motion } from "framer-motion";
import { ArrowDownRight, Bell, Receipt } from "lucide-react";

function BudgetSidebar({ transactions, alerts }) {
  const formatKES = (amount) => `KES ${amount.toLocaleString()}`;

  const alertClass = (level) => {
    switch (level) {
      case "warning":
        return "notice warning";
      case "danger":
        return "notice danger";
      default:
        return "notice info";
    }
  };

  return (
    <div className="budget-sidebar-grid">
      {/* Recent Budget Transactions */}
      <motion.div
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Receipt size={16} /> Recent Budget Transactions</h3>
        </div>
        <div style={{ display: "grid", gap: "0.55rem" }}>
          {transactions.map((tx, index) => (
            <div key={index} className="project-activity-item">
              <div className="milestone-head">
                <span className="milestone-title">{tx.title}</span>
              </div>
              <div className="milestone-meta">
                <span style={{ fontWeight: 700, color: "#6d28d9", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                  <ArrowDownRight size={12} />
                  {formatKES(tx.amount)}
                </span>
                <span>· {tx.date}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Budget Alerts */}
      <motion.div
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Bell size={16} /> Budget Alerts</h3>
        </div>
        <div className="notification-list">
          {alerts.map((alert, index) => (
            <div key={index} className={alertClass(alert.level)}>
              <Bell size={14} />
              <span>{alert.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default BudgetSidebar;
