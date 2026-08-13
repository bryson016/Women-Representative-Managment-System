import { motion } from "framer-motion";
import { Users, UserCheck, Building2, TrendingUp } from "lucide-react";

function StaffStats({ totalStaff, onDutyCount, departmentCount, avgPerformance }) {
  const stats = [
    {
      title: "Total Staff",
      value: totalStaff.toLocaleString(),
      description: "Ward staff members",
      trend: `${departmentCount} departments`,
      icon: Users,
    },
    {
      title: "On Duty",
      value: onDutyCount.toLocaleString(),
      description: "Currently active",
      trend: `${((onDutyCount / totalStaff) * 100).toFixed(0)}% of staff`,
      icon: UserCheck,
    },
    {
      title: "Departments",
      value: departmentCount.toLocaleString(),
      description: "Active departments",
      trend: "Full coverage",
      icon: Building2,
    },
    {
      title: "Avg Performance",
      value: `${avgPerformance}%`,
      description: "Team performance score",
      trend: "Above target (85%)",
      icon: TrendingUp,
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

export default StaffStats;
