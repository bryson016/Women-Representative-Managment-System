import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Users,
  Wallet,
  FileText,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Send,
  Save,
} from "lucide-react";
import CitizenLayout from "../../components/citizens/CitizenLayout";
import { getCitizenProfile, submitBursaryApplication } from "../../services/citizenApi";
import { uploadBursaryDocument } from "../../services/bursaryApi";

const INSTITUTION_TYPES = [
  "Secondary School",
  "College",
  "University",
  "TVET",
  "Other",
];

const DOCUMENT_TYPES = [
  { value: "National_ID", label: "National ID / Birth Certificate" },
  { value: "Admission_Letter", label: "Admission Letter" },
  { value: "Fee_Structure", label: "School Fee Structure" },
  { value: "Academic_Results", label: "Latest Academic Results" },
  { value: "Parent_ID", label: "Parent / Guardian ID" },
  { value: "Other", label: "Other Supporting Document" },
];

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function CitizenBursaryForm() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("bursary");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    // Applicant
    fullName: "",
    nationalId: "",
    dateOfBirth: "",
    gender: "Male",
    phoneNumber: "",
    email: "",
    residentialAddress: "",
    county: "",
    constituency: "",
    // Education
    institutionName: "",
    institutionType: "Secondary School",
    courseOrForm: "",
    yearOfStudy: "",
    admissionNumber: "",
    academicYear: new Date().getFullYear().toString(),
    studentRegistrationNumber: "",
    // Parent/Guardian
    parentFullName: "",
    parentRelationship: "",
    parentPhone: "",
    parentOccupation: "",
    numberOfDependants: 0,
    householdMonthlyIncome: 0,
    // Financial
    totalFees: "",
    amountPaid: "0",
    amountRequested: "",
    previousBursaryReceived: "No",
    previousBursaryAmount: "0",
    otherFinancialAssistance: "",
    reasonForApplication: "",
  });

  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Calculated outstanding balance
  const outstandingBalance = useMemo(() => {
    const total = parseFloat(formData.totalFees) || 0;
    const paid = parseFloat(formData.amountPaid) || 0;
    return Math.max(0, total - paid);
  }, [formData.totalFees, formData.amountPaid]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getCitizenProfile();
        setProfile(data);
        const user = data.user;
        const citizen = data.citizen;

        setFormData((prev) => ({
          ...prev,
          fullName: user.fullName || "",
          nationalId: citizen?.nationalId || "",
          dateOfBirth: citizen?.dateOfBirth || "",
          gender: citizen?.gender || "Male",
          phoneNumber: user.phoneNumber || "",
          email: user.email || "",
          residentialAddress: citizen?.physicalAddress || "",
          ward: user.ward || "",
        }));
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  }

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      setError("Invalid file type. Allowed: PDF, JPEG, PNG, GIF, WebP, DOC, DOCX.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    // Check if we already have this document type
    const docType = e.target.dataset.docType;
    setDocuments((prev) => {
      const filtered = prev.filter((d) => d.documentType !== docType);
      return [...filtered, { documentType: docType, file, fileName: file.name, fileType: file.type, fileSize: file.size }];
    });

    // Reset input
    e.target.value = "";
    setError("");
  }

  function removeDocument(docType) {
    setDocuments((prev) => prev.filter((d) => d.documentType !== docType));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.institutionName || !formData.institutionType || !formData.academicYear) {
      setError("Please fill in all required education fields.");
      return;
    }

    if (!formData.totalFees || parseFloat(formData.totalFees) <= 0) {
      setError("Please enter a valid total fees amount.");
      return;
    }

    if (!formData.amountRequested || parseFloat(formData.amountRequested) <= 0) {
      setError("Please enter a valid amount requested.");
      return;
    }

    if (parseFloat(formData.amountRequested) > outstandingBalance) {
      setError("Amount requested cannot exceed outstanding balance.");
      return;
    }

    if (!formData.parentFullName || !formData.parentRelationship || !formData.parentPhone) {
      setError("Please fill in all parent/guardian fields.");
      return;
    }

    if (!formData.reasonForApplication) {
      setError("Please provide a reason for your application.");
      return;
    }

    if (!declarationAccepted) {
      setError("You must accept the declaration before submitting.");
      return;
    }

    setShowConfirmDialog(true);
  }

  async function confirmSubmit() {
    setShowConfirmDialog(false);
    setSubmitting(true);
    setError("");

    try {
      // Submit application
      const submitData = {
        ...formData,
        totalFees: parseFloat(formData.totalFees),
        amountPaid: parseFloat(formData.amountPaid) || 0,
        amountRequested: parseFloat(formData.amountRequested),
        householdMonthlyIncome: parseFloat(formData.householdMonthlyIncome) || 0,
        numberOfDependants: parseInt(formData.numberOfDependants) || 0,
        previousBursaryAmount: parseFloat(formData.previousBursaryAmount) || 0,
      };

      const result = await submitBursaryApplication(submitData);

      // Upload documents
      if (documents.length > 0 && result.applicationId) {
        for (const doc of documents) {
          const docFormData = new FormData();
          docFormData.append("file", doc.file);
          docFormData.append("documentType", doc.documentType);

          try {
            await uploadBursaryDocument(result.applicationId, docFormData);
          } catch (docError) {
            console.error("Error uploading document:", doc);
          }
        }
      }

      setSuccess({
        applicationNumber: result.applicationNumber,
        applicationId: result.applicationId,
      });
    } catch (err) {
      console.error("Error submitting application:", err);
      setError(err.response?.data?.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <CitizenLayout activeItem={activeItem} onItemClick={setActiveItem} breadcrumb={["Bursary", "Application Form"]}>
        <div className="loading-screen">
          <p>Loading your profile...</p>
        </div>
      </CitizenLayout>
    );
  }

  if (success) {
    return (
      <CitizenLayout activeItem={activeItem} onItemClick={setActiveItem} breadcrumb={["Bursary", "Application Submitted"]}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", padding: "40px 20px", maxWidth: "600px", margin: "0 auto" }}
        >
          <CheckCircle size={64} style={{ color: "#10b981", marginBottom: "20px" }} />
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>Bursary Application Submitted Successfully</h2>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>
            Your application has been received and is being processed.
          </p>

          <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", marginBottom: "24px" }}>
            <div style={{ marginBottom: "12px" }}>
              <span style={{ color: "#64748b", fontSize: "14px" }}>Application Number:</span>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#7c3aed", letterSpacing: "1px" }}>{success.applicationNumber}</div>
            </div>
            <div>
              <span style={{ color: "#64748b", fontSize: "14px" }}>Status:</span>
              <div style={{ marginTop: "4px" }}>
                <span className="status-pill submitted" style={{ padding: "4px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: 500, background: "#dbeafe", color: "#1d4ed8" }}>
                  Submitted
                </span>
              </div>
            </div>
          </div>

          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>
            You will receive notifications as your application progresses through the review process.
            You can track your application status in "My Bursary Applications".
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button className="gov-btn gov-btn-primary" onClick={() => navigate("/citizen/bursary/tracking")}>
              View My Applications
            </button>
            <button className="gov-btn gov-btn-secondary" onClick={() => navigate("/citizen/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </CitizenLayout>
    );
  }

  return (
    <CitizenLayout activeItem={activeItem} onItemClick={setActiveItem} breadcrumb={["Bursary", "New Application"]}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {error && (
          <div style={{ background: "#fef2f2", color: "#ef4444", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Applicant Information */}
          <section className="panel-card" style={{ marginBottom: "24px" }}>
            <div className="card-title-row">
              <h3><User size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Applicant Information</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginTop: "16px" }}>
              <div className="form-group">
                <label>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} readOnly style={{ background: "#f8fafc" }} />
              </div>
              <div className="form-group">
                <label>National ID Number <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" name="nationalId" value={formData.nationalId} onChange={handleChange} readOnly style={{ background: "#f8fafc" }} />
              </div>
              <div className="form-group">
                <label>Date of Birth <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} readOnly style={{ background: "#f8fafc" }} />
              </div>
              <div className="form-group">
                <label>Gender <span style={{ color: "#ef4444" }}>*</span></label>
                <select name="gender" value={formData.gender} onChange={handleChange} disabled style={{ background: "#f8fafc" }}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} readOnly style={{ background: "#f8fafc" }} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} readOnly style={{ background: "#f8fafc" }} />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Residential Address <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} readOnly style={{ background: "#f8fafc" }} />
              </div>
              <div className="form-group">
                <label>County</label>
                <input type="text" name="county" value={formData.county} onChange={handleChange} placeholder="e.g., Nairobi" />
              </div>
              <div className="form-group">
                <label>Constituency</label>
                <input type="text" name="constituency" value={formData.constituency} onChange={handleChange} placeholder="e.g., Westlands" />
              </div>
            </div>
          </section>

          {/* Education Information */}
          <section className="panel-card" style={{ marginBottom: "24px" }}>
            <div className="card-title-row">
              <h3><GraduationCap size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Education Information</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginTop: "16px" }}>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Institution Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" name="institutionName" value={formData.institutionName} onChange={handleChange} placeholder="e.g., Nairobi High School" required />
              </div>
              <div className="form-group">
                <label>Institution Type <span style={{ color: "#ef4444" }}>*</span></label>
                <select name="institutionType" value={formData.institutionType} onChange={handleChange} required>
                  {INSTITUTION_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Course / Form / Year of Study</label>
                <input type="text" name="courseOrForm" value={formData.courseOrForm} onChange={handleChange} placeholder="e.g., Form 3, Year 2" />
              </div>
              <div className="form-group">
                <label>Admission / Registration Number</label>
                <input type="text" name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} placeholder="e.g., ADM-2024-001" />
              </div>
              <div className="form-group">
                <label>Academic Year <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" name="academicYear" value={formData.academicYear} onChange={handleChange} placeholder="e.g., 2026" required />
              </div>
              <div className="form-group">
                <label>Student Registration Number</label>
                <input type="text" name="studentRegistrationNumber" value={formData.studentRegistrationNumber} onChange={handleChange} placeholder="e.g., SRN-12345" />
              </div>
            </div>
          </section>

          {/* Parent / Guardian Information */}
          <section className="panel-card" style={{ marginBottom: "24px" }}>
            <div className="card-title-row">
              <h3><Users size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Parent / Guardian Information</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginTop: "16px" }}>
              <div className="form-group">
                <label>Parent / Guardian Full Name <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" name="parentFullName" value={formData.parentFullName} onChange={handleChange} placeholder="Enter full name" required />
              </div>
              <div className="form-group">
                <label>Relationship to Applicant <span style={{ color: "#ef4444" }}>*</span></label>
                <select name="parentRelationship" value={formData.parentRelationship} onChange={handleChange} required>
                  <option value="">Select relationship</option>
                  <option value="Parent">Parent</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} placeholder="e.g., +254 712 345 678" required />
              </div>
              <div className="form-group">
                <label>Occupation</label>
                <input type="text" name="parentOccupation" value={formData.parentOccupation} onChange={handleChange} placeholder="e.g., Farmer, Teacher" />
              </div>
              <div className="form-group">
                <label>Number of Dependants</label>
                <input type="number" name="numberOfDependants" value={formData.numberOfDependants} onChange={handleChange} min="0" />
              </div>
              <div className="form-group">
                <label>Household Monthly Income (KES)</label>
                <input type="number" name="householdMonthlyIncome" value={formData.householdMonthlyIncome} onChange={handleChange} min="0" step="0.01" />
              </div>
            </div>
          </section>

          {/* Financial Information */}
          <section className="panel-card" style={{ marginBottom: "24px" }}>
            <div className="card-title-row">
              <h3><Wallet size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Financial Information</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginTop: "16px" }}>
              <div className="form-group">
                <label>Total School Fees (KES) <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="number" name="totalFees" value={formData.totalFees} onChange={handleChange} min="0" step="0.01" placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label>Amount Already Paid (KES)</label>
                <input type="number" name="amountPaid" value={formData.amountPaid} onChange={handleChange} min="0" step="0.01" placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Outstanding Fee Balance (KES)</label>
                <input type="text" value={outstandingBalance.toLocaleString()} readOnly style={{ background: "#f8fafc", fontWeight: 600, color: "#7c3aed" }} />
              </div>
              <div className="form-group">
                <label>Amount Requested (KES) <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="number" name="amountRequested" value={formData.amountRequested} onChange={handleChange} min="0" max={outstandingBalance} step="0.01" placeholder="0.00" required />
                {parseFloat(formData.amountRequested) > outstandingBalance && (
                  <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>Cannot exceed outstanding balance.</p>
                )}
              </div>
              <div className="form-group">
                <label>Previous Bursary Received</label>
                <select name="previousBursaryReceived" value={formData.previousBursaryReceived} onChange={handleChange}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              {formData.previousBursaryReceived === "Yes" && (
                <div className="form-group">
                  <label>Previous Bursary Amount (KES)</label>
                  <input type="number" name="previousBursaryAmount" value={formData.previousBursaryAmount} onChange={handleChange} min="0" step="0.01" />
                </div>
              )}
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Other Financial Assistance</label>
                <textarea name="otherFinancialAssistance" value={formData.otherFinancialAssistance} onChange={handleChange} rows={2} placeholder="Describe any other financial support you receive..." />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label>Reason for Bursary Application <span style={{ color: "#ef4444" }}>*</span></label>
                <textarea name="reasonForApplication" value={formData.reasonForApplication} onChange={handleChange} rows={4} placeholder="Explain why you need this bursary and how it will help you..." required />
              </div>
            </div>
          </section>

          {/* Supporting Documents */}
          <section className="panel-card" style={{ marginBottom: "24px" }}>
            <div className="card-title-row">
              <h3><FileText size={18} style={{ marginRight: "8px", verticalAlign: "middle" }} /> Supporting Documents</h3>
            </div>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "8px", marginBottom: "16px" }}>
              Upload relevant documents. Accepted formats: PDF, JPEG, PNG, GIF, WebP, DOC, DOCX. Max size: 10MB per file.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
              {DOCUMENT_TYPES.map((docType) => {
                const existingDoc = documents.find((d) => d.documentType === docType.value);
                return (
                  <div key={docType.value} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px" }}>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
                      {docType.label}
                    </label>
                    {existingDoc ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", background: "#f0fdf4", borderRadius: "6px" }}>
                        <CheckCircle size={16} style={{ color: "#10b981" }} />
                        <span style={{ fontSize: "13px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{existingDoc.fileName}</span>
                        <button type="button" className="icon-btn soft" onClick={() => removeDocument(docType.value)}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label style={{ display: "block", cursor: "pointer" }}>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
                          onChange={handleFileSelect}
                          data-doc-type={docType.value}
                          style={{ display: "none" }}
                        />
                        <div style={{ border: "2px dashed #e2e8f0", borderRadius: "8px", padding: "20px", textAlign: "center", cursor: "pointer" }}>
                          <Upload size={24} style={{ color: "#7c3aed", marginBottom: "8px" }} />
                          <p style={{ fontSize: "13px", color: "#64748b" }}>Click to upload</p>
                        </div>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Declaration */}
          <section className="panel-card" style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <input
                type="checkbox"
                id="declaration"
                checked={declarationAccepted}
                onChange={(e) => setDeclarationAccepted(e.target.checked)}
                style={{ marginTop: "4px" }}
              />
              <label htmlFor="declaration" style={{ fontSize: "14px", color: "#475569", cursor: "pointer" }}>
                I declare that the information provided in this application is true and accurate to the best of my knowledge. I understand that any false information may lead to disqualification.
              </label>
            </div>
          </section>

          {/* Submit Buttons */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button type="button" className="gov-btn gov-btn-secondary" onClick={() => navigate("/citizen/dashboard")}>
              Cancel
            </button>
            <button type="submit" className="gov-btn gov-btn-primary" disabled={submitting || !declarationAccepted}>
              {submitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="modal-overlay" onClick={() => setShowConfirmDialog(false)}>
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "450px" }}
            >
              <div className="modal-header">
                <h2>Confirm Submission</h2>
              </div>
              <div className="modal-body">
                <p style={{ marginBottom: "16px" }}>Are you sure you want to submit this bursary application? Once submitted, it will be reviewed by the ward administration.</p>
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "14px" }}>
                  <div><strong>Institution:</strong> {formData.institutionName}</div>
                  <div><strong>Amount Requested:</strong> KES {parseFloat(formData.amountRequested || 0).toLocaleString()}</div>
                  <div><strong>Academic Year:</strong> {formData.academicYear}</div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="gov-btn gov-btn-secondary" onClick={() => setShowConfirmDialog(false)}>
                  Cancel
                </button>
                <button className="gov-btn gov-btn-primary" onClick={confirmSubmit}>
                  Confirm & Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </CitizenLayout>
  );
}

export default CitizenBursaryForm;
