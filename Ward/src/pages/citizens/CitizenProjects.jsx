import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, Calendar, User, DollarSign, FolderKanban } from "lucide-react";
import CitizenLayout from "../../components/citizens/CitizenLayout";
import { getWardProjects } from "../../services/citizenApi";

const CATEGORIES = [
  "Roads_Transport",
  "Water_Sanitation",
  "Health_Services",
  "Education_Support",
  "Public_Markets",
  "Street_Lighting",
  "Drainage_Flood_Control",
  "Community_Facilities",
];

const STATUSES = ["Planning", "Approved", "Ongoing", "Delayed", "Completed", "Cancelled"];

function CitizenProjects() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("projects");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await getWardProjects();
        setProjects(response.projects || []);
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        p.projectName.toLowerCase().includes(term) ||
        p.projectCode.toLowerCase().includes(term) ||
        (p.location && p.location.toLowerCase().includes(term)) ||
        (p.village && p.village.toLowerCase().includes(term));

      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      const matchesStatus = !statusFilter || p.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [projects, searchTerm, categoryFilter, statusFilter]);

  const breadcrumb = ["Dashboard", "Development Projects"];

  const handleItemClick = (id) => {
    setActiveItem(id);
    switch (id) {
      case "dashboard":
        navigate("/citizen/dashboard");
        break;
      case "complaints":
        navigate("/citizen/complaints");
        break;
      case "projects":
        navigate("/citizen/projects");
        break;
      case "meetings":
        navigate("/citizen/meetings");
        break;
      case "announcements":
        navigate("/citizen/announcements");
        break;
      case "notifications":
        navigate("/citizen/notifications");
        break;
      case "profile":
        navigate("/citizen/profile");
        break;
      default:
        break;
    }
  };

  return (
    <CitizenLayout activeItem={activeItem} onItemClick={handleItemClick} breadcrumb={breadcrumb}>
      {/* Filters */}
      <div className="citizen-filters">
        <div className="filters-row">
          <div className="filters-search-group">
            <label className="filter-label">Search Projects</label>
            <div className="search-input-group">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, code, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-search-input"
              />
            </div>
          </div>
          <div className="filters-select-group">
            <div className="filter-item">
              <label className="filter-label">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-item">
              <label className="filter-label">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="loading-screen">
          <p>Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <motion.div
          className="panel-card empty-state-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="empty-state">
            <div className="empty-illustration">
              <FolderKanban size={64} strokeWidth={1} />
            </div>
            <h3>No projects found</h3>
            <p>There are no development projects matching your criteria.</p>
          </div>
        </motion.div>
      ) : (
        <div className="citizen-projects-grid">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className={`citizen-project-card status-${project.status.toLowerCase()}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ y: -4 }}
            >
              <div className="citizen-project-card-header">
                <h4>{project.projectName}</h4>
                <span className={`status-pill project-${project.status.toLowerCase()}`}>
                  {project.status}
                </span>
              </div>
              <p className="citizen-project-code">{project.projectCode}</p>
              <p className="citizen-project-desc">{project.description}</p>

              <div className="citizen-project-progress">
                <div className="citizen-progress-bar">
                  <div
                    className="citizen-progress-fill"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="citizen-progress-text">{project.progress}% Complete</span>
              </div>

              <div className="citizen-project-details">
                <div className="citizen-project-detail">
                  <MapPin size={14} />
                  <span>{project.location || project.village || "N/A"}</span>
                </div>
                <div className="citizen-project-detail">
                  <Calendar size={14} />
                  <span>
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "TBD"}{" "}
                    -{" "}
                    {project.expectedCompletion
                      ? new Date(project.expectedCompletion).toLocaleDateString()
                      : "TBD"}
                  </span>
                </div>
                <div className="citizen-project-detail">
                  <User size={14} />
                  <span>{project.projectManagerName || "TBD"}</span>
                </div>
                <div className="citizen-project-detail">
                  <DollarSign size={14} />
                  <span>KES {parseFloat(project.budget).toLocaleString()}</span>
                </div>
              </div>

              <div className="citizen-project-footer">
                <span className={`category-pill ${project.category.toLowerCase()}`}>
                  {project.category.replace("_", " ")}
                </span>
                <span className="priority-pill">{project.priority}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </CitizenLayout>
  );
}

export default CitizenProjects;
