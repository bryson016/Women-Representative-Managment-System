import { BellRing } from "lucide-react";
import { motion } from "framer-motion";

function NotificationPanel({ items }) {
  return (
    <motion.section
      className="panel-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.06 }}
    >
      <div className="card-title-row">
        <h3>Notifications</h3>
      </div>

      <ul className="notification-list">
        {items.map((item) => (
          <li key={item.id} className={`notice ${item.level}`}>
            <BellRing size={16} />
            <span>{item.text}</span>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}

export default NotificationPanel;
