import { motion } from "framer-motion";

function ComplaintTable({ rows }) {
  return (
    <motion.section
      className="panel-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="card-title-row">
        <h3>Recent Complaints</h3>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Citizen</th>
              <th>Category</th>
              <th>Village</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.citizen}</td>
                <td>{row.category}</td>
                <td>{row.village}</td>
                <td>{row.priority}</td>
                <td>
                  <span className={`status-pill ${row.status.toLowerCase().replace(" ", "-")}`}>{row.status}</span>
                </td>
                <td>{row.date}</td>
                <td>
                  <button className="table-action-btn">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}

export default ComplaintTable;
