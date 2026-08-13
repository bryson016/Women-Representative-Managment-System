import { motion } from "framer-motion";

function ChartCard({ title, children }) {
  return (
    <motion.section
      className="chart-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-title-row">
        <h3>{title}</h3>
      </div>
      <div className="chart-wrap">{children}</div>
    </motion.section>
  );
}

export default ChartCard;
