import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import CitizenLayout from "../../components/citizens/CitizenLayout";
import { getCitizenComplaintDetails } from "../../services/citizenApi";

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

function CitizenComplaintDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeItem, setActiveItem] = useState("complaints");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadComplaint() {
      try {
        const response = await getCitizenComplaintDetails(id);
        setComplaint(response.complaint);
      } catch (err) {
        console.error("Error loading complaint details:", err);
        setError("Failed to load complaint details. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadComplaint();
    }
  }, [id]);

  const handleItemClick = (itemId) => {
    setActiveItem(itemId);
    switch (itemId) {
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

  const breadcrumb = ["Dashboard", "My Complaints", "Details"];

  if (loading) {
    return (
      <CitizenLayout activeItem={activeItem} onItemClick={handleItemClick} breadcrumb={breadcrumb}>
        <div className="loading-screen">
          <p>Loading complaint details...</p>
        </div>
      </CitizenLayout>
    );
  }

  if (error || !complaint) {
    return (
      <CitizenLayout activeItem={activeItem} onItemClick={handleItemClick} breadcrumb={breadcrumb}>
        <div className="panel-card">
          <div className="empty-state">
            <div className="empty-illustration">
              <AlertCircle size={64} strokeWidth={1} />
            </div>
            <h3>Complaint Not Found</h3>
            <p>{error || "The complaint you are looking for does not exist or you do not have permission to view it."}</p>
            <button className="gov-btn gov-btn-primary" onClick={() => navigate("/citizen/complaints")}>
              <ArrowLeft size={18} />
              <span>Back to Complaints</span>
            </button>
          </div>
        </div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout activeItem={activeItem} onItemClick={handleItemClick} breadcrumb={breadcrumb}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Back Button */}
        <button className="gov-btn gov-btn-ghost" onClick={() => navigate("/citizen/complaints")} style={{ marginBottom: "1rem" }}>
          <ArrowLeft size={18} />
          <span>Back to Complaints</span>
        </button>

        {/* Complaint Header */}
        <section className="panel-card citizen-panel" style={{ marginBottom: "1.5rem" }}>
          <div className="card-title-row">
            <h3>Complaint Details</h3>
            <ComplaintStatusBadge status={complaint.status} />
          </div>
          <div className="citizen-complaint-detail-grid">
            <div className="citizen-complaint-detail-item">
              <span className="detail-label">Complaint Code</span>
              <span className="detail-value">{complaint.complaintCode}</span>
            </div>
            <div className="citizen-complaint-detail-item">
              <span className="detail-label">Category</span>
              <span className="detail-value">{complaint.category.replace("_", " ")}</span>
            </div>
            <div className="citizen-complaint-detail-item">
              <span className="detail-label">Priority</span>
              <span className="detail-value">{complaint.priority}</span>
            </div>
            <div className="citizen-complaint-detail-item">
              <span className="detail-label">Village</span>
              <span className="detail-value">{complaint.village}</span>
            </div>
            <div className="citizen-complaint-detail-item">
              <span className="detail-label">Date Reported</span>
              <span className="detail-value">{complaint.dateReported}</span>
            </div>
            <div className="citizen-complaint-detail-item">
              <span className="detail-label">Last Updated</span>
              <span className="detail-value">{complaint.lastUpdated}</span>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="panel-card citizen-panel" style={{ marginBottom: "1.5rem" }}>
          <div className="card-title-row">
            <h3>Description</h3>
          </div>
          <p className="citizen-complaint-desc">{complaint.description}</p>
        </section>

        {/* Officer Assignment */}
        {complaint.assignedOfficer && (
          <section className="panel-card citizen-panel" style={{ marginBottom: "1.5rem" }}>
            <div className="card-title-row">
              <h3>Assigned Officer</h3>
            </div>
            <p className="citizen-complaint-officer">
              👤 {complaint.assignedOfficer}
            </p>
          </section>
        )}

        {/* Resolution Notes */}
        {complaint.resolutionNotes && (
          <section className="panel-card citizen-panel" style={{ marginBottom: "1.5rem" }}>
            <div className="card-title-row">
              <h3>Resolution</h3>
            </div>
            <div className="citizen-complaint-resolution">
              <p>{complaint.resolutionNotes}</p>
            </div>
          </section>
        )}

        {/* Communications / Updates */}
        {complaint.communications && complaint.communications.length > 0 && (
          <section className="panel-card citizen-panel">
            <div className="card-title-row">
              <h3>Updates & Communications</h3>
            </div>
            <div className="citizen-communications-list">
              {complaint.communications.map((comm, index) => (
                <motion.div
                  key={comm.id}
                  className="citizen-communication-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <div className="citizen-communication-header">
                    <span className="citizen-communication-action">{comm.action}</span>
                    <span className="citizen-communication-date">{comm.date}</span>
                  </div>
                  <p className="citizen-communication-notes">{comm.notes}</p>
                  <small className="citizen-communication-performed">
                    By: {comm.performedBy}
                  </small>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </motion.div>
    </CitizenLayout>
  );
}

export default CitizenComplaintDetails;
