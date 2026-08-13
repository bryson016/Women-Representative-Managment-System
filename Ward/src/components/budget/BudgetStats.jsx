import { motion } from "framer-motion";
import { Wallet, PieChart, TrendingUp, Banknote } from "lucide-react";

const ICON_MAP = {
  Wallet,
  PieChart,
  TrendingUp,
  Banknote,
};

function BudgetStats({ stats }) {
  return (
    <div className="stats-grid">
      {stats.map((stat, index) => {
        const Icon = ICON_MAP[stat.icon] || Wallet;
        return (
          <motion.article
            key={stat.id}
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

export default BudgetStats;
