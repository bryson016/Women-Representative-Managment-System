import { motion } from "framer-motion";

function QuickActionCard({ label, icon: Icon, index = 0 }) {
  return (
    <motion.button
      className="quick-action-card"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.24 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="quick-icon">{Icon ? <Icon size={18} /> : null}</div>
      <span>{label}</span>
    </motion.button>
  );
}

export default QuickActionCard;
