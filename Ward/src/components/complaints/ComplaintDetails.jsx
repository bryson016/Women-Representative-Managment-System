import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User, Phone, MapPin, Tag, FileText, MessageSquare, CheckCircle, AlertTriangle } from "lucide-react";

function ComplaintDetails({ complaint, onBack }) {
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
    <div className="complaint-detail-view">
      <div className="profile-top-bar">
        <button className="gov-btn gov-btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Complaints</span>
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
            {complaint.citizenName.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="profile-name-section">
            <h1>{complaint.id}</h1>
            <p className="profile-id">{complaint.citizenName}</p>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem" }}>
              <span className={getStatusClass(complaint.status)}>{complaint.status}</span>
              <span className={getPriorityClass(complaint.priority)}>{complaint.priority}</span>
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
            <h3><User size={16} /> Citizen Details</h3>
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label"><User size={14} /> Full Name</span>
                <span className="info-value">{complaint.citizenName}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Tag size={14} /> National ID</span>
                <span className="info-value">{complaint.nationalId}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Phone size={14} /> Phone</span>
                <span className="info-value">{complaint.phoneNumber}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><MapPin size={14} /> Village</span>
                <span className="info-value">{complaint.village}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.28 }}
          >
            <h3><FileText size={16} /> Complaint Description</h3>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#334155", margin: 0 }}>
              {complaint.description}
            </p>
          </motion.div>

          {complaint.officerNotes && (
            <motion.div
              className="panel-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.28 }}
            >
              <h3><MessageSquare size={16} /> Officer Notes</h3>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#334155", margin: 0 }}>
                {complaint.officerNotes}
              </p>
            </motion.div>
          )}

          {complaint.resolutionNotes && (
            <motion.div
              className="panel-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.28 }}
            >
              <h3><CheckCircle size={16} /> Resolution Notes</h3>
              <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#334155", margin: 0 }}>
                {complaint.resolutionNotes}
              </p>
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
            <h3><Calendar size={16} /> Complaint Timeline</h3>
            <ul className="timeline">
              {complaint.communicationHistory.map((entry, index) => (
                <li key={index} className="timeline-item">
                  <span className="dot" />
                  {index < complaint.communicationHistory.length - 1 && <span className="line" />}
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
            <h3><AlertTriangle size={16} /> Quick Info</h3>
            <div className="quick-stats-grid">
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><Tag size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{complaint.category}</span>
                  <span className="quick-stat-label">Category</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><User size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{complaint.assignedOfficer || "Unassigned"}</span>
                  <span className="quick-stat-label">Assigned Officer</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><Calendar size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{complaint.dateReported}</span>
                  <span className="quick-stat-label">Date Reported</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><Clock size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{complaint.lastUpdated}</span>
                  <span className="quick-stat-label">Last Updated</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetails;
