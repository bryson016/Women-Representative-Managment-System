import { motion } from "framer-motion";

function ActivityTimeline({ items }) {
  return (
    <motion.section
      className="panel-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="card-title-row">
        <h3>Recent Activities</h3>
      </div>

      <ul className="timeline">
        {items.map((item, index) => (
          <li key={item.id} className="timeline-item">
            <span className="dot" aria-hidden="true" />
            <div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
              <small>{item.time}</small>
            </div>
            {index !== items.length - 1 ? <span className="line" aria-hidden="true" /> : null}
          </li>
        ))}
      </ul>
    </motion.section>
  );
}

export default ActivityTimeline;
