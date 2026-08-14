import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, MapPin, User, Users, Tag, FileText, ListOrdered, ClipboardList, CheckSquare, MessageSquare } from "lucide-react";

function MeetingDetails({ meeting, onBack }) {
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

  const completedActions = (meeting.actionItems || []).filter((a) => a.status === "Completed").length;
  const totalActions = (meeting.actionItems || []).length;

  return (
    <div className="complaint-detail-view">
      <div className="profile-top-bar">
        <button className="gov-btn gov-btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Meetings</span>
        </button>
      </div>

      <motion.div
        className="profile-header-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <div className="profile-photo-section">
          <div className="profile-photo-placeholder-lg">
            <Calendar size={28} />
          </div>
          <div className="profile-name-section">
            <h1>{meeting.title}</h1>
            <p className="profile-id">{meeting.id} • {meeting.type}</p>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
              <span className={getStatusClass(meeting.status)}>{meeting.status}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="profile-grid">
        <div className="profile-left">
          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.28 }}
          >
            <h3><FileText size={16} /> Meeting Description</h3>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#334155", margin: 0 }}>
              {meeting.description}
            </p>
          </motion.div>

          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.28 }}
          >
            <h3><ListOrdered size={16} /> Meeting Agenda</h3>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              {(meeting.agenda || []).map((item, index) => (
                <div key={index} className="milestone-item">
                  <div className="milestone-head">
                    <span className="milestone-title">{index + 1}. {item.item}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {meeting.minutes && meeting.minutes.length > 0 && (
            <motion.div
              className="panel-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.28 }}
            >
              <h3><ClipboardList size={16} /> Meeting Minutes</h3>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {meeting.minutes.map((minute, index) => (
                  <div key={index} className="milestone-item">
                    <div className="milestone-head">
                      <span className="milestone-title">• {minute.item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {meeting.actionItems && meeting.actionItems.length > 0 && (
            <motion.div
              className="panel-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.28 }}
            >
              <h3><CheckSquare size={16} /> Action Items</h3>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {meeting.actionItems.map((action, index) => (
                  <div key={index} className="milestone-item">
                    <div className="milestone-head">
                      <span className="milestone-title">{action.item}</span>
                      <span className={`status-pill ${action.status === "Completed" ? "resolved" : action.status === "In Progress" ? "in-progress" : "pending"}`}>
                        {action.status}
                      </span>
                    </div>
                    <div className="milestone-meta">
                      <User size={12} />
                      <span>Owner: {action.owner}</span>
                      <span style={{ margin: "0 0.2rem" }}>•</span>
                      <Calendar size={12} />
                      <span>Due: {action.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="profile-right">
          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.28 }}
          >
            <h3><Calendar size={16} /> Meeting Timeline</h3>
            <ul className="timeline">
              {(meeting.activityTimeline || []).map((entry, index) => (
                <li key={index} className="timeline-item">
                  <span className="dot" />
                  {index < (meeting.activityTimeline || []).length - 1 && <span className="line" />}
                  <h4>{entry.action}</h4>
                  <p>By: {entry.by}</p>
                  <small>{entry.date}</small>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.28 }}
          >
            <h3><MessageSquare size={16} /> Quick Info</h3>
            <div className="quick-stats-grid">
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><Tag size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{meeting.type}</span>
                  <span className="quick-stat-label">Meeting Type</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><User size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{meeting.chairperson}</span>
                  <span className="quick-stat-label">Chairperson</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><MapPin size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{meeting.venue}</span>
                  <span className="quick-stat-label">Venue</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><Users size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{meeting.village}</span>
                  <span className="quick-stat-label">Village</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><Calendar size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{meeting.date}</span>
                  <span className="quick-stat-label">Meeting Date</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><Clock size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{meeting.time} - {meeting.endTime}</span>
                  <span className="quick-stat-label">Time</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.28 }}
          >
            <h3><Users size={16} /> Attendance Overview</h3>
            <div style={{ display: "grid", gap: "0.8rem", padding: "0.3rem 0" }}>
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><Users size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{meeting.actualAttendance} / {meeting.expectedAttendance}</span>
                  <span className="quick-stat-label">Attended / Expected</span>
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.3rem" }}>
                  <span style={{ color: "#64748b" }}>Attendance Rate</span>
                  <span style={{ fontWeight: 600, color: "#0f172a" }}>{attendanceRate}%</span>
                </div>
                <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${attendanceRate}%`,
                    background: attendanceRate >= 70 ? "#8b5cf6" : attendanceRate >= 40 ? "#a78bfa" : "#b91c1c",
                    borderRadius: "999px",
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
              {totalActions > 0 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "0.3rem" }}>
                    <span style={{ color: "#64748b" }}>Action Items Progress</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>{completedActions} / {totalActions}</span>
                  </div>
                  <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${totalActions > 0 ? (completedActions / totalActions) * 100 : 0}%`,
                      background: "#8b5cf6",
                      borderRadius: "999px",
                      transition: "width 0.5s ease",
                    }} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default MeetingDetails;
