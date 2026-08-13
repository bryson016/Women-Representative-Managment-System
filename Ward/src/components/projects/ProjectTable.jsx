import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, FolderKanban, ArrowUpDown } from "lucide-react";
import ProjectRow from "./ProjectRow";

const ITEMS_PER_PAGE = 8;

function ProjectTable({ projects, onView, onEdit, onDelete, onUpdateProgress, onManageBudget, onAddFirst }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "projectCode", direction: "asc" });

  const sortedProjects = useMemo(() => {
    if (!sortConfig.key) return projects;
    return [...projects].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [projects, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedProjects.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedProjects = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return sortedProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProjects, safePage]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, safePage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const renderSortableHeader = (label, key) => (
    <th onClick={() => handleSort(key)} style={{ cursor: "pointer" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
        {label}
        <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
      </span>
    </th>
  );

  if (projects.length === 0) {
    return (
      <motion.div
        className="panel-card empty-state-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <div className="empty-state">
          <div className="empty-illustration">
            <FolderKanban size={64} strokeWidth={1} />
          </div>
          <h3>No development projects have been registered yet.</h3>
          <p>Start by adding the first project in your ward.</p>
          <button className="gov-btn gov-btn-primary" onClick={onAddFirst}>
            <FolderKanban size={16} />
            <span>Add First Project</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="panel-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="card-title-row">
        <h3>Development Project Records</h3>
        <span className="citizen-count">{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="table-wrap">
        <table className="project-table">
          <thead>
            <tr>
              {renderSortableHeader("Project Code", "projectCode")}
              {renderSortableHeader("Project Name", "projectName")}
              {renderSortableHeader("Category", "category")}
              <th>Ward</th>
              <th>Location</th>
              {renderSortableHeader("Contractor", "contractor")}
              {renderSortableHeader("Budget", "budget")}
              {renderSortableHeader("Amount Spent", "amountSpent")}
              {renderSortableHeader("Progress", "progress")}
              {renderSortableHeader("Start Date", "startDate")}
              {renderSortableHeader("Expected Completion", "expectedCompletion")}
              {renderSortableHeader("Status", "status")}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paginatedProjects.map((project, index) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  index={index}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onUpdateProgress={onUpdateProgress}
                  onManageBudget={onManageBudget}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="pagination-pages">
            {pageNumbers.map((page) => (
              <button
                key={page}
                className={`pagination-page ${page === safePage ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default ProjectTable;
