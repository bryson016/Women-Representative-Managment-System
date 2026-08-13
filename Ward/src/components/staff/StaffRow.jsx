import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Edit2, Trash2, MoreHorizontal, Phone, Mail } from "lucide-react";

function StaffRow({ staff, index, onView, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const getStatusClass = (status) => {
    switch (status) {
      case "On Duty": return "status-pill staff-on-duty";
      case "Off Duty": return "status-pill staff-off-duty";
      case "On Leave": return "status-pill staff-on-leave";
      case "Field Visit": return "status-pill staff-field-visit";
      default: return "status-pill";
    }
  };

  const getPerformanceClass = (score) => {
    if (score >= 90) return "performance-badge excellent";
    if (score >= 80) return "performance-badge good";
    return "performance-badge average";
  };

  const initials = `${staff.firstName[0]}${staff.lastName[0]}`;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
    >
      <td className="td-staff-id">{staff.staffId}</td>
      <td>
        <div className="staff-name-cell">
          <div className="staff-avatar">{initials}</div>
          <div>
            <div className="td-fullname">{staff.firstName} {staff.lastName}</div>
            <div className="staff-role">{staff.role}</div>
          </div>
        </div>
      </td>
      <td>{staff.department}</td>
      <td>
        <div className="staff-contact-cell">
          <span><Phone size={12} /> {staff.phone}</span>
          <span><Mail size={12} /> {staff.email}</span>
        </div>
      </td>
      <td>
        <span className={getStatusClass(staff.status)}>
          {staff.status}
        </span>
      </td>
      <td>
        <span className={getPerformanceClass(staff.performanceScore)}>
          {staff.performanceScore}%
        </span>
      </td>
      <td>{staff.workload}</td>
      <td>{staff.villagesCovered.join(", ")}</td>
      <td className="td-actions">
        <div className="action-btn-group">
          <button className="table-action-btn" onClick={() => onView(staff)} title="View">
            <Eye size={14} />
          </button>
          <button className="table-action-btn" onClick={() => onEdit(staff)} title="Edit">
            <Edit2 size={14} />
          </button>
          <button className="table-action-btn" onClick={() => onDelete(staff)} title="Delete">
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
                  <button onClick={() => { setMenuOpen(false); onView(staff); }}>
                    <Eye size={14} /> View Profile
                  </button>
                  <button onClick={() => { setMenuOpen(false); onEdit(staff); }}>
                    <Edit2 size={14} /> Edit Staff
                  </button>
                  <button className="danger" onClick={() => { setMenuOpen(false); onDelete(staff); }}>
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

export default StaffRow;
