import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Edit2, Trash2, MoreHorizontal, TrendingUp, Wallet } from "lucide-react";

function ProjectRow({ project, index, onView, onEdit, onDelete, onUpdateProgress, onManageBudget }) {
  const [menuOpen, setMenuOpen] = useState(false);

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
    if (progress >= 100) return "#166534";
    if (progress >= 60) return "#0e8a4b";
    if (progress >= 30) return "#d4a017";
    return "#b91c1c";
  };

  const formatKES = (amount) => {
    if (amount >= 1000000000) return `KES ${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `KES ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `KES ${(amount / 1000).toFixed(0)}K`;
    return `KES ${amount}`;
  };

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.2 }}
    >
      <td className="td-complaint-id">{project.projectCode}</td>
      <td className="td-fullname">{project.projectName}</td>
      <td>{project.category}</td>
      <td>{project.ward}</td>
      <td>{project.location}</td>
      <td>{project.contractor}</td>
      <td style={{ fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap" }}>{formatKES(project.budget)}</td>
      <td style={{ whiteSpace: "nowrap" }}>{formatKES(project.amountSpent)}</td>
      <td>
        <div style={{ minWidth: "110px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#334155" }}>{project.progress}%</span>
          </div>
          <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${project.progress}%`,
                background: getProgressColor(project.progress),
                borderRadius: "999px",
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>
      </td>
      <td style={{ whiteSpace: "nowrap" }}>{project.startDate}</td>
      <td style={{ whiteSpace: "nowrap" }}>{project.expectedCompletion}</td>
      <td>
        <span className={getStatusClass(project.status)}>
          {project.status}
        </span>
      </td>
      <td className="td-actions">
        <div className="action-btn-group">
          <button className="table-action-btn" onClick={() => onView(project)} title="View">
            <Eye size={14} />
          </button>
          <button className="table-action-btn" onClick={() => onEdit(project)} title="Edit">
            <Edit2 size={14} />
          </button>
          {(project.status === "Ongoing" || project.status === "Delayed" || project.status === "Approved") && (
            <button className="table-action-btn" onClick={() => onUpdateProgress(project)} title="Update Progress">
              <TrendingUp size={14} />
            </button>
          )}
          <button className="table-action-btn" onClick={() => onManageBudget(project)} title="Manage Budget">
            <Wallet size={14} />
          </button>
          <button className="table-action-btn" onClick={() => onDelete(project)} title="Delete">
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
                  <button onClick={() => { setMenuOpen(false); onView(project); }}>
                    <Eye size={14} /> View Details
                  </button>
                  <button onClick={() => { setMenuOpen(false); onEdit(project); }}>
                    <Edit2 size={14} /> Edit Project
                  </button>
                  {(project.status === "Ongoing" || project.status === "Delayed" || project.status === "Approved") && (
                    <button onClick={() => { setMenuOpen(false); onUpdateProgress(project); }}>
                      <TrendingUp size={14} /> Update Progress
                    </button>
                  )}
                  <button onClick={() => { setMenuOpen(false); onManageBudget(project); }}>
                    <Wallet size={14} /> Manage Budget
                  </button>
                  <button className="danger" onClick={() => { setMenuOpen(false); onDelete(project); }}>
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

export default ProjectRow;
