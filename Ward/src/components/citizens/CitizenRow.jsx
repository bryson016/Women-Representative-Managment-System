import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Edit2, Trash2, MoreHorizontal, User } from "lucide-react";

function CitizenRow({ citizen, index, onView, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = `${citizen.firstName[0]}${citizen.lastName[0]}`;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
    >
      <td>
        <div className="citizen-photo-cell">
          {citizen.photoUrl ? (
            <img src={citizen.photoUrl} alt={`${citizen.firstName} ${citizen.lastName}`} className="citizen-photo-thumb" />
          ) : (
            <div className="citizen-photo-placeholder">{initials}</div>
          )}
        </div>
      </td>
      <td className="td-national-id">{citizen.nationalId}</td>
      <td className="td-fullname">{citizen.firstName} {citizen.lastName}</td>
      <td>{citizen.gender}</td>
      <td>{citizen.phoneNumber}</td>
      <td>{citizen.village}</td>
      <td>{citizen.occupation}</td>
      <td>{citizen.registrationDate}</td>
      <td>
        <span className={`status-pill ${citizen.status === "Active" ? "active" : "inactive"}`}>
          {citizen.status}
        </span>
      </td>
      <td className="td-actions">
        <div className="action-btn-group">
          <button className="table-action-btn" onClick={() => onView(citizen)} title="View">
            <Eye size={14} />
          </button>
          <button className="table-action-btn" onClick={() => onEdit(citizen)} title="Edit">
            <Edit2 size={14} />
          </button>
          <button className="table-action-btn" onClick={() => onDelete(citizen)} title="Delete">
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
                  <button onClick={() => { setMenuOpen(false); onView(citizen); }}>
                    <Eye size={14} /> View Details
                  </button>
                  <button onClick={() => { setMenuOpen(false); onEdit(citizen); }}>
                    <Edit2 size={14} /> Edit Record
                  </button>
                  <button className="danger" onClick={() => { setMenuOpen(false); onDelete(citizen); }}>
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

export default CitizenRow;
