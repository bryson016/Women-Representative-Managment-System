import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Building2,
  Award,
  Clock,
  User,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

function StaffDetails({ staff, onBack }) {
  const getStatusClass = (status) => {
    switch (status) {
      case "On Duty": return "status-pill staff-on-duty";
      case "Off Duty": return "status-pill staff-off-duty";
      case "On Leave": return "status-pill staff-on-leave";
      case "Field Visit": return "status-pill staff-field-visit";
      default: return "status-pill";
    }
  };

  const getPerformanceClass = (score) => {
    if (score >= 90) return "performance-badge excellent";
    if (score >= 80) return "performance-badge good";
    return "performance-badge average";
  };

  const initials = `${staff.firstName[0]}${staff.lastName[0]}`;

  return (
    <div className="staff-detail-view">
      <div className="profile-top-bar">
        <button className="gov-btn gov-btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Staff</span>
        </button>
      </div>

      <motion.div
        className="profile-header-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <div className="profile-photo-section">
          <div className="profile-photo-placeholder-lg">{initials}</div>
          <div className="profile-name-section">
            <h1>{staff.firstName} {staff.lastName}</h1>
            <p className="profile-id">{staff.staffId} • {staff.role}</p>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
              <span className={getStatusClass(staff.status)}>{staff.status}</span>
              <span className={getPerformanceClass(staff.performanceScore)}>
                {staff.performanceScore}% Performance
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
            <h3><User size={16} /> Personal Information</h3>
            <div className="profile-info-grid">
              <div className="info-item">
                <span className="info-label"><User size={14} /> Full Name</span>
                <span className="info-value">{staff.firstName} {staff.lastName}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Briefcase size={14} /> Role</span>
                <span className="info-value">{staff.role}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Building2 size={14} /> Department</span>
                <span className="info-value">{staff.department}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Phone size={14} /> Phone</span>
                <span className="info-value">{staff.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Mail size={14} /> Email</span>
                <span className="info-value">{staff.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label"><Calendar size={14} /> Employment Date</span>
                <span className="info-value">{staff.employmentDate}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.28 }}
          >
            <h3><Award size={16} /> Certifications</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {staff.certifications.map((cert) => (
                <span key={cert} className="certification-chip">
                  <Award size={12} />
                  {cert}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.28 }}
          >
            <h3><MapPin size={16} /> Villages Covered</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {staff.villagesCovered.map((village) => (
                <span key={village} className="village-chip">
                  <MapPin size={12} />
                  {village}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="profile-right">
          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.28 }}
          >
            <h3><TrendingUp size={16} /> Work Overview</h3>
            <div className="quick-stats-grid">
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><TrendingUp size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{staff.performanceScore}%</span>
                  <span className="quick-stat-label">Performance</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><Briefcase size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{staff.workload}</span>
                  <span className="quick-stat-label">Workload</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><CheckCircle2 size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{staff.assignedTasks}</span>
                  <span className="quick-stat-label">Assigned Tasks</span>
                </div>
              </div>
              <div className="quick-stat-item">
                <div className="quick-stat-icon"><Clock size={16} /></div>
                <div className="quick-stat-info">
                  <span className="quick-stat-value">{staff.lastActive}</span>
                  <span className="quick-stat-label">Last Active</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="panel-card"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.28 }}
          >
            <h3><User size={16} /> Professional Bio</h3>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#334155", margin: 0 }}>
              {staff.bio}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default StaffDetails;
