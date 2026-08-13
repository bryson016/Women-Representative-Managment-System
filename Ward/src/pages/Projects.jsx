import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import ProjectStats from "../components/projects/ProjectStats";
import ProjectFilters from "../components/projects/ProjectFilters";
import ProjectTable from "../components/projects/ProjectTable";
import ProjectModal from "../components/projects/ProjectModal";
import ProjectDetails from "../components/projects/ProjectDetails";
import ProjectCharts from "../components/projects/ProjectCharts";
import ProjectSidebar from "../components/projects/ProjectSidebar";
import initialProjects, {
  categories,
  statuses,
  priorities,
  wards,
  contractors,
  fundingSources,
  financialYears,
  projectManagers,
} from "../data/projects";

const budgetRanges = [
  "KES 0 - 25M",
  "KES 25M - 50M",
  "KES 50M - 100M",
  "KES 100M - 150M",
  "KES 150M+",
];

const completionRanges = [
  "0% - 25%",
  "26% - 50%",
  "51% - 75%",
  "76% - 100%",
];

function Projects({ onLogout }) {
  const navigate = useNavigate();

  const [projects, setProjects] = useState(() => {
    const stored = localStorage.getItem("ward-projects");
    return stored ? JSON.parse(stored) : initialProjects;
  });
  const [activeItem, setActiveItem] = useState("projects");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [financialYearFilter, setFinancialYearFilter] = useState("");
  const [budgetRangeFilter, setBudgetRangeFilter] = useState("");
  const [wardFilter, setWardFilter] = useState("");
  const [contractorFilter, setContractorFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [completionFilter, setCompletionFilter] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressProject, setProgressProject] = useState(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetProject, setBudgetProject] = useState(null);

  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-KE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    []
  );

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("ward-projects", JSON.stringify(projects));
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        p.projectName.toLowerCase().includes(term) ||
        p.projectCode.toLowerCase().includes(term) ||
        (p.contractor || "").toLowerCase().includes(term) ||
        (p.ward || "").toLowerCase().includes(term) ||
        (p.location || "").toLowerCase().includes(term);

      const matchesStatus = !statusFilter || p.status === statusFilter;
      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      const matchesFinancialYear = !financialYearFilter || p.financialYear === financialYearFilter;
      const matchesWard = !wardFilter || p.ward === wardFilter;
      const matchesContractor = !contractorFilter || p.contractor === contractorFilter;
      const matchesPriority = !priorityFilter || p.priority === priorityFilter;

      let matchesBudget = true;
      if (budgetRangeFilter) {
        if (budgetRangeFilter === "KES 0 - 25M") matchesBudget = p.budget <= 25000000;
        else if (budgetRangeFilter === "KES 25M - 50M") matchesBudget = p.budget > 25000000 && p.budget <= 50000000;
        else if (budgetRangeFilter === "KES 50M - 100M") matchesBudget = p.budget > 50000000 && p.budget <= 100000000;
        else if (budgetRangeFilter === "KES 100M - 150M") matchesBudget = p.budget > 100000000 && p.budget <= 150000000;
        else if (budgetRangeFilter === "KES 150M+") matchesBudget = p.budget > 150000000;
      }

      let matchesCompletion = true;
      if (completionFilter) {
        if (completionFilter === "0% - 25%") matchesCompletion = p.progress >= 0 && p.progress <= 25;
        else if (completionFilter === "26% - 50%") matchesCompletion = p.progress > 25 && p.progress <= 50;
        else if (completionFilter === "51% - 75%") matchesCompletion = p.progress > 50 && p.progress <= 75;
        else if (completionFilter === "76% - 100%") matchesCompletion = p.progress > 75 && p.progress <= 100;
      }

      return matchesSearch && matchesStatus && matchesCategory && matchesFinancialYear && matchesBudget && matchesWard && matchesContractor && matchesPriority && matchesCompletion;
    });
  }, [projects, searchTerm, statusFilter, categoryFilter, financialYearFilter, budgetRangeFilter, wardFilter, contractorFilter, priorityFilter, completionFilter]);

  // Stats
  const totalProjects = filteredProjects.length;
  const ongoingCount = filteredProjects.filter((p) => p.status === "Ongoing").length;
  const completedCount = filteredProjects.filter((p) => p.status === "Completed").length;
  const delayedCount = filteredProjects.filter((p) => p.status === "Delayed").length;
  const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
  const utilizedBudget = filteredProjects.reduce((sum, p) => sum + p.amountSpent, 0);

  // Handlers
  const handleItemClick = useCallback(
    (id) => {
      if (id === "logout") {
        onLogout();
        return;
      }
      if (id === "dashboard") {
        navigate("/dashboard");
        return;
      }
      if (id === "citizens") {
        navigate("/citizens");
        return;
      }
      if (id === "complaints") {
        navigate("/complaints");
        return;
      }
      if (id === "meetings") {
        navigate("/meetings");
        return;
      }
      if (id === "budget") {
        navigate("/budget");
        return;
      }
      if (id === "reports") {
        navigate("/reports");
        return;
      }
      if (id === "settings") {
        navigate("/settings");
        return;
      }
      setActiveItem(id);
      setMobileOpen(false);
    },
    [navigate, onLogout]
  );

  const handleAddClick = () => {
    setEditingProject(null);
    setModalOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleSave = (projectData) => {
    setProjects((prev) => {
      const exists = prev.find((p) => p.id === projectData.id);
      if (exists) {
        return prev.map((p) => (p.id === projectData.id ? projectData : p));
      }
      return [...prev, projectData];
    });
  };

  const handleDelete = (project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete project ${project.projectCode} - ${project.projectName}? This action cannot be undone.`
    );
    if (confirmed) {
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
    }
  };

  const handleView = (project) => {
    setViewingProject(project);
  };

  const handleBack = () => {
    setViewingProject(null);
  };

  const handleUpdateProgress = (project) => {
    setProgressProject(project);
    setProgressModalOpen(true);
  };

  const handleProgressSubmit = (projectId, newProgress, note) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              progress: newProgress,
              status: newProgress >= 100 ? "Completed" : p.status,
              progressUpdates: [
                ...(p.progressUpdates || []),
                { date: new Date().toISOString().split("T")[0], update: note, by: "Ward Office" },
              ],
              activityTimeline: [
                ...(p.activityTimeline || []),
                { date: new Date().toISOString().split("T")[0], action: `Progress updated to ${newProgress}%`, by: "Ward Office" },
              ],
            }
          : p
      )
    );
    setProgressModalOpen(false);
    setProgressProject(null);
  };

  const handleManageBudget = (project) => {
    setBudgetProject(project);
    setBudgetModalOpen(true);
  };

  const handleBudgetSubmit = (projectId, amount, item, type) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              amountSpent: type === "utilized" ? p.amountSpent + amount : Math.max(0, p.amountSpent - amount),
              budgetUpdates: [
                ...(p.budgetUpdates || []),
                { date: new Date().toISOString().split("T")[0], item: item, amount: amount, type: type },
              ],
              activityTimeline: [
                ...(p.activityTimeline || []),
                { date: new Date().toISOString().split("T")[0], action: `Budget ${type}: ${item}`, by: "Ward Office" },
              ],
            }
          : p
      )
    );
    setBudgetModalOpen(false);
    setBudgetProject(null);
  };

  // Export functions
  const exportPdf = () => {
    const tableRows = filteredProjects
      .map(
        (p) =>
          `<tr>
            <td>${p.projectCode}</td>
            <td>${p.projectName}</td>
            <td>${p.category}</td>
            <td>${p.ward}</td>
            <td>${p.location}</td>
            <td>${p.contractor}</td>
            <td>KES ${p.budget.toLocaleString()}</td>
            <td>KES ${p.amountSpent.toLocaleString()}</td>
            <td>${p.progress}%</td>
            <td>${p.startDate}</td>
            <td>${p.expectedCompletion}</td>
            <td>${p.status}</td>
          </tr>`
      )
      .join("");

    const html = `
      <html>
        <head><title>Development Projects Export</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #006b3c; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
          th { background: #006b3c; color: white; }
        </style>
        </head>
        <body>
          <h1>Development Project Records - Ward Management System</h1>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead><tr>
              <th>Code</th><th>Project Name</th><th>Category</th><th>Ward</th><th>Location</th>
              <th>Contractor</th><th>Budget</th><th>Amount Spent</th><th>Progress</th>
              <th>Start Date</th><th>Expected Completion</th><th>Status</th>
            </tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
          <p style="margin-top:20px;color:#666;">Total: ${filteredProjects.length} projects</p>
        </body>
      </html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCategoryFilter("");
    setFinancialYearFilter("");
    setBudgetRangeFilter("");
    setWardFilter("");
    setContractorFilter("");
    setPriorityFilter("");
    setCompletionFilter("");
  };

  // Check if we are viewing a project detail
  if (viewingProject) {
    return (
      <div className={`dashboard-shell ${isDarkMode ? "dark-mode" : ""}`}>
        <Sidebar
          activeItem={activeItem}
          onItemClick={handleItemClick}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="dashboard-main">
          <TopNavbar
            breadcrumb={["Dashboard", "Development Projects", viewingProject.projectCode]}
            currentDate={currentDate}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            onOpenMobileMenu={() => setMobileOpen(true)}
          />
          <ProjectDetails project={viewingProject} onBack={handleBack} />
          <footer className="dashboard-footer">
            <p>Ward Management System</p>
            <p>Academic Demonstration Project</p>
            <p>Version 1.0</p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-shell ${isDarkMode ? "dark-mode" : ""}`}>
      <Sidebar
        activeItem={activeItem}
        onItemClick={handleItemClick}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="dashboard-main">
        <TopNavbar
          breadcrumb={["Dashboard", "Development Projects"]}
          currentDate={currentDate}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <motion.section
          className="welcome-banner projects-hero"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div>
            <h1>Development Projects</h1>
            <h2>Monitor, manage and deliver ward development projects efficiently.</h2>
            <p>
              Track ward development projects from planning to completion, monitor budgets, contractors,
              milestones, timelines, and overall progress to ensure transparency, accountability, and
              efficient service delivery.
            </p>
          </div>
          <div className="welcome-illustration" aria-hidden="true">
            Ward Projects
          </div>
        </motion.section>

        <ProjectStats
          totalProjects={totalProjects}
          ongoingCount={ongoingCount}
          completedCount={completedCount}
          delayedCount={delayedCount}
          totalBudget={totalBudget}
          utilizedBudget={utilizedBudget}
        />

        <ProjectFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          financialYearFilter={financialYearFilter}
          onFinancialYearChange={setFinancialYearFilter}
          budgetRangeFilter={budgetRangeFilter}
          onBudgetRangeChange={setBudgetRangeFilter}
          wardFilter={wardFilter}
          onWardChange={setWardFilter}
          contractorFilter={contractorFilter}
          onContractorChange={setContractorFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
          completionFilter={completionFilter}
          onCompletionChange={setCompletionFilter}
          statuses={statuses}
          categories={categories}
          financialYears={financialYears}
          budgetRanges={budgetRanges}
          wards={wards}
          contractors={contractors}
          priorities={priorities}
          completionRanges={completionRanges}
          onAddClick={handleAddClick}
          onExportPdf={exportPdf}
          onRefresh={handleRefresh}
        />

        <div className="projects-main-col">
          <ProjectTable
            projects={filteredProjects}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdateProgress={handleUpdateProgress}
            onManageBudget={handleManageBudget}
            onAddFirst={handleAddClick}
          />
          <ProjectCharts projects={filteredProjects} />
          <ProjectSidebar projects={filteredProjects} />
        </div>

        <ProjectModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          project={editingProject}
          categories={categories}
          statuses={statuses}
          priorities={priorities}
          wards={wards}
          contractors={contractors}
          fundingSources={fundingSources}
          financialYears={financialYears}
          projectManagers={projectManagers}
        />

        {/* Update Progress Modal */}
        {progressModalOpen && progressProject && (
          <>
            <div className="modal-backdrop" onClick={() => setProgressModalOpen(false)} />
            <div className="modal-container" style={{ maxWidth: "450px" }}>
              <div className="modal-header">
                <h2>Update Project Progress</h2>
                <button className="modal-close" onClick={() => setProgressModalOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const progress = Number(form.progress.value);
                const note = form.note.value || "Progress milestone reached";
                handleProgressSubmit(progressProject.id, progress, note);
              }}>
                <div className="modal-body">
                  <p style={{ fontSize: "0.85rem", color: "#475569", marginBottom: "0.8rem" }}>
                    Updating progress for <strong>{progressProject.projectCode}</strong> - <strong>{progressProject.projectName}</strong>
                  </p>
                  <div className="form-group" style={{ marginBottom: "0.8rem" }}>
                    <label>Progress Percentage (Current: {progressProject.progress}%)</label>
                    <input
                      type="number"
                      name="progress"
                      min="0"
                      max="100"
                      defaultValue={progressProject.progress}
                      required
                      style={{
                        width: "100%", border: "1px solid var(--gov-border)", borderRadius: "0.6rem",
                        padding: "0.5rem 0.6rem", fontSize: "0.85rem", background: "#fff", color: "#0f172a"
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Progress Note</label>
                    <textarea
                      name="note"
                      rows={3}
                      placeholder="Describe the progress update..."
                      style={{
                        width: "100%", border: "1px solid var(--gov-border)", borderRadius: "0.6rem",
                        padding: "0.5rem 0.6rem", fontSize: "0.85rem", fontFamily: "inherit", resize: "vertical"
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="gov-btn gov-btn-ghost" onClick={() => setProgressModalOpen(false)}>Cancel</button>
                  <button type="submit" className="gov-btn gov-btn-primary">Update Progress</button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* Manage Budget Modal */}
        {budgetModalOpen && budgetProject && (
          <>
            <div className="modal-backdrop" onClick={() => setBudgetModalOpen(false)} />
            <div className="modal-container" style={{ maxWidth: "500px" }}>
              <div className="modal-header">
                <h2>Manage Budget - {budgetProject.projectCode}</h2>
                <button className="modal-close" onClick={() => setBudgetModalOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const amount = Number(form.amount.value);
                const item = form.item.value;
                const type = form.type.value;
                handleBudgetSubmit(budgetProject.id, amount, item, type);
              }}>
                <div className="modal-body">
                  <div className="quick-stats-grid" style={{ marginBottom: "1rem" }}>
                    <div className="quick-stat-item">
                      <div className="quick-stat-icon"><Wallet size={16} /></div>
                      <div className="quick-stat-info">
                        <span className="quick-stat-value">KES {budgetProject.budget.toLocaleString()}</span>
                        <span className="quick-stat-label">Total Budget</span>
                      </div>
                    </div>
                    <div className="quick-stat-item">
                      <div className="quick-stat-icon"><TrendingUp size={16} /></div>
                      <div className="quick-stat-info">
                        <span className="quick-stat-value">KES {budgetProject.amountSpent.toLocaleString()}</span>
                        <span className="quick-stat-label">Utilized</span>
                      </div>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: "0.8rem" }}>
                    <label>Transaction Type</label>
                    <select name="type" defaultValue="utilized" style={{
                      width: "100%", border: "1px solid var(--gov-border)", borderRadius: "0.6rem",
                      padding: "0.5rem 0.6rem", fontSize: "0.85rem", background: "#fff", color: "#0f172a"
                    }}>
                      <option value="utilized">Utilized / Spent</option>
                      <option value="returned">Returned / Reversed</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: "0.8rem" }}>
                    <label>Budget Item Description</label>
                    <input
                      name="item"
                      placeholder="e.g. Progress payment - Phase 2"
                      required
                      style={{
                        width: "100%", border: "1px solid var(--gov-border)", borderRadius: "0.6rem",
                        padding: "0.5rem 0.6rem", fontSize: "0.85rem", background: "#fff", color: "#0f172a"
                      }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount (KES)</label>
                    <input
                      type="number"
                      name="amount"
                      min="0"
                      placeholder="e.g. 5000000"
                      required
                      style={{
                        width: "100%", border: "1px solid var(--gov-border)", borderRadius: "0.6rem",
                        padding: "0.5rem 0.6rem", fontSize: "0.85rem", background: "#fff", color: "#0f172a"
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="gov-btn gov-btn-ghost" onClick={() => setBudgetModalOpen(false)}>Cancel</button>
                  <button type="submit" className="gov-btn gov-btn-primary">Update Budget</button>
                </div>
              </form>
            </div>
          </>
        )}

        <footer className="dashboard-footer">
          <p>Ward Management System</p>
          <p>Academic Demonstration Project</p>
          <p>Version 1.0</p>
        </footer>
      </div>
    </div>
  );
}

export default Projects;
