import { motion } from "framer-motion";
import { Users, UserCheck, UserX, UserPlus } from "lucide-react";

function CitizenStats({ totalCitizens, maleCount, femaleCount, newRegistrations }) {
  const stats = [
    {
      title: "Total Citizens",
      value: totalCitizens.toLocaleString(),
      description: "All registered ward residents",
      trend: `+${newRegistrations} this month`,
      icon: Users,
    },
    {
      title: "Male",
      value: maleCount.toLocaleString(),
      description: "Registered male citizens",
      trend: `${((maleCount / totalCitizens) * 100).toFixed(1)}% of population`,
      icon: UserCheck,
    },
    {
      title: "Female",
      value: femaleCount.toLocaleString(),
      description: "Registered female citizens",
      trend: `${((femaleCount / totalCitizens) * 100).toFixed(1)}% of population`,
      icon: UserX,
    },
    {
      title: "New Registrations This Month",
      value: newRegistrations.toLocaleString(),
      description: "Citizens registered this month",
      trend: `+${newRegistrations > 0 ? 1 : 0}% from last month`,
      icon: UserPlus,
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

export default CitizenStats;
