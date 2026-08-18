import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Edit2, Trash2, MoreHorizontal, CalendarCheck2, Users, XCircle } from "lucide-react";

function MeetingRow({ meeting, index, onView, onEdit, onDelete, onMarkComplete, onCancel }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const getStatusClass = (status) => {
    switch (status) {
      case "Scheduled": return "status-pill meeting-scheduled";
      case "In Progress": return "status-pill meeting-in-progress";
      case "Completed": return "status-pill meeting-completed";
      case "Postponed": return "status-pill meeting-postponed";
      case "Cancelled": return "status-pill meeting-cancelled";
      default: return "status-pill";
    }
  };

  const getTypeClass = (type) => {
    const typeKey = type.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `meeting-type-pill ${typeKey}`;
  };

  const attendanceRate =
    meeting.expectedAttendance > 0
      ? Math.min(Math.round((meeting.actualAttendance / meeting.expectedAttendance) * 100), 100)
      : 0;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
    >
      <td className="td-complaint-id">{meeting.id}</td>
      <td className="td-fullname">{meeting.title}</td>
      <td>
        <span className={getTypeClass(meeting.type)}>{meeting.type}</span>
      </td>
      <td>{meeting.date}</td>
      <td>{meeting.time}</td>
      <td>{meeting.venue}</td>
      <td>{meeting.chairperson}</td>
      <td>
        <div style={{ display: "grid", gap: "0.2rem", minWidth: "90px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
            <span style={{ color: "#64748b" }}>{meeting.actualAttendance || 0} / {meeting.expectedAttendance}</span>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>{attendanceRate}%</span>
          </div>
          <div style={{ height: "5px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${attendanceRate}%`,
              background: attendanceRate >= 70 ? "#7c3aed" : attendanceRate >= 40 ? "#a78bfa" : "#b91c1c",
              borderRadius: "999px",
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      </td>
      <td>
        <span className={getStatusClass(meeting.status)}>{meeting.status}</span>
      </td>
      <td className="td-actions">
        <div className="action-btn-group">
          <button className="table-action-btn" onClick={() => onView(meeting)} title="View">
            <Eye size={14} />
          </button>
          <button className="table-action-btn" onClick={() => onEdit(meeting)} title="Edit">
            <Edit2 size={14} />
          </button>
          {(meeting.status === "Scheduled" || meeting.status === "In Progress") && (
            <button className="table-action-btn" onClick={() => onMarkComplete(meeting)} title="Mark Complete">
              <CalendarCheck2 size={14} />
            </button>
          )}
          {meeting.status === "Scheduled" && (
            <button className="table-action-btn" onClick={() => onCancel(meeting)} title="Cancel">
              <XCircle size={14} />
            </button>
          )}
          <button className="table-action-btn" onClick={() => onDelete(meeting)} title="Delete">
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
                  <button onClick={() => { setMenuOpen(false); onView(meeting); }}>
                    <Eye size={14} /> View Details
                  </button>
                  <button onClick={() => { setMenuOpen(false); onEdit(meeting); }}>
                    <Edit2 size={14} /> Edit Meeting
                  </button>
                  {(meeting.status === "Scheduled" || meeting.status === "In Progress") && (
                    <button onClick={() => { setMenuOpen(false); onMarkComplete(meeting); }}>
                      <CalendarCheck2 size={14} /> Mark Complete
                    </button>
                  )}
                  {meeting.status === "Scheduled" && (
                    <button onClick={() => { setMenuOpen(false); onCancel(meeting); }}>
                      <XCircle size={14} /> Cancel Meeting
                    </button>
                  )}
                  <button className="danger" onClick={() => { setMenuOpen(false); onDelete(meeting); }}>
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

export default MeetingRow;
