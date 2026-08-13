import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Paperclip } from "lucide-react";

const INITIAL_STATE = {
  projectName: "",
  projectCode: "",
  category: "",
  ward: "",
  location: "",
  description: "",
  contractor: "",
  budget: "",
  fundingSource: "",
  startDate: "",
  expectedCompletion: "",
  priority: "Medium",
  projectManager: "",
  status: "Planning",
  financialYear: "",
};

function ProjectModal({
  isOpen,
  onClose,
  onSave,
  project,
  categories,
  statuses,
  priorities,
  wards,
  contractors,
  fundingSources,
  financialYears,
  projectManagers,
}) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [documentFiles, setDocumentFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const documentInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const isEditing = Boolean(project);

  useEffect(() => {
    if (project) {
      setFormData({
        projectName: project.projectName || "",
        projectCode: project.projectCode || "",
        category: project.category || "",
        ward: project.ward || "",
        location: project.location || "",
        description: project.description || "",
        contractor: project.contractor || "",
        budget: project.budget || "",
        fundingSource: project.fundingSource || "",
        startDate: project.startDate || "",
        expectedCompletion: project.expectedCompletion || "",
        priority: project.priority || "Medium",
        projectManager: project.projectManager || "",
        status: project.status || "Planning",
        financialYear: project.financialYear || "",
      });
    } else {
      setFormData({
        ...INITIAL_STATE,
        projectCode: generateProjectCode(),
      });
    }
    setErrors({});
    setDocumentFiles([]);
    setImageFiles([]);
  }, [project, isOpen]);

  const generateProjectCode = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(100 + Math.random() * 900);
    return `DEV-${year}-${random}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    setDocumentFiles((prev) => [...prev, ...files]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const removeDocument = (index) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.projectName.trim()) newErrors.projectName = "Project name is required";
    if (!formData.projectCode.trim()) newErrors.projectCode = "Project code is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.ward) newErrors.ward = "Ward is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.contractor) newErrors.contractor = "Contractor is required";
    if (!formData.budget) newErrors.budget = "Budget is required";
    else if (isNaN(Number(formData.budget)) || Number(formData.budget) <= 0) newErrors.budget = "Enter a valid budget amount";
    if (!formData.fundingSource) newErrors.fundingSource = "Funding source is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.expectedCompletion) newErrors.expectedCompletion = "Expected completion is required";
    if (!formData.projectManager) newErrors.projectManager = "Project manager is required";
    if (!formData.financialYear) newErrors.financialYear = "Financial year is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const projectData = {
      ...formData,
      budget: Number(formData.budget),
      id: project ? project.id : Date.now(),
      amountSpent: project ? project.amountSpent : 0,
      progress: project ? project.progress : 0,
      milestones: project?.milestones || [],
      progressUpdates: project?.progressUpdates || [],
      budgetUpdates: project?.budgetUpdates || [],
      documents: project?.documents || documentFiles.map((f) => f.name),
      images: project?.images || imageFiles.map((f) => URL.createObjectURL(f)),
      activityTimeline: project?.activityTimeline || [
        { date: new Date().toISOString().split("T")[0], action: "Project registered in the system", by: formData.projectManager },
      ],
      comments: project?.comments || [],
    };

    onSave(projectData);
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
            style={{ maxWidth: "820px", maxHeight: "90vh" }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="modal-header">
              <h2>{isEditing ? "Edit Project" : "Add New Project"}</h2>
              <button className="modal-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-section">
                  <h3>Project Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Project Name</label>
                      <input
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleChange}
                        placeholder="e.g. Kangemi Road Tarmacking"
                      />
                      {errors.projectName && <p className="error-text">{errors.projectName}</p>}
                    </div>
                    <div className="form-group">
                      <label>Project Code</label>
                      <input
                        name="projectCode"
                        value={formData.projectCode}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        placeholder="Auto-generated"
                      />
                      {errors.projectCode && <p className="error-text">{errors.projectCode}</p>}
                    </div>
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
                      <label>Ward</label>
                      <select name="ward" value={formData.ward} onChange={handleChange}>
                        <option value="">Select Ward</option>
                        {wards.map((w) => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                      {errors.ward && <p className="error-text">{errors.ward}</p>}
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Specific project location"
                      />
                      {errors.location && <p className="error-text">{errors.location}</p>}
                    </div>
                    <div className="form-group">
                      <label>Financial Year</label>
                      <select name="financialYear" value={formData.financialYear} onChange={handleChange}>
                        <option value="">Select Year</option>
                        {financialYears.map((fy) => (
                          <option key={fy} value={fy}>{fy}</option>
                        ))}
                      </select>
                      {errors.financialYear && <p className="error-text">{errors.financialYear}</p>}
                    </div>
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the project scope, objectives and expected impact..."
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
                      {errors.description && <p className="error-text">{errors.description}</p>}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Contract & Budget</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Contractor</label>
                      <select name="contractor" value={formData.contractor} onChange={handleChange}>
                        <option value="">Select Contractor</option>
                        {contractors.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {errors.contractor && <p className="error-text">{errors.contractor}</p>}
                    </div>
                    <div className="form-group">
                      <label>Budget Allocated (KES)</label>
                      <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="e.g. 50000000"
                        min="0"
                      />
                      {errors.budget && <p className="error-text">{errors.budget}</p>}
                    </div>
                    <div className="form-group">
                      <label>Funding Source</label>
                      <select name="fundingSource" value={formData.fundingSource} onChange={handleChange}>
                        <option value="">Select Source</option>
                        {fundingSources.map((fs) => (
                          <option key={fs} value={fs}>{fs}</option>
                        ))}
                      </select>
                      {errors.fundingSource && <p className="error-text">{errors.fundingSource}</p>}
                    </div>
                    <div className="form-group">
                      <label>Priority</label>
                      <select name="priority" value={formData.priority} onChange={handleChange}>
                        {priorities.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Timeline & Management</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                      />
                      {errors.startDate && <p className="error-text">{errors.startDate}</p>}
                    </div>
                    <div className="form-group">
                      <label>Expected Completion Date</label>
                      <input
                        type="date"
                        name="expectedCompletion"
                        value={formData.expectedCompletion}
                        onChange={handleChange}
                      />
                      {errors.expectedCompletion && <p className="error-text">{errors.expectedCompletion}</p>}
                    </div>
                    <div className="form-group">
                      <label>Project Manager</label>
                      <select name="projectManager" value={formData.projectManager} onChange={handleChange}>
                        <option value="">Select Manager</option>
                        {projectManagers.map((pm) => (
                          <option key={pm} value={pm}>{pm}</option>
                        ))}
                      </select>
                      {errors.projectManager && <p className="error-text">{errors.projectManager}</p>}
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
                  <h3>Supporting Documents</h3>
                  <div className="form-grid">
                    <div className="form-group photo-upload-group">
                      <label>Project Images</label>
                      <div className="photo-upload" onClick={() => imageInputRef.current?.click()}>
                        <div className="photo-upload-placeholder">
                          <Upload size={24} />
                          <span>Click to upload project images</span>
                        </div>
                      </div>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                      />
                      {imageFiles.length > 0 && (
                        <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {imageFiles.map((file, index) => (
                            <span key={index} style={{
                              display: "inline-flex", alignItems: "center", gap: "0.3rem",
                              background: "#f1f5f9", padding: "0.2rem 0.5rem", borderRadius: "0.4rem",
                              fontSize: "0.75rem",
                            }}>
                              {file.name}
                              <button type="button" onClick={() => removeImage(index)} style={{ border: 0, background: "transparent", cursor: "pointer", color: "#b91c1c", fontSize: "0.8rem" }}>×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="form-group photo-upload-group">
                      <label>Documents (PDF/Word)</label>
                      <div className="photo-upload" onClick={() => documentInputRef.current?.click()}>
                        <div className="photo-upload-placeholder">
                          <Paperclip size={24} />
                          <span>Click to attach documents</span>
                        </div>
                      </div>
                      <input
                        ref={documentInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        multiple
                        onChange={handleDocumentChange}
                        style={{ display: "none" }}
                      />
                      {documentFiles.length > 0 && (
                        <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {documentFiles.map((file, index) => (
                            <span key={index} style={{
                              display: "inline-flex", alignItems: "center", gap: "0.3rem",
                              background: "#f1f5f9", padding: "0.2rem 0.5rem", borderRadius: "0.4rem",
                              fontSize: "0.75rem",
                            }}>
                              {file.name}
                              <button type="button" onClick={() => removeDocument(index)} style={{ border: 0, background: "transparent", cursor: "pointer", color: "#b91c1c", fontSize: "0.8rem" }}>×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="gov-btn gov-btn-primary">
                  {isEditing ? "Update Project" : "Save Project"}
                </button>
                <button type="button" className="gov-btn gov-btn-secondary" onClick={() => {
                  setFormData({
                    ...INITIAL_STATE,
                    projectCode: generateProjectCode(),
                  });
                  setErrors({});
                  setDocumentFiles([]);
                  setImageFiles([]);
                }}>
                  Reset
                </button>
                <button type="button" className="gov-btn gov-btn-ghost" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ProjectModal;
