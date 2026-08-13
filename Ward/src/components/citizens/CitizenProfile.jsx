import { motion } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Shield,
  Briefcase,
  AlertCircle,
  FolderKanban,
  Users,
  UserCheck,
  Clock,
} from "lucide-react";

function CitizenProfile({ citizen, onBack }) {
  if (!citizen) {
    return (
      <div className="panel-card">
        <p>Citizen not found.</p>
        <button className="gov-btn gov-btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Citizens
        </button>
      </div>
    );
  }

  const initials = `${citizen.firstName[0]}${citizen.lastName[0]}`;

  const quickStats = [
    { label: "Complaints Filed", value: "3", icon: AlertCircle },
    { label: "Projects Assigned", value: "1", icon: FolderKanban },
    { label: "Dependents", value: "4", icon: Users },
    { label: "Years Registered", value: "1", icon: Clock },
  ];

  const recentComplaints = [
    { id: 1, title: "Road pothole on Kangemi Road", status: "In Progress", date: "2026-07-15" },
    { id: 2, title: "Street light not working near plot 45", status: "Resolved", date: "2026-06-28" },
    { id: 3, title: "Garbage collection delay", status: "Pending", date: "2026-07-10" },
  ];

  const assignedProjects = [
    { id: 1, name: "Kangemi Water Extension", role: "Beneficiary", status: "In Progress" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="profile-top-bar">
        <button className="gov-btn gov-btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Citizens</span>
        </button>
      </div>

      <div className="profile-header-card">
        <div className="profile-photo-section">
          {citizen.photoUrl ? (
            <img src={citizen.photoUrl} alt={`${citizen.firstName} ${citizen.lastName}`} className="profile-photo" />
          ) : (
            <div className="profile-photo-placeholder-lg">{initials}</div>
          )}
          <div className="profile-name-section">
            <h1>{citizen.firstName} {citizen.lastName}</h1>
            <p className="profile-id">{citizen.nationalId}</p>
            <span className={`status-pill ${citizen.status === "Active" ? "active" : "inactive"}`}>
              {citizen.status}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-left">
          <section className="panel-card">
            <h3><User size={16} /> Personal Information</h3>
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{citizen.firstName} {citizen.lastName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Gender</span>
                <span className="info-value">{citizen.gender}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Date of Birth</span>
                <span className="info-value">{citizen.dateOfBirth}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Occupation</span>
                <span className="info-value">{citizen.occupation}</span>
              </div>
              <div className="info-item">
                <span className="info-label">National ID</span>
                <span className="info-value">{citizen.nationalId}</span>
              </div>
            </div>
          </section>

          <section className="panel-card">
            <h3><Phone size={16} /> Contact Information</h3>
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label"><Mail size={14} /> Email</span>
                <span className="info-value">{citizen.email || "Not provided"}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Phone size={14} /> Phone</span>
                <span className="info-value">{citizen.phoneNumber}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Phone size={14} /> Emergency Contact</span>
                <span className="info-value">{citizen.emergencyContact || "Not provided"}</span>
              </div>
            </div>
          </section>

          <section className="panel-card">
            <h3><MapPin size={16} /> Location Information</h3>
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label">Village</span>
                <span className="info-value">{citizen.village}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Sub-location</span>
                <span className="info-value">{citizen.subLocation || "Not specified"}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ward</span>
                <span className="info-value">{citizen.ward}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Physical Address</span>
                <span className="info-value">{citizen.physicalAddress || "Not specified"}</span>
              </div>
            </div>
          </section>

          <section className="panel-card">
            <h3><Calendar size={16} /> Registration Details</h3>
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label">Registration Date</span>
                <span className="info-value">{citizen.registrationDate}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Registered By</span>
                <span className="info-value">Ward Administrator</span>
              </div>
            </div>
          </section>
        </div>

        <div className="profile-right">
          <section className="panel-card">
            <h3><Shield size={16} /> Quick Statistics</h3>
            <div className="quick-stats-grid">
              {quickStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="quick-stat-item">
                    <div className="quick-stat-icon">
                      <Icon size={18} />
                    </div>
                    <div className="quick-stat-info">
                      <span className="quick-stat-value">{stat.value}</span>
                      <span className="quick-stat-label">{stat.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel-card">
            <h3><AlertCircle size={16} /> Recent Complaints</h3>
            <div className="complaint-list">
              {recentComplaints.map((complaint) => (
                <div key={complaint.id} className="complaint-item">
                  <div className="complaint-item-header">
                    <span className="complaint-title">{complaint.title}</span>
                    <span className={`status-pill ${complaint.status.toLowerCase().replace(" ", "-")}`}>
                      {complaint.status}
                    </span>
                  </div>
                  <span className="complaint-date">{complaint.date}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel-card">
            <h3><FolderKanban size={16} /> Assigned Projects</h3>
            <div className="project-list">
              {assignedProjects.map((project) => (
                <div key={project.id} className="project-item">
                  <div className="project-item-header">
                    <span className="project-name">{project.name}</span>
                    <span className={`status-pill ${project.status.toLowerCase().replace(" ", "-")}`}>
                      {project.status}
                    </span>
                  </div>
                  <span className="project-role">Role: {project.role}</span>
                </div>
              ))}
              {assignedProjects.length === 0 && (
                <p className="no-data">No projects assigned yet.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

export default CitizenProfile;
