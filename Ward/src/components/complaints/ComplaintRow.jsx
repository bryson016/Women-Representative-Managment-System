import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Edit2, Trash2, MoreHorizontal, UserCheck, CheckCircle, XCircle } from "lucide-react";

function ComplaintRow({ complaint, index, onView, onEdit, onDelete, onAssign, onResolve }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const getStatusClass = (status) => {
    switch (status) {
      case "Open": return "status-pill open";
      case "Assigned": return "status-pill assigned";
      case "In Progress": return "status-pill in-progress";
      case "Resolved": return "status-pill resolved";
      case "Closed": return "status-pill closed";
      default: return "status-pill";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Low": return "priority-pill low";
      case "Medium": return "priority-pill medium";
      case "High": return "priority-pill high";
      case "Urgent": return "priority-pill urgent";
      default: return "priority-pill";
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
    >
      <td className="td-complaint-id">{complaint.id}</td>
      <td className="td-fullname">{complaint.citizenName}</td>
      <td className="td-national-id">{complaint.nationalId}</td>
      <td>{complaint.phoneNumber}</td>
      <td>{complaint.category}</td>
      <td>
        <span className={getPriorityClass(complaint.priority)}>
          {complaint.priority}
        </span>
      </td>
      <td>{complaint.village}</td>
      <td>{complaint.assignedOfficer || <span className="unassigned-text">Unassigned</span>}</td>
      <td>
        <span className={getStatusClass(complaint.status)}>
          {complaint.status}
        </span>
      </td>
      <td>{complaint.dateReported}</td>
      <td>{complaint.lastUpdated}</td>
      <td className="td-actions">
        <div className="action-btn-group">
          <button className="table-action-btn" onClick={() => onView(complaint)} title="View">
            <Eye size={14} />
          </button>
          <button className="table-action-btn" onClick={() => onEdit(complaint)} title="Edit">
            <Edit2 size={14} />
          </button>
          {complaint.status === "Open" && (
            <button className="table-action-btn" onClick={() => onAssign(complaint)} title="Assign">
              <UserCheck size={14} />
            </button>
          )}
          {(complaint.status === "In Progress" || complaint.status === "Assigned") && (
            <button className="table-action-btn" onClick={() => onResolve(complaint)} title="Resolve">
              <CheckCircle size={14} />
            </button>
          )}
          <button className="table-action-btn" onClick={() => onDelete(complaint)} title="Delete">
            <Trash2 size={14} />
          </button>
          <div className="more-wrapper">
            <button className="table-action-btn" onClick={() => setMenuOpen(!menuOpen)} title="More">
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && (
              <>
                <div className="more-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="more-dropdown">
                  <button onClick={() => { setMenuOpen(false); onView(complaint); }}>
                    <Eye size={14} /> View Details
                  </button>
                  <button onClick={() => { setMenuOpen(false); onEdit(complaint); }}>
                    <Edit2 size={14} /> Edit Complaint
                  </button>
                  {complaint.status === "Open" && (
                    <button onClick={() => { setMenuOpen(false); onAssign(complaint); }}>
                      <UserCheck size={14} /> Assign Officer
                    </button>
                  )}
                  {(complaint.status === "In Progress" || complaint.status === "Assigned") && (
                    <button onClick={() => { setMenuOpen(false); onResolve(complaint); }}>
                      <CheckCircle size={14} /> Resolve
                    </button>
                  )}
                  <button className="danger" onClick={() => { setMenuOpen(false); onDelete(complaint); }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </motion.tr>
  );
}

export default ComplaintRow;
