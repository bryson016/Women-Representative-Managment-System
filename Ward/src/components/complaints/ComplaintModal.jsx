import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Paperclip } from "lucide-react";

const INITIAL_STATE = {
  citizenName: "",
  nationalId: "",
  phoneNumber: "",
  category: "",
  priority: "Medium",
  status: "Open",
  village: "",
  assignedOfficer: "",
  description: "",
};

function ComplaintModal({
  isOpen,
  onClose,
  onSave,
  complaint,
  categories,
  priorities,
  statuses,
  villages,
  officers,
}) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const evidenceInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const isEditing = Boolean(complaint);

  useEffect(() => {
    if (complaint) {
      setFormData({
        citizenName: complaint.citizenName || "",
        nationalId: complaint.nationalId || "",
        phoneNumber: complaint.phoneNumber || "",
        category: complaint.category || "",
        priority: complaint.priority || "Medium",
        status: complaint.status || "Open",
        village: complaint.village || "",
        assignedOfficer: complaint.assignedOfficer || "",
        description: complaint.description || "",
      });
    } else {
      setFormData(INITIAL_STATE);
    }
    setErrors({});
    setEvidenceFiles([]);
    setAttachmentFiles([]);
  }, [complaint, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleEvidenceChange = (e) => {
    const files = Array.from(e.target.files);
    setEvidenceFiles((prev) => [...prev, ...files]);
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachmentFiles((prev) => [...prev, ...files]);
  };

  const removeEvidence = (index) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAttachment = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.citizenName.trim()) newErrors.citizenName = "Citizen name is required";
    if (!formData.nationalId.trim()) newErrors.nationalId = "National ID is required";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.village) newErrors.village = "Village is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateComplaintId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `CMP-${year}-${random}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const complaintData = {
      ...formData,
      id: complaint ? complaint.id : generateComplaintId(),
      dateReported: complaint ? complaint.dateReported : new Date().toISOString().split("T")[0],
      lastUpdated: new Date().toISOString().split("T")[0],
      evidenceImages: evidenceFiles.map((f) => URL.createObjectURL(f)),
      attachments: attachmentFiles.map((f) => f.name),
      officerNotes: complaint?.officerNotes || "",
      resolutionNotes: complaint?.resolutionNotes || "",
      communicationHistory: complaint?.communicationHistory || [
        { date: new Date().toISOString().split("T")[0], action: "Complaint filed by citizen", by: formData.citizenName },
      ],
    };

    onSave(complaintData);
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
              <h2>{isEditing ? "Edit Complaint" : "Register Complaint"}</h2>
              <button className="modal-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-section">
                  <h3>Citizen Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Citizen Name</label>
                      <input
                        name="citizenName"
                        value={formData.citizenName}
                        onChange={handleChange}
                        placeholder="Full name of complainant"
                      />
                      {errors.citizenName && <p className="error-text">{errors.citizenName}</p>}
                    </div>
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
                      <label>Village</label>
                      <select name="village" value={formData.village} onChange={handleChange}>
                        <option value="">Select Village</option>
                        {villages.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      {errors.village && <p className="error-text">{errors.village}</p>}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Complaint Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Category</label>
                      <select name="category" value={formData.category} onChange={handleChange}>
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {errors.category && <p className="error-text">{errors.category}</p>}
                    </div>
                    <div className="form-group">
                      <label>Priority</label>
                      <select name="priority" value={formData.priority} onChange={handleChange}>
                        {priorities.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select name="status" value={formData.status} onChange={handleChange}>
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Assigned Officer</label>
                      <select name="assignedOfficer" value={formData.assignedOfficer} onChange={handleChange}>
                        <option value="">Unassigned</option>
                        {officers.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the complaint in detail..."
                        rows={4}
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
                      {errors.description && <p className="error-text">{errors.description}</p>}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Evidence & Attachments</h3>
                  <div className="form-grid">
                    <div className="form-group photo-upload-group">
                      <label>Evidence Images</label>
                      <div className="photo-upload" onClick={() => evidenceInputRef.current?.click()}>
                        <div className="photo-upload-placeholder">
                          <Upload size={24} />
                          <span>Click to upload images</span>
                        </div>
                      </div>
                      <input
                        ref={evidenceInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleEvidenceChange}
                        style={{ display: "none" }}
                      />
                      {evidenceFiles.length > 0 && (
                        <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {evidenceFiles.map((file, index) => (
                            <span key={index} style={{
                              display: "inline-flex", alignItems: "center", gap: "0.3rem",
                              background: "#f1f5f9", padding: "0.2rem 0.5rem", borderRadius: "0.4rem",
                              fontSize: "0.75rem",
                            }}>
                              {file.name}
                              <button type="button" onClick={() => removeEvidence(index)} style={{ border: 0, background: "transparent", cursor: "pointer", color: "#b91c1c", fontSize: "0.8rem" }}>×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="form-group photo-upload-group">
                      <label>File Attachments (PDF)</label>
                      <div className="photo-upload" onClick={() => attachmentInputRef.current?.click()}>
                        <div className="photo-upload-placeholder">
                          <Paperclip size={24} />
                          <span>Click to attach files</span>
                        </div>
                      </div>
                      <input
                        ref={attachmentInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        multiple
                        onChange={handleAttachmentChange}
                        style={{ display: "none" }}
                      />
                      {attachmentFiles.length > 0 && (
                        <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {attachmentFiles.map((file, index) => (
                            <span key={index} style={{
                              display: "inline-flex", alignItems: "center", gap: "0.3rem",
                              background: "#f1f5f9", padding: "0.2rem 0.5rem", borderRadius: "0.4rem",
                              fontSize: "0.75rem",
                            }}>
                              {file.name}
                              <button type="button" onClick={() => removeAttachment(index)} style={{ border: 0, background: "transparent", cursor: "pointer", color: "#b91c1c", fontSize: "0.8rem" }}>×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="gov-btn gov-btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="gov-btn gov-btn-primary">
                  {isEditing ? "Update Complaint" : "Save Complaint"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ComplaintModal;
