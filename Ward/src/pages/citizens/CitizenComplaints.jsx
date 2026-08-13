import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Eye,
  Search,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  CircleAlert,
} from "lucide-react";
import CitizenLayout from "../../components/citizens/CitizenLayout";
import { getCitizenComplaints, submitComplaint } from "../../services/citizenApi";

const CATEGORIES = [
  "Sanitation",
  "Road_Repair",
  "Water_Supply",
  "Street_Lighting",
  "Waste_Management",
  "Health_Services",
  "Education",
  "Security",
  "Other",
];

const STATUSES = ["Open", "Assigned", "In_Progress", "Resolved", "Closed"];

function ComplaintStatusBadge({ status }) {
  const statusConfig = {
    Open: { className: "status-pill open", icon: AlertCircle },
    Assigned: { className: "status-pill assigned", icon: Clock },
    In_Progress: { className: "status-pill in-progress", icon: Clock },
    Resolved: { className: "status-pill resolved", icon: CheckCircle },
    Closed: { className: "status-pill closed", icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig.Open;
  const Icon = config.icon;

  return (
    <span className={config.className}>
      <Icon size={12} />
      {status.replace("_", " ")}
    </span>
  );
}

function CitizenComplaints() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("complaints");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [formData, setFormData] = useState({
    category: "Sanitation",
    priority: "Medium",
    description: "",
    village: "",
  });

  useEffect(() => {
    async function loadComplaints() {
      try {
        const response = await getCitizenComplaints();
        setComplaints(response.complaints || []);
      } catch (error) {
        console.error("Error loading complaints:", error);
      } finally {
        setLoading(false);
      }
    }

    loadComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        c.complaintCode.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term) ||
        c.village.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term));

      const matchesCategory = !categoryFilter || c.category === categoryFilter;
      const matchesStatus = !statusFilter || c.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [complaints, searchTerm, categoryFilter, statusFilter]);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitComplaint(formData);
      setSubmitSuccess(true);
      setShowSubmitForm(false);
      setFormData({ category: "Sanitation", priority: "Medium", description: "", village: "" });

      // Reload complaints
      const response = await getCitizenComplaints();
      setComplaints(response.complaints || []);

      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("Error submitting complaint:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumb = ["Dashboard", "My Complaints"];

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
      {submitSuccess && (
        <motion.div
          className="alert alert-success"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✅ Complaint submitted successfully!
        </motion.div>
      )}

      {/* Actions Bar */}
      <div className="citizen-actions-bar">
        <button className="gov-btn gov-btn-primary" onClick={() => setShowSubmitForm(!showSubmitForm)}>
          <PlusCircle size={18} />
          <span>{showSubmitForm ? "Cancel" : "Submit New Complaint"}</span>
        </button>
      </div>

      {/* Submit Complaint Form */}
      {showSubmitForm && (
        <motion.section
          className="panel-card citizen-panel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-title-row">
            <h3>Submit a New Complaint</h3>
          </div>
          <form onSubmit={handleSubmitComplaint} className="citizen-complaint-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="village">Village / Location</label>
              <input
                id="village"
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="Enter your village or location"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your complaint in detail..."
                rows={4}
              />
            </div>
            <button type="submit" className="gov-btn gov-btn-primary" disabled={submitting || !formData.description.trim()}>
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </motion.section>
      )}

      {/* Filters */}
      <div className="citizen-filters">
        <div className="filters-row">
          <div className="filters-search-group">
            <label className="filter-label">Search</label>
            <div className="search-input-group">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by code, category, village..."
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
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="loading-screen">
          <p>Loading your complaints...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <motion.div
          className="panel-card empty-state-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="empty-state">
            <div className="empty-illustration">
              <CircleAlert size={64} strokeWidth={1} />
            </div>
            <h3>No complaints found</h3>
            <p>You haven't submitted any complaints yet, or no complaints match your filters.</p>
            <button className="gov-btn gov-btn-primary" onClick={() => setShowSubmitForm(true)}>
              <PlusCircle size={16} />
              <span>Submit Your First Complaint</span>
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="citizen-complaints-list">
          {filteredComplaints.map((complaint, index) => (
            <motion.div
              key={complaint.id}
              className={`citizen-complaint-card status-${complaint.status.toLowerCase().replace("_", "")}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ y: -2 }}
            >
              <div className="citizen-complaint-card-header">
                <span className="citizen-complaint-code">{complaint.complaintCode}</span>
                <ComplaintStatusBadge status={complaint.status} />
              </div>
              <h4>{complaint.category.replace("_", " ")}</h4>
              <p className="citizen-complaint-desc">{complaint.description}</p>
              <div className="citizen-complaint-meta">
                <span>📅 {complaint.dateReported}</span>
                <span>📍 {complaint.village}</span>
                <span>⚡ {complaint.priority}</span>
              </div>
              {complaint.assignedOfficer && (
                <div className="citizen-complaint-officer">
                  <span className="officer-label">Assigned Officer:</span>
                  <span className="officer-name">{complaint.assignedOfficer}</span>
                </div>
              )}
              {complaint.resolutionNotes && (
                <div className="citizen-complaint-resolution">
                  <strong>Resolution:</strong>
                  <p>{complaint.resolutionNotes}</p>
                </div>
              )}
              <div className="citizen-complaint-actions">
                <button className="gov-btn gov-btn-ghost" onClick={() => navigate(`/citizen/complaints/${complaint.id}`)}>
                  <Eye size={16} />
                  <span>View Details</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </CitizenLayout>
  );
}

export default CitizenComplaints;
