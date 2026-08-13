import { motion } from "framer-motion";
import { FolderKanban, Hammer, CheckCircle2, AlertTriangle, Wallet, TrendingUp } from "lucide-react";

function ProjectStats({ totalProjects, ongoingCount, completedCount, delayedCount, totalBudget, utilizedBudget }) {
  const utilizationRate = totalBudget > 0 ? Math.round((utilizedBudget / totalBudget) * 100) : 0;

  const formatKES = (amount) => {
    if (amount >= 1000000000) return `KES ${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `KES ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `KES ${(amount / 1000).toFixed(0)}K`;
    return `KES ${amount}`;
  };

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects.toLocaleString(),
      description: "All registered ward projects",
      trend: `${ongoingCount} currently ongoing`,
      icon: FolderKanban,
    },
    {
      title: "Ongoing Projects",
      value: ongoingCount.toLocaleString(),
      description: "Projects under active implementation",
      trend: `${((ongoingCount / totalProjects) * 100).toFixed(0)}% of total`,
      icon: Hammer,
    },
    {
      title: "Completed Projects",
      value: completedCount.toLocaleString(),
      description: "Successfully delivered projects",
      trend: `${((completedCount / totalProjects) * 100).toFixed(0)}% completion rate`,
      icon: CheckCircle2,
    },
    {
      title: "Delayed Projects",
      value: delayedCount.toLocaleString(),
      description: "Projects behind schedule",
      trend: `${((delayedCount / totalProjects) * 100).toFixed(0)}% of total`,
      icon: AlertTriangle,
    },
    {
      title: "Total Budget Allocated",
      value: formatKES(totalBudget),
      description: "Total funds allocated to projects",
      trend: "Across all active project categories",
      icon: Wallet,
    },
    {
      title: "Budget Utilized",
      value: `${utilizationRate}%`,
      description: formatKES(utilizedBudget),
      trend: `${formatKES(totalBudget - utilizedBudget)} remaining`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
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

export default ProjectStats;
