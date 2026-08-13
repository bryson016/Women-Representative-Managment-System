import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, User } from "lucide-react";

const INITIAL_STATE = {
  nationalId: "",
  firstName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  phoneNumber: "",
  email: "",
  occupation: "",
  village: "",
  subLocation: "",
  ward: "Westlands",
  physicalAddress: "",
  emergencyContact: "",
  status: "Active",
};

function CitizenModal({ isOpen, onClose, onSave, citizen, villages }) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const isEditing = Boolean(citizen);

  useEffect(() => {
    if (citizen) {
      setFormData({
        nationalId: citizen.nationalId || "",
        firstName: citizen.firstName || "",
        lastName: citizen.lastName || "",
        gender: citizen.gender || "",
        dateOfBirth: citizen.dateOfBirth || "",
        phoneNumber: citizen.phoneNumber || "",
        email: citizen.email || "",
        occupation: citizen.occupation || "",
        village: citizen.village || "",
        subLocation: citizen.subLocation || "",
        ward: citizen.ward || "Westlands",
        physicalAddress: citizen.physicalAddress || "",
        emergencyContact: citizen.emergencyContact || "",
        status: citizen.status || "Active",
      });
      setPhotoPreview(citizen.photoUrl || null);
    } else {
      setFormData(INITIAL_STATE);
      setPhotoPreview(null);
    }
    setErrors({});
  }, [citizen, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nationalId.trim()) newErrors.nationalId = "National ID is required";
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.village) newErrors.village = "Village is required";
    if (!formData.occupation.trim()) newErrors.occupation = "Occupation is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const citizenData = {
      ...formData,
      id: citizen ? citizen.id : Date.now(),
      photoUrl: photoPreview,
      registrationDate: citizen ? citizen.registrationDate : new Date().toISOString().split("T")[0],
    };

    onSave(citizenData);
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
              <h2>{isEditing ? "Edit Citizen" : "Register Citizen"}</h2>
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
                      <label>National ID</label>
                      <input
                        name="nationalId"
                        value={formData.nationalId}
                        onChange={handleChange}
                        placeholder="e.g. ID-23456789"
                      />
                      {errors.nationalId && <p className="error-text">{errors.nationalId}</p>}
                    </div>
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter first name"
                      />
                      {errors.firstName && <p className="error-text">{errors.firstName}</p>}
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter last name"
                      />
                      {errors.lastName && <p className="error-text">{errors.lastName}</p>}
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      {errors.gender && <p className="error-text">{errors.gender}</p>}
                    </div>
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                      {errors.dateOfBirth && <p className="error-text">{errors.dateOfBirth}</p>}
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="+254 7XX XXX XXX"
                      />
                      {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Occupation</label>
                      <input
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        placeholder="Enter occupation"
                      />
                      {errors.occupation && <p className="error-text">{errors.occupation}</p>}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Location Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Village</label>
                      <select name="village" value={formData.village} onChange={handleChange}>
                        <option value="">Select Village</option>
                        {villages.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      {errors.village && <p className="error-text">{errors.village}</p>}
                    </div>
                    <div className="form-group">
                      <label>Sub-location</label>
                      <input
                        name="subLocation"
                        value={formData.subLocation}
                        onChange={handleChange}
                        placeholder="Enter sub-location"
                      />
                    </div>
                    <div className="form-group">
                      <label>Ward</label>
                      <input
                        name="ward"
                        value={formData.ward}
                        onChange={handleChange}
                        placeholder="Ward name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Physical Address</label>
                      <input
                        name="physicalAddress"
                        value={formData.physicalAddress}
                        onChange={handleChange}
                        placeholder="Plot/House number, Street"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Contact & Status</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Emergency Contact</label>
                      <input
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        placeholder="+254 7XX XXX XXX"
                      />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="form-group photo-upload-group">
                      <label>Photo Upload</label>
                      <div className="photo-upload" onClick={() => fileInputRef.current?.click()}>
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="photo-preview" />
                        ) : (
                          <div className="photo-upload-placeholder">
                            <Upload size={24} />
                            <span>Click to upload photo</span>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: "none" }}
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
                  {isEditing ? "Update Citizen" : "Save Citizen"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default CitizenModal;
