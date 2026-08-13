import { motion } from "framer-motion";
import { CircleAlert, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

function ComplaintStats({ totalComplaints, openCount, inProgressCount, resolvedCount }) {
  const stats = [
    {
      title: "Total Complaints",
      value: totalComplaints.toLocaleString(),
      description: "All registered complaints",
      trend: `${((openCount / totalComplaints) * 100).toFixed(0)}% still open`,
      icon: CircleAlert,
    },
    {
      title: "Open Complaints",
      value: openCount.toLocaleString(),
      description: "Awaiting assignment",
      trend: `${((openCount / totalComplaints) * 100).toFixed(1)}% of total`,
      icon: AlertTriangle,
    },
    {
      title: "In Progress",
      value: inProgressCount.toLocaleString(),
      description: "Under active resolution",
      trend: `${((inProgressCount / totalComplaints) * 100).toFixed(1)}% of total`,
      icon: Clock,
    },
    {
      title: "Resolved",
      value: resolvedCount.toLocaleString(),
      description: "Successfully closed",
      trend: `${((resolvedCount / totalComplaints) * 100).toFixed(1)}% resolution rate`,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.article
            key={stat.title}
            className="stat-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.28 }}
            whileHover={{ y: -4 }}
          >
            <div className="stat-head">
              <div className="stat-icon">
                <Icon size={18} />
              </div>
              <p className="trend">{stat.trend}</p>
            </div>
            <h3>{stat.value}</h3>
            <h4>{stat.title}</h4>
            <p>{stat.description}</p>
          </motion.article>
        );
      })}
    </div>
  );
}

export default ComplaintStats;
