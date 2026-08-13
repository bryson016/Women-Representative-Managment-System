import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const INITIAL_STATE = {
  firstName: "",
  lastName: "",
  role: "",
  department: "",
  phone: "",
  email: "",
  employmentDate: "",
  status: "On Duty",
  performanceScore: 85,
  workload: 0,
  assignedTasks: 0,
  villagesCovered: [],
  bio: "",
  certifications: [],
};

function StaffModal({ isOpen, onClose, onSave, staff, departments, roles, statuses, villages }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const isEditing = Boolean(staff);

  useEffect(() => {
    if (staff) {
      setFormData({
        firstName: staff.firstName || "",
        lastName: staff.lastName || "",
        role: staff.role || "",
        department: staff.department || "",
        phone: staff.phone || "",
        email: staff.email || "",
        employmentDate: staff.employmentDate || "",
        status: staff.status || "On Duty",
        performanceScore: staff.performanceScore || 85,
        workload: staff.workload || 0,
        assignedTasks: staff.assignedTasks || 0,
        villagesCovered: staff.villagesCovered || [],
        bio: staff.bio || "",
        certifications: staff.certifications || [],
      });
    } else {
      setFormData(INITIAL_STATE);
    }
    setErrors({});
  }, [staff, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleVillageToggle = (village) => {
    setFormData((prev) => {
      const exists = prev.villagesCovered.includes(village);
      return {
        ...prev,
        villagesCovered: exists
          ? prev.villagesCovered.filter((v) => v !== village)
          : [...prev.villagesCovered, village],
      };
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";
    if (!formData.employmentDate) newErrors.employmentDate = "Employment date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateStaffId = () => {
    const random = Math.floor(100 + Math.random() * 900);
    return `STF-${random}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const staffData = {
      ...formData,
      id: staff ? staff.id : Date.now(),
      staffId: staff ? staff.staffId : generateStaffId(),
      villagesCovered: formData.villagesCovered,
      certifications: formData.certifications.filter((c) => c.trim()),
      lastActive: staff?.lastActive || "Just now",
    };

    onSave(staffData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="modal-container"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="modal-header">
              <h2>{isEditing ? "Edit Staff Member" : "Add Staff Member"}</h2>
              <button className="modal-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First name"
                      />
                      {errors.firstName && <p className="error-text">{errors.firstName}</p>}
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                      />
                      {errors.lastName && <p className="error-text">{errors.lastName}</p>}
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="">Select Role</option>
                        {roles.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      {errors.role && <p className="error-text">{errors.role}</p>}
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <select name="department" value={formData.department} onChange={handleChange}>
                        <option value="">Select Department</option>
                        {departments.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      {errors.department && <p className="error-text">{errors.department}</p>}
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+254 7XX XXX XXX"
                      />
                      {errors.phone && <p className="error-text">{errors.phone}</p>}
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@westlands.go.ke"
                      />
                      {errors.email && <p className="error-text">{errors.email}</p>}
                    </div>
                    <div className="form-group">
                      <label>Employment Date</label>
                      <input
                        name="employmentDate"
                        type="date"
                        value={formData.employmentDate}
                        onChange={handleChange}
                      />
                      {errors.employmentDate && <p className="error-text">{errors.employmentDate}</p>}
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select name="status" value={formData.status} onChange={handleChange}>
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Work Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Performance Score (%)</label>
                      <input
                        name="performanceScore"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.performanceScore}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Workload</label>
                      <input
                        name="workload"
                        type="number"
                        min="0"
                        value={formData.workload}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Assigned Tasks</label>
                      <input
                        name="assignedTasks"
                        type="number"
                        min="0"
                        value={formData.assignedTasks}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group photo-upload-group">
                      <label>Villages Covered</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                        {villages.map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => handleVillageToggle(v)}
                            style={{
                              padding: "0.3rem 0.6rem",
                              borderRadius: "999px",
                              border: "1px solid var(--gov-border)",
                              background: formData.villagesCovered.includes(v) ? "#006b3c" : "#fff",
                              color: formData.villagesCovered.includes(v) ? "#fff" : "#334155",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              transition: "all 150ms ease",
                            }}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group photo-upload-group">
                      <label>Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Short professional bio..."
                        rows={3}
                        style={{
                          width: "100%",
                          border: "1px solid var(--gov-border)",
                          borderRadius: "0.6rem",
                          padding: "0.5rem 0.6rem",
                          fontSize: "0.85rem",
                          fontFamily: "inherit",
                          resize: "vertical",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="gov-btn gov-btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="gov-btn gov-btn-primary">
                  {isEditing ? "Update Staff" : "Save Staff"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default StaffModal;
