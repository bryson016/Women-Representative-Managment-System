import { motion } from "framer-motion";

function DashboardCard({ title, value, description, trend, icon: Icon, index = 0 }) {
  return (
    <motion.article
      className="stat-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.28 }}
      whileHover={{ y: -4 }}
    >
      <div className="stat-head">
        <div className="stat-icon">{Icon ? <Icon size={18} /> : null}</div>
        <p className="trend">{trend}</p>
      </div>
      <h3>{value}</h3>
      <h4>{title}</h4>
      <p>{description}</p>
    </motion.article>
  );
}

export default DashboardCard;
