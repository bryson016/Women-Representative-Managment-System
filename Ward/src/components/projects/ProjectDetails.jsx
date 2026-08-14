import { motion } from "framer-motion";
import { ArrowLeft, Calendar, CheckCircle2, FileText, FolderKanban, Image as ImageIcon, MapPin, MessageSquare, TrendingUp, User, Wallet } from "lucide-react";

function ProjectDetails({ project, onBack }) {
  const getStatusClass = (status) => {
    switch (status) {
      case "Planning": return "status-pill project-planning";
      case "Approved": return "status-pill project-approved";
      case "Ongoing": return "status-pill project-ongoing";
      case "Delayed": return "status-pill project-delayed";
      case "Completed": return "status-pill project-completed";
      case "Cancelled": return "status-pill project-cancelled";
      default: return "status-pill";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Low": return "priority-pill low";
      case "Medium": return "priority-pill medium";
      case "High": return "priority-pill high";
      case "Critical": return "priority-pill urgent";
      default: return "priority-pill";
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return "#6d28d9";
    if (progress >= 60) return "#8b5cf6";
    if (progress >= 30) return "#a78bfa";
    return "#b91c1c";
  };

  const formatKES = (amount) => {
    return `KES ${Number(amount || 0).toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
  };

  const getMilestoneStatusClass = (status) => {
    switch (status) {
      case "Completed": return "status-pill project-completed";
      case "Ongoing": return "status-pill project-ongoing";
      case "Delayed": return "status-pill project-delayed";
      case "Pending": return "status-pill project-planning";
      case "On Track": return "status-pill project-approved";
      default: return "status-pill";
    }
  };

  const budgetUtilization = project.budget > 0 ? Math.round((project.amountSpent / project.budget) * 100) : 0;

  return (
    <div className="complaint-detail-view">
      <div className="profile-top-bar">
        <button className="gov-btn gov-btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </button>
      </div>

      <motion.div
        className="profile-header-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <div className="profile-photo-section">
          <div className="project-detail-icon">
            <FolderKanban size={32} />
          </div>
          <div className="profile-name-section">
            <h1>{project.projectName}</h1>
            <p className="profile-id">{project.projectCode}</p>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
              <span className={getStatusClass(project.status)}>{project.status}</span>
              <span className={getPriorityClass(project.priority)}>{project.priority} Priority</span>
              <span className="status-pill" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
                {project.progress}% Complete
              </span>
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
            <h3><FolderKanban size={16} /> Project Information</h3>
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label"><FolderKanban size={14} /> Category</span>
                <span className="info-value">{project.category}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><MapPin size={14} /> Ward</span>
                <span className="info-value">{project.ward}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><MapPin size={14} /> Location</span>
                <span className="info-value">{project.location}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Wallet size={14} /> Funding Source</span>
                <span className="info-value">{project.fundingSource}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Calendar size={14} /> Financial Year</span>
                <span className="info-value">{project.financialYear}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.28 }}
          >
            <h3><FileText size={16} /> Project Description</h3>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#334155", margin: 0 }}>
              {project.description}
            </p>
          </motion.div>

          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.28 }}
          >
            <h3><Wallet size={16} /> Budget Summary</h3>
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label">Budget Allocated</span>
                <span className="info-value" style={{ fontWeight: 700, color: "#0f172a" }}>{formatKES(project.budget)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Amount Spent</span>
                <span className="info-value" style={{ fontWeight: 700, color: "#8b5cf6" }}>{formatKES(project.amountSpent)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Remaining Balance</span>
                <span className="info-value" style={{ fontWeight: 700, color: "#334155" }}>{formatKES(project.budget - project.amountSpent)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Utilization Rate</span>
                <span className="info-value" style={{ fontWeight: 700, color: getProgressColor(budgetUtilization) }}>{budgetUtilization}%</span>
              </div>
            </div>
            <div style={{ marginTop: "0.7rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                <span style={{ color: "#64748b" }}>Budget Utilization</span>
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{budgetUtilization}%</span>
              </div>
              <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${budgetUtilization}%`,
                  background: getProgressColor(budgetUtilization),
                  borderRadius: "999px",
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.28 }}
          >
            <h3><User size={16} /> Contractor & Project Manager</h3>
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label">Contractor</span>
                <span className="info-value">{project.contractor}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Project Manager</span>
                <span className="info-value">{project.projectManager}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Start Date</span>
                <span className="info-value">{project.startDate}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Expected Completion</span>
                <span className="info-value">{project.expectedCompletion}</span>
              </div>
            </div>
          </motion.div>

          {project.progressUpdates && project.progressUpdates.length > 0 && (
            <motion.div
              className="panel-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.28 }}
            >
              <h3><TrendingUp size={16} /> Progress Updates</h3>
              <ul className="timeline">
                {project.progressUpdates.map((update, index) => (
                  <li key={index} className="timeline-item">
                    <span className="dot" />
                    {index < project.progressUpdates.length - 1 && <span className="line" />}
                    <h4>{update.update}</h4>
                    <p>By: {update.by}</p>
                    <small>{update.date}</small>
                  </li>
                ))}
              </ul>
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
            <h3><CheckCircle2 size={16} /> Timeline</h3>
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label"><Calendar size={14} /> Start Date</span>
                <span className="info-value">{project.startDate}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Calendar size={14} /> Expected Completion</span>
                <span className="info-value">{project.expectedCompletion}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><TrendingUp size={14} /> Current Progress</span>
                <span className="info-value" style={{ fontWeight: 700 }}>{project.progress}%</span>
              </div>
            </div>
            <div style={{ marginTop: "0.7rem" }}>
              <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${project.progress}%`,
                  background: getProgressColor(project.progress),
                  borderRadius: "999px",
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.28 }}
          >
            <h3><CheckCircle2 size={16} /> Milestones</h3>
            {project.milestones && project.milestones.length > 0 ? (
              <div style={{ display: "grid", gap: "0.55rem" }}>
                {project.milestones.map((milestone, index) => (
                  <div key={index} className="milestone-item">
                    <div className="milestone-head">
                      <span className="milestone-title">{milestone.title}</span>
                      <span className={getMilestoneStatusClass(milestone.status)}>{milestone.status}</span>
                    </div>
                    <div className="milestone-meta">
                      <Calendar size={12} />
                      <span>Due: {milestone.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No milestones defined yet.</p>
            )}
          </motion.div>

          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.28 }}
          >
            <h3><Wallet size={16} /> Budget Updates</h3>
            {project.budgetUpdates && project.budgetUpdates.length > 0 ? (
              <div style={{ display: "grid", gap: "0.55rem" }}>
                {project.budgetUpdates.map((update, index) => (
                  <div key={index} className="milestone-item">
                    <div className="milestone-head">
                      <span className="milestone-title">{update.item}</span>
                    </div>
                    <div className="milestone-meta">
                      <span style={{ color: update.type === "returned" ? "#b91c1c" : "#6d28d9", fontWeight: 600 }}>
                        {formatKES(update.amount)}
                      </span>
                      <span>· {update.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No budget updates recorded yet.</p>
            )}
          </motion.div>

          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.28 }}
          >
            <h3><FileText size={16} /> Supporting Documents</h3>
            {project.documents && project.documents.length > 0 ? (
              <div style={{ display: "grid", gap: "0.45rem" }}>
                {project.documents.map((doc, index) => (
                  <div key={index} className="document-item">
                    <FileText size={14} />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No documents uploaded.</p>
            )}
          </motion.div>

          {project.images && project.images.length > 0 && (
            <motion.div
              className="panel-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.28 }}
            >
              <h3><ImageIcon size={16} /> Project Images</h3>
              <div className="project-images-grid">
                {project.images.map((img, index) => (
                  <img key={index} src={img} alt={`Project image ${index + 1}`} className="project-image-thumb" />
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.28 }}
          >
            <h3><MessageSquare size={16} /> Comments</h3>
            {project.comments && project.comments.length > 0 ? (
              <div style={{ display: "grid", gap: "0.55rem" }}>
                {project.comments.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <div className="comment-head">
                      <strong>{comment.author}</strong>
                      <span className="milestone-meta">{comment.date}</span>
                    </div>
                    <p>{comment.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No comments yet.</p>
            )}
          </motion.div>

          {project.activityTimeline && project.activityTimeline.length > 0 && (
            <motion.div
              className="panel-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.28 }}
            >
              <h3><TrendingUp size={16} /> Activity Timeline</h3>
              <ul className="timeline">
                {project.activityTimeline.map((activity, index) => (
                  <li key={index} className="timeline-item">
                    <span className="dot" />
                    {index < project.activityTimeline.length - 1 && <span className="line" />}
                    <h4>{activity.action}</h4>
                    <p>By: {activity.by}</p>
                    <small>{activity.date}</small>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetails;
