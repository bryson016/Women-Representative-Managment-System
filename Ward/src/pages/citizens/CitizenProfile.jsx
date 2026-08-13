import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Save, CircleAlert, CheckCircle } from "lucide-react";
import CitizenLayout from "../../components/citizens/CitizenLayout";
import { getCitizenProfile, updateCitizenProfile, getCitizenComplaints } from "../../services/citizenApi";

function CitizenProfile() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");
  const [complaintStats, setComplaintStats] = useState({ total: 0, resolved: 0 });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    ward: "",
    firstName: "",
    lastName: "",
    gender: "Male",
    dateOfBirth: "",
    occupation: "",
    village: "",
    subLocation: "",
    physicalAddress: "",
    emergencyContact: "",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const [profileResponse, complaintsResponse] = await Promise.all([
          getCitizenProfile(),
          getCitizenComplaints().catch(() => ({ complaints: [] })),
        ]);

        setProfile(profileResponse);

        const user = profileResponse.user;
        const citizen = profileResponse.citizen;

        setFormData({
          fullName: user.fullName || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          ward: user.ward || "",
          firstName: citizen?.firstName || "",
          lastName: citizen?.lastName || "",
          gender: citizen?.gender || "Male",
          dateOfBirth: citizen?.dateOfBirth || "",
          occupation: citizen?.occupation || "",
          village: citizen?.village || "",
          subLocation: citizen?.subLocation || "",
          physicalAddress: citizen?.physicalAddress || "",
          emergencyContact: citizen?.emergencyContact || "",
        });

        const complaints = complaintsResponse.complaints || [];
        setComplaintStats({
          total: complaints.length,
          resolved: complaints.filter((c) => c.status === "Resolved" || c.status === "Closed").length,
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateCitizenProfile(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const breadcrumb = ["Dashboard", "My Profile"];

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

  if (loading) {
    return (
      <CitizenLayout activeItem={activeItem} onItemClick={handleItemClick} breadcrumb={breadcrumb}>
        <div className="loading-screen">
          <p>Loading profile...</p>
        </div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout activeItem={activeItem} onItemClick={handleItemClick} breadcrumb={breadcrumb}>
      {saveSuccess && (
        <motion.div
          className="alert alert-success"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✅ Profile updated successfully!
        </motion.div>
      )}

      {error && (
        <motion.div
          className="alert alert-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Profile Header */}
      <div className="profile-header-card citizen-profile-header">
        <div className="profile-photo-section">
          <div className="profile-photo-placeholder-lg">
            <User size={32} />
          </div>
          <div className="profile-name-section">
            <h1>{formData.fullName || "Citizen"}</h1>
            <p className="profile-id">
              Ward: {formData.ward || "Not set"}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="citizen-profile-form">
        <div className="profile-grid">
          <div className="profile-left">
            {/* Account Information */}
            <section className="panel-card">
              <div className="card-title-row">
                <h3>Account Information</h3>
              </div>
              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div className="settings-form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="settings-form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="settings-form-group">
                  <label htmlFor="ward">Ward</label>
                  <input
                    id="ward"
                    name="ward"
                    type="text"
                    value={formData.ward}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            {/* Personal Information */}
            <section className="panel-card">
              <div className="card-title-row">
                <h3>Personal Information</h3>
              </div>
              <div className="settings-form-grid">
                <div className="settings-form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="settings-form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                <div className="settings-form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="settings-form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div className="settings-form-group">
                  <label htmlFor="occupation">Occupation</label>
                  <input
                    id="occupation"
                    name="occupation"
                    type="text"
                    value={formData.occupation}
                    onChange={handleChange}
                  />
                </div>
                <div className="settings-form-group">
                  <label htmlFor="village">Village</label>
                  <input
                    id="village"
                    name="village"
                    type="text"
                    value={formData.village}
                    onChange={handleChange}
                  />
                </div>
                <div className="settings-form-group">
                  <label htmlFor="subLocation">Sub-Location</label>
                  <input
                    id="subLocation"
                    name="subLocation"
                    type="text"
                    value={formData.subLocation}
                    onChange={handleChange}
                  />
                </div>
                <div className="settings-form-group full-width">
                  <label htmlFor="physicalAddress">Physical Address</label>
                  <input
                    id="physicalAddress"
                    name="physicalAddress"
                    type="text"
                    value={formData.physicalAddress}
                    onChange={handleChange}
                  />
                </div>
                <div className="settings-form-group">
                  <label htmlFor="emergencyContact">Emergency Contact</label>
                  <input
                    id="emergencyContact"
                    name="emergencyContact"
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="profile-right">
            {/* Quick Stats */}
            <section className="panel-card">
              <div className="card-title-row">
                <h3>Quick Stats</h3>
              </div>
              <div className="quick-stats-grid">
                <div className="quick-stat-item">
                  <div className="quick-stat-icon complaints">
                    <CircleAlert size={18} />
                  </div>
                  <div className="quick-stat-info">
                    <span className="quick-stat-value">{complaintStats.total}</span>
                    <span className="quick-stat-label">Total Complaints</span>
                  </div>
                </div>
                <div className="quick-stat-item">
                  <div className="quick-stat-icon resolved">
                    <CheckCircle size={18} />
                  </div>
                  <div className="quick-stat-info">
                    <span className="quick-stat-value">{complaintStats.resolved}</span>
                    <span className="quick-stat-label">Resolved</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Info */}
            <section className="panel-card">
              <div className="card-title-row">
                <h3>Account Details</h3>
              </div>
              <div className="profile-info-grid">
                <div className="info-item">
                  <span className="info-label">
                    <User size={14} /> Username
                  </span>
                  <span className="info-value">{profile?.user?.username || "-"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">
                    <Mail size={14} /> Email
                  </span>
                  <span className="info-value">{profile?.user?.email || "-"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">
                    <Phone size={14} /> Phone
                  </span>
                  <span className="info-value">{profile?.user?.phoneNumber || "-"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">
                    <MapPin size={14} /> Ward
                  </span>
                  <span className="info-value">{profile?.user?.ward || "-"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Role</span>
                  <span className="info-value">{profile?.user?.role || "citizen"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className="info-value">{profile?.user?.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" className="gov-btn gov-btn-primary" disabled={saving}>
            <Save size={18} />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </CitizenLayout>
  );
}

export default CitizenProfile;
