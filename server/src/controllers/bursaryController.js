const pool = require("../config/db");

// ============================================================
// BURSARY APPLICATION STATUS ENUM
// ============================================================
const BURSARY_STATUS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under_Review",
  VERIFIED: "Verified",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  DISBURSED: "Disbursed",
};

const INSTITUTION_TYPES = [
  "Secondary School",
  "College",
  "University",
  "TVET",
  "Other",
];

const DOCUMENT_TYPES = [
  "National_ID",
  "Birth_Certificate",
  "Admission_Letter",
  "Fee_Structure",
  "Academic_Results",
  "Parent_ID",
  "Other",
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function generateApplicationNumber() {
  const year = new Date().getFullYear();
  const prefix = `BUR-${year}`;
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS count FROM bursary_applications WHERE YEAR(created_at) = ?`,
    [year]
  );
  const count = (countRows[0]?.count || 0) + 1;
  return `${prefix}-${String(count).padStart(5, "0")}`;
}

async function generateBeneficiaryNumber() {
  const year = new Date().getFullYear();
  const prefix = `BEN-${year}`;
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS count FROM bursary_beneficiaries WHERE YEAR(created_at) = ?`,
    [year]
  );
  const count = (countRows[0]?.count || 0) + 1;
  return `${prefix}-${String(count).padStart(5, "0")}`;
}

async function beneficiaryExistsForApplication(applicationId) {
  const [rows] = await pool.execute(
    `SELECT id FROM bursary_beneficiaries WHERE application_id = ? LIMIT 1`,
    [applicationId]
  );
  return rows.length > 0;
}

function formatBursaryApplication(row) {
  return {
    id: row.id,
    applicationNumber: row.application_number,
    citizenId: row.citizen_id,
    userId: row.user_id,
    ward: row.ward,
    // Applicant
    fullName: row.full_name,
    nationalId: row.national_id,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    phoneNumber: row.phone_number,
    email: row.email,
    residentialAddress: row.residential_address,
    county: row.county,
    constituency: row.constituency,
    // Education
    institutionName: row.institution_name,
    institutionType: row.institution_type,
    courseOrForm: row.course_or_form,
    yearOfStudy: row.year_of_study,
    admissionNumber: row.admission_number,
    academicYear: row.academic_year,
    studentRegistrationNumber: row.student_registration_number,
    // Parent/Guardian
    parentFullName: row.parent_full_name,
    parentRelationship: row.parent_relationship,
    parentPhone: row.parent_phone,
    parentOccupation: row.parent_occupation,
    numberOfDependants: row.number_of_dependants,
    householdMonthlyIncome: parseFloat(row.household_monthly_income || 0),
    // Financial
    totalFees: parseFloat(row.total_fees || 0),
    amountPaid: parseFloat(row.amount_paid || 0),
    outstandingBalance: parseFloat(row.outstanding_balance || 0),
    amountRequested: parseFloat(row.amount_requested || 0),
    approvedAmount: row.approved_amount ? parseFloat(row.approved_amount) : null,
    previousBursaryReceived: row.previous_bursary_received,
    previousBursaryAmount: row.previous_bursary_amount ? parseFloat(row.previous_bursary_amount) : null,
    otherFinancialAssistance: row.other_financial_assistance,
    reasonForApplication: row.reason_for_application,
    // Status
    status: row.status,
    rejectionReason: row.rejection_reason,
    reviewComments: row.review_comments,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    verifiedAt: row.verified_at,
    approvedAt: row.approved_at,
    disbursedAt: row.disbursed_at,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function addHistoryEntry(applicationId, action, previousStatus, newStatus, performedBy, performedByName, notes) {
  await pool.execute(
    `INSERT INTO bursary_application_history (application_id, action, previous_status, new_status, performed_by, performed_by_name, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [applicationId, action, previousStatus, newStatus, performedBy, performedByName, notes]
  );
}

async function createNotification(userId, title, message, relatedId, relatedType) {
  await pool.execute(
    `INSERT INTO notifications (user_id, type, title, message, related_id, related_type, created_at)
     VALUES (?, 'Bursary_Update', ?, ?, ?, 'bursary_application', NOW())`,
    [userId, title, message, relatedId]
  );
}

// Mask a national ID for list views, e.g. "12345678" -> "12****78"
function maskNationalId(nationalId) {
  if (!nationalId) return null;
  const value = String(nationalId);
  if (value.length <= 4) return "****";
  return `${value.slice(0, 2)}${"*".repeat(Math.max(value.length - 4, 4))}${value.slice(-2)}`;
}

// Build a WHERE clause + params for beneficiary filtering (shared by list/export)
function buildBeneficiaryWhere(req) {
  const {
    search = "",
    status = "",
    program = "",
    institutionType = "",
    county = "",
    ward = "",
    academicYear = "",
    dateFrom = "",
    dateTo = "",
  } = req.query;

  const userRole = req.user?.role?.toLowerCase();
  const userWard = req.user?.ward;

  let whereClause = "WHERE 1=1";
  const params = [];

  // Role-based scoping: non-admin staff only see their own ward
  if (userRole !== "admin" && userRole !== "super_admin" && userWard) {
    whereClause += " AND b.ward = ?";
    params.push(userWard);
  }

  if (search) {
    whereClause += " AND (b.full_name LIKE ? OR b.national_id LIKE ? OR b.beneficiary_number LIKE ? OR b.institution_name LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (status) {
    const statusList = status.split(",").map((s) => s.trim());
    const placeholders = statusList.map(() => "?").join(", ");
    whereClause += ` AND b.status IN (${placeholders})`;
    params.push(...statusList);
  }

  // "program" maps to institution type / programme category
  const programFilter = program || institutionType;
  if (programFilter) {
    whereClause += " AND b.institution_type = ?";
    params.push(programFilter);
  }

  if (county) {
    whereClause += " AND b.county = ?";
    params.push(county);
  }

  if (ward) {
    whereClause += " AND b.ward = ?";
    params.push(ward);
  }

  if (academicYear) {
    whereClause += " AND b.academic_year = ?";
    params.push(academicYear);
  }

  if (dateFrom) {
    whereClause += " AND DATE(b.created_at) >= ?";
    params.push(dateFrom);
  }

  if (dateTo) {
    whereClause += " AND DATE(b.created_at) <= ?";
    params.push(dateTo);
  }

  return { whereClause, params };
}

// ============================================================
// ADMIN: GET ALL APPLICATIONS (with filters)
// ============================================================

async function getAllApplications(req, res) {
  try {
    const {
      search = "",
      ward = "",
      institutionType = "",
      status = "",
      academicYear = "",
      page = 1,
      limit = 20,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const userRole = req.user?.role?.toLowerCase();
    const userWard = req.user?.ward;

    let whereClause = "WHERE 1=1";
    const params = [];

    // Non-admin users can only see their own applications
    if (userRole !== "admin" && userRole !== "officer" && userRole !== "staff") {
      whereClause += " AND ba.user_id = ?";
      params.push(req.user.id);
    } else if (userWard && userRole !== "admin") {
      whereClause += " AND ba.ward = ?";
      params.push(userWard);
    }

    if (search) {
      whereClause += " AND (ba.full_name LIKE ? OR ba.national_id LIKE ? OR ba.application_number LIKE ? OR ba.institution_name LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (ward) {
      whereClause += " AND ba.ward = ?";
      params.push(ward);
    }

    if (institutionType) {
      whereClause += " AND ba.institution_type = ?";
      params.push(institutionType);
    }

    if (status) {
      whereClause += " AND ba.status = ?";
      params.push(status);
    }

    if (academicYear) {
      whereClause += " AND ba.academic_year = ?";
      params.push(academicYear);
    }

    // Validate sort column
    const allowedSortColumns = ["created_at", "full_name", "amount_requested", "status", "academic_year", "application_number"];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : "created_at";
    const sortDir = sortOrder === "ASC" ? "ASC" : "DESC";

    // Get total count
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM bursary_applications ba ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    // Get paginated results
    const [rows] = await pool.execute(
      `SELECT ba.*, 
              u.full_name AS submitted_by_name,
              r.full_name AS reviewed_by_name
       FROM bursary_applications ba
       LEFT JOIN users u ON ba.user_id = u.id
       LEFT JOIN users r ON ba.reviewed_by = r.id
       ${whereClause}
       ORDER BY ba.${sortColumn} ${sortDir}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const applications = rows.map(formatBursaryApplication);

    return res.status(200).json({
      applications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all bursary applications error:", error);
    return res.status(500).json({ message: "Failed to fetch applications." });
  }
}

// ============================================================
// ADMIN: GET SINGLE APPLICATION
// ============================================================

async function getApplicationById(req, res) {
  try {
    const applicationId = req.params.id;
    const userRole = req.user?.role?.toLowerCase();

    let whereClause = "WHERE ba.id = ?";
    const params = [applicationId];

    // Non-admin users can only view their own applications
    if (userRole !== "admin" && userRole !== "officer" && userRole !== "staff") {
      whereClause += " AND ba.user_id = ?";
      params.push(req.user.id);
    }

    const [rows] = await pool.execute(
      `SELECT ba.*, 
              u.full_name AS submitted_by_name,
              r.full_name AS reviewed_by_name
       FROM bursary_applications ba
       LEFT JOIN users u ON ba.user_id = u.id
       LEFT JOIN users r ON ba.reviewed_by = r.id
       ${whereClause}
       LIMIT 1`,
      params
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Application not found." });
    }

    const application = formatBursaryApplication(rows[0]);

    // Get documents
    const [docRows] = await pool.execute(
      `SELECT * FROM bursary_application_documents WHERE application_id = ? ORDER BY uploaded_at DESC`,
      [applicationId]
    );
    application.documents = docRows.map((doc) => ({
      id: doc.id,
      documentType: doc.document_type,
      fileName: doc.file_name,
      filePath: doc.file_path,
      secureUrl: doc.secure_url,
      publicId: doc.public_id,
      fileType: doc.file_type,
      fileSize: doc.file_size,
      uploadedAt: doc.uploaded_at,
    }));

    // Get history
    const [historyRows] = await pool.execute(
      `SELECT * FROM bursary_application_history WHERE application_id = ? ORDER BY created_at DESC`,
      [applicationId]
    );
    application.history = historyRows.map((h) => ({
      id: h.id,
      action: h.action,
      previousStatus: h.previous_status,
      newStatus: h.new_status,
      performedBy: h.performed_by,
      performedByName: h.performed_by_name,
      notes: h.notes,
      createdAt: h.created_at,
    }));

    return res.status(200).json({ application });
  } catch (error) {
    console.error("Get bursary application error:", error);
    return res.status(500).json({ message: "Failed to fetch application." });
  }
}

// ============================================================
// CITIZEN: GET MY APPLICATIONS
// ============================================================

async function getMyApplications(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `SELECT * FROM bursary_applications WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    const applications = rows.map(formatBursaryApplication);

    return res.status(200).json({ applications });
  } catch (error) {
    console.error("Get my bursary applications error:", error);
    return res.status(500).json({ message: "Failed to fetch applications." });
  }
}

// ============================================================
// CITIZEN: CREATE APPLICATION
// ============================================================

async function createApplication(req, res) {
  try {
    const userId = req.user.id;

    // Get citizen info
    const [citizenRows] = await pool.execute(
      `SELECT id, first_name, last_name, national_id, phone_number, ward FROM citizens WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    let citizenId = null;
    let fullName = req.user.fullName || "";
    let nationalId = "";
    let phoneNumber = req.user.phoneNumber || "";
    let ward = req.user.ward || "Westlands";

    if (citizenRows.length > 0) {
      citizenId = citizenRows[0].id;
      fullName = `${citizenRows[0].first_name} ${citizenRows[0].last_name}`;
      nationalId = citizenRows[0].national_id;
      phoneNumber = citizenRows[0].phone_number;
      ward = citizenRows[0].ward;
    }

    const {
      // Applicant
      dateOfBirth,
      gender,
      email,
      residentialAddress,
      county,
      constituency,
      // Education
      institutionName,
      institutionType,
      courseOrForm,
      yearOfStudy,
      admissionNumber,
      academicYear,
      studentRegistrationNumber,
      // Parent/Guardian
      parentFullName,
      parentRelationship,
      parentPhone,
      parentOccupation,
      numberOfDependants,
      householdMonthlyIncome,
      // Financial
      totalFees,
      amountPaid,
      amountRequested,
      previousBursaryReceived,
      previousBursaryAmount,
      otherFinancialAssistance,
      reasonForApplication,
    } = req.body;

    // Validation
    if (!institutionName || !institutionType || !academicYear || !totalFees || !amountRequested) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!INSTITUTION_TYPES.includes(institutionType)) {
      return res.status(400).json({ message: "Invalid institution type." });
    }

    const totalFeesNum = parseFloat(totalFees);
    const amountPaidNum = parseFloat(amountPaid || 0);
    const amountRequestedNum = parseFloat(amountRequested);

    if (isNaN(totalFeesNum) || totalFeesNum <= 0) {
      return res.status(400).json({ message: "Total fees must be a positive number." });
    }

    if (isNaN(amountPaidNum) || amountPaidNum < 0) {
      return res.status(400).json({ message: "Amount paid must be a non-negative number." });
    }

    if (isNaN(amountRequestedNum) || amountRequestedNum <= 0) {
      return res.status(400).json({ message: "Amount requested must be a positive number." });
    }

    const outstandingBalance = totalFeesNum - amountPaidNum;

    if (amountRequestedNum > outstandingBalance) {
      return res.status(400).json({ message: "Amount requested cannot exceed outstanding balance." });
    }

    const applicationNumber = await generateApplicationNumber();

    const [result] = await pool.execute(
      `INSERT INTO bursary_applications 
       (application_number, citizen_id, user_id, ward, full_name, national_id, date_of_birth, gender, phone_number, email,
        residential_address, county, constituency, institution_name, institution_type, course_or_form, year_of_study,
        admission_number, academic_year, student_registration_number, parent_full_name, parent_relationship, parent_phone,
        parent_occupation, number_of_dependants, household_monthly_income, total_fees, amount_paid, outstanding_balance,
        amount_requested, previous_bursary_received, previous_bursary_amount, other_financial_assistance,
        reason_for_application, status, submitted_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', NOW(), NOW(), NOW())`,
      [
        applicationNumber,
        citizenId,
        userId,
        ward,
        fullName,
        nationalId,
        dateOfBirth || null,
        gender || "Male",
        phoneNumber,
        email || null,
        residentialAddress || null,
        county || null,
        constituency || null,
        institutionName,
        institutionType,
        courseOrForm || null,
        yearOfStudy || null,
        admissionNumber || null,
        academicYear,
        studentRegistrationNumber || null,
        parentFullName || fullName || "N/A",
        parentRelationship || "Self",
        parentPhone || phoneNumber || "N/A",
        parentOccupation || "N/A",
        parseInt(numberOfDependants) || 0,
        parseFloat(householdMonthlyIncome) || 0,
        totalFeesNum,
        amountPaidNum,
        outstandingBalance,
        amountRequestedNum,
        previousBursaryReceived || "No",
        previousBursaryAmount ? parseFloat(previousBursaryAmount) : 0,
        otherFinancialAssistance || null,
        reasonForApplication,
      ]
    );

    const applicationId = result.insertId;

    // Add history entry
    await addHistoryEntry(
      applicationId,
      "Application Submitted",
      null,
      "Submitted",
      userId,
      req.user.fullName || req.user.username,
      "Application submitted by applicant"
    );

    // Create notification
    await createNotification(
      userId,
      "Bursary Application Submitted",
      `Your bursary application ${applicationNumber} has been submitted successfully.`,
      applicationId,
      "bursary_application"
    );

    return res.status(201).json({
      message: "Application submitted successfully.",
      applicationId,
      applicationNumber,
    });
  } catch (error) {
    console.error("Create bursary application error:", error);
    return res.status(500).json({ message: "Failed to submit application." });
  }
}

// ============================================================
// ADMIN: DELETE APPLICATION
// ============================================================

async function deleteApplication(req, res) {
  try {
    const applicationId = req.params.id;
    const userRole = req.user?.role?.toLowerCase();

    // Only admin can delete applications
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Only administrators can delete applications." });
    }

    // Get application
    const [appRows] = await pool.execute(
      `SELECT * FROM bursary_applications WHERE id = ? LIMIT 1`,
      [applicationId]
    );

    if (appRows.length === 0) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Delete related records (documents, history will cascade)
    await pool.execute(
      `DELETE FROM bursary_application_documents WHERE application_id = ?`,
      [applicationId]
    );
    await pool.execute(
      `DELETE FROM bursary_application_history WHERE application_id = ?`,
      [applicationId]
    );
    await pool.execute(
      `DELETE FROM bursary_applications WHERE id = ?`,
      [applicationId]
    );

    return res.status(200).json({ message: "Application deleted successfully." });
  } catch (error) {
    console.error("Delete bursary application error:", error);
    return res.status(500).json({ message: "Failed to delete application." });
  }
}

// ============================================================
// ADMIN: UPDATE APPLICATION (edit details)
// ============================================================

async function updateApplication(req, res) {
  try {
    const applicationId = req.params.id;
    const userRole = req.user?.role?.toLowerCase();

    // Get current application
    const [appRows] = await pool.execute(
      `SELECT * FROM bursary_applications WHERE id = ? LIMIT 1`,
      [applicationId]
    );

    if (appRows.length === 0) {
      return res.status(404).json({ message: "Application not found." });
    }

    const application = appRows[0];

    // Only admin/staff can edit, or citizen can edit their own draft
    if (userRole !== "admin" && userRole !== "officer" && userRole !== "staff") {
      if (application.user_id !== req.user.id) {
        return res.status(403).json({ message: "You can only edit your own applications." });
      }
      if (application.status !== "Draft") {
        return res.status(400).json({ message: "Only draft applications can be edited." });
      }
    }

    const {
      institutionName,
      institutionType,
      courseOrForm,
      yearOfStudy,
      admissionNumber,
      academicYear,
      studentRegistrationNumber,
      parentFullName,
      parentRelationship,
      parentPhone,
      parentOccupation,
      numberOfDependants,
      householdMonthlyIncome,
      totalFees,
      amountPaid,
      amountRequested,
      previousBursaryReceived,
      previousBursaryAmount,
      otherFinancialAssistance,
      reasonForApplication,
      county,
      constituency,
      residentialAddress,
    } = req.body;

    // Calculate outstanding balance
    const totalFeesNum = parseFloat(totalFees || application.total_fees);
    const amountPaidNum = parseFloat(amountPaid || application.amount_paid);
    const outstandingBalance = totalFeesNum - amountPaidNum;

    await pool.execute(
      `UPDATE bursary_applications SET
        residential_address = ?, county = ?, constituency = ?,
        institution_name = ?, institution_type = ?, course_or_form = ?, year_of_study = ?,
        admission_number = ?, academic_year = ?, student_registration_number = ?,
        parent_full_name = ?, parent_relationship = ?, parent_phone = ?, parent_occupation = ?,
        number_of_dependants = ?, household_monthly_income = ?,
        total_fees = ?, amount_paid = ?, outstanding_balance = ?, amount_requested = ?,
        previous_bursary_received = ?, previous_bursary_amount = ?,
        other_financial_assistance = ?, reason_for_application = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [
        residentialAddress || application.residential_address,
        county || application.county,
        constituency || application.constituency,
        institutionName || application.institution_name,
        institutionType || application.institution_type,
        courseOrForm || application.course_or_form,
        yearOfStudy || application.year_of_study,
        admissionNumber || application.admission_number,
        academicYear || application.academic_year,
        studentRegistrationNumber || application.student_registration_number,
        parentFullName || application.parent_full_name,
        parentRelationship || application.parent_relationship,
        parentPhone || application.parent_phone,
        parentOccupation || application.parent_occupation,
        parseInt(numberOfDependants) || application.number_of_dependants,
        parseFloat(householdMonthlyIncome) || application.household_monthly_income,
        totalFeesNum,
        amountPaidNum,
        outstandingBalance,
        parseFloat(amountRequested) || application.amount_requested,
        previousBursaryReceived || application.previous_bursary_received,
        previousBursaryAmount ? parseFloat(previousBursaryAmount) : application.previous_bursary_amount,
        otherFinancialAssistance || application.other_financial_assistance,
        reasonForApplication || application.reason_for_application,
        applicationId,
      ]
    );

    // Add history entry
    await addHistoryEntry(
      applicationId,
      "Application Updated",
      application.status,
      application.status,
      req.user.id,
      req.user.fullName || req.user.username,
      "Application details were updated"
    );

    return res.status(200).json({ message: "Application updated successfully." });
  } catch (error) {
    console.error("Update bursary application error:", error);
    return res.status(500).json({ message: "Failed to update application." });
  }
}

// ============================================================
// CITIZEN: WITHDRAW APPLICATION
// ============================================================

async function withdrawApplication(req, res) {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;

    // Get application
    const [appRows] = await pool.execute(
      `SELECT * FROM bursary_applications WHERE id = ? AND user_id = ? LIMIT 1`,
      [applicationId, userId]
    );

    if (appRows.length === 0) {
      return res.status(404).json({ message: "Application not found." });
    }

    const application = appRows[0];

    // Only allow withdrawal for Submitted or Under_Review status
    if (application.status !== "Submitted" && application.status !== "Under_Review") {
      return res.status(400).json({ message: "Application can only be withdrawn when in Submitted or Under Review status." });
    }

    await pool.execute(
      `UPDATE bursary_applications SET status = 'Rejected', rejection_reason = 'Application withdrawn by applicant', updated_at = NOW()
       WHERE id = ?`,
      [applicationId]
    );

    // Add history entry
    await addHistoryEntry(
      applicationId,
      "Application Withdrawn",
      application.status,
      "Rejected",
      userId,
      req.user.fullName || req.user.username,
      "Application withdrawn by applicant"
    );

    return res.status(200).json({ message: "Application withdrawn successfully." });
  } catch (error) {
    console.error("Withdraw bursary application error:", error);
    return res.status(500).json({ message: "Failed to withdraw application." });
  }
}

// ============================================================
// CITIZEN: DELETE DRAFT APPLICATION
// ============================================================

async function deleteDraftApplication(req, res) {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;

    // Get application
    const [appRows] = await pool.execute(
      `SELECT * FROM bursary_applications WHERE id = ? AND user_id = ? LIMIT 1`,
      [applicationId, userId]
    );

    if (appRows.length === 0) {
      return res.status(404).json({ message: "Application not found." });
    }

    const application = appRows[0];

    // Only allow deleting draft applications
    if (application.status !== "Draft") {
      return res.status(400).json({ message: "Only draft applications can be deleted." });
    }

    // Delete related records
    await pool.execute(
      `DELETE FROM bursary_application_documents WHERE application_id = ?`,
      [applicationId]
    );
    await pool.execute(
      `DELETE FROM bursary_application_history WHERE application_id = ?`,
      [applicationId]
    );
    await pool.execute(
      `DELETE FROM bursary_applications WHERE id = ?`,
      [applicationId]
    );

    return res.status(200).json({ message: "Draft application deleted successfully." });
  } catch (error) {
    console.error("Delete draft bursary application error:", error);
    return res.status(500).json({ message: "Failed to delete draft application." });
  }
}

// ============================================================
// EXPORT APPLICATIONS TO CSV
// ============================================================

async function exportApplications(req, res) {
  try {
    const {
      search = "",
      ward = "",
      institutionType = "",
      status = "",
      academicYear = "",
    } = req.query;

    const userRole = req.user?.role?.toLowerCase();
    const userWard = req.user?.ward;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (userRole !== "admin" && userWard) {
      whereClause += " AND ba.ward = ?";
      params.push(userWard);
    }

    if (search) {
      whereClause += " AND (ba.full_name LIKE ? OR ba.national_id LIKE ? OR ba.application_number LIKE ? OR ba.institution_name LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (ward) {
      whereClause += " AND ba.ward = ?";
      params.push(ward);
    }

    if (institutionType) {
      whereClause += " AND ba.institution_type = ?";
      params.push(institutionType);
    }

    if (status) {
      whereClause += " AND ba.status = ?";
      params.push(status);
    }

    if (academicYear) {
      whereClause += " AND ba.academic_year = ?";
      params.push(academicYear);
    }

    const [rows] = await pool.execute(
      `SELECT ba.*, u.full_name AS submitted_by_name
       FROM bursary_applications ba
       LEFT JOIN users u ON ba.user_id = u.id
       ${whereClause}
       ORDER BY ba.created_at DESC`,
      params
    );

    // Build CSV
    const headers = [
      "Application Number", "Full Name", "National ID", "Phone", "Email", "Ward",
      "Institution", "Institution Type", "Course/Form", "Academic Year",
      "Total Fees", "Amount Paid", "Outstanding", "Amount Requested", "Approved Amount",
      "Status", "Submitted At", "Created At"
    ];

    const csvRows = rows.map((row) => [
      row.application_number,
      row.full_name,
      row.national_id,
      row.phone_number,
      row.email || "",
      row.ward,
      row.institution_name,
      row.institution_type,
      row.course_or_form || "",
      row.academic_year,
      row.total_fees,
      row.amount_paid,
      row.outstanding_balance,
      row.amount_requested,
      row.approved_amount || 0,
      row.status,
      row.submitted_at ? new Date(row.submitted_at).toISOString() : "",
      row.created_at ? new Date(row.created_at).toISOString() : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=bursary_applications_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Export bursary applications error:", error);
    return res.status(500).json({ message: "Failed to export applications." });
  }
}

// ============================================================
// CITIZEN: GET SINGLE APPLICATION
// ============================================================

async function getMyApplicationById(req, res) {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `SELECT * FROM bursary_applications WHERE id = ? AND user_id = ? LIMIT 1`,
      [applicationId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Application not found." });
    }

    const application = formatBursaryApplication(rows[0]);

    // Get documents
    const [docRows] = await pool.execute(
      `SELECT * FROM bursary_application_documents WHERE application_id = ? ORDER BY uploaded_at DESC`,
      [applicationId]
    );
    application.documents = docRows.map((doc) => ({
      id: doc.id,
      documentType: doc.document_type,
      fileName: doc.file_name,
      filePath: doc.file_path,
      secureUrl: doc.secure_url,
      publicId: doc.public_id,
      fileType: doc.file_type,
      fileSize: doc.file_size,
      uploadedAt: doc.uploaded_at,
    }));

    // Get history
    const [historyRows] = await pool.execute(
      `SELECT * FROM bursary_application_history WHERE application_id = ? ORDER BY created_at DESC`,
      [applicationId]
    );
    application.history = historyRows.map((h) => ({
      id: h.id,
      action: h.action,
      previousStatus: h.previous_status,
      newStatus: h.new_status,
      performedBy: h.performed_by,
      performedByName: h.performed_by_name,
      notes: h.notes,
      createdAt: h.created_at,
    }));

    return res.status(200).json({ application });
  } catch (error) {
    console.error("Get my bursary application error:", error);
    return res.status(500).json({ message: "Failed to fetch application." });
  }
}

// ============================================================
// ADMIN: UPDATE APPLICATION STATUS
// ============================================================

async function updateApplicationStatus(req, res) {
  try {
    const applicationId = req.params.id;
    const { status, approvedAmount, rejectionReason, reviewComments } = req.body;
    const performedBy = req.user.id;
    const performedByName = req.user.fullName || req.user.username;

    // Validate status
    const validStatuses = Object.values(BURSARY_STATUS);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    // Get current application
    const [appRows] = await pool.execute(
      `SELECT * FROM bursary_applications WHERE id = ? LIMIT 1`,
      [applicationId]
    );

    if (appRows.length === 0) {
      return res.status(404).json({ message: "Application not found." });
    }

    const application = appRows[0];
    const previousStatus = application.status;

    // Validation based on status
    if (status === "Approved") {
      if (!approvedAmount || parseFloat(approvedAmount) <= 0) {
        return res.status(400).json({ message: "Approved amount is required when approving." });
      }
      if (parseFloat(approvedAmount) > parseFloat(application.amount_requested)) {
        return res.status(400).json({ message: "Approved amount cannot exceed requested amount." });
      }
    }

    if (status === "Rejected") {
      if (!rejectionReason || rejectionReason.trim() === "") {
        return res.status(400).json({ message: "Rejection reason is required when rejecting." });
      }
    }

    // Build update query
    let updateFields = "status = ?, updated_at = NOW()";
    const updateParams = [status, applicationId];

    if (status === "Approved") {
      updateFields += ", approved_amount = ?, approved_at = NOW()";
      updateParams.unshift(parseFloat(approvedAmount));
    }

    if (status === "Rejected") {
      updateFields += ", rejection_reason = ?";
      updateParams.unshift(rejectionReason);
    }

    if (reviewComments) {
      updateFields += ", review_comments = ?";
      updateParams.unshift(reviewComments);
    }

    if (status === "Under_Review") {
      updateFields += ", reviewed_by = ?, reviewed_at = NOW()";
      updateParams.unshift(performedBy);
    }

    if (status === "Verified") {
      updateFields += ", verified_at = NOW()";
    }

    if (status === "Disbursed") {
      updateFields += ", disbursed_at = NOW()";
    }

    await pool.execute(
      `UPDATE bursary_applications SET ${updateFields} WHERE id = ?`,
      updateParams
    );

    // If approved, automatically create beneficiary (if not already exists)
    let beneficiaryCreated = false;
    let beneficiaryNumber = null;

    if (status === "Approved") {
      const existingBeneficiary = await beneficiaryExistsForApplication(applicationId);
      if (!existingBeneficiary) {
        const beneficiaryNumberVal = await generateBeneficiaryNumber();
        const approvedAmountVal = parseFloat(approvedAmount);
        const outstandingBalance = parseFloat(application.outstanding_balance || 0);
        const amountPaid = parseFloat(application.amount_paid || 0);

        await pool.execute(
          `INSERT INTO bursary_beneficiaries
           (beneficiary_number, application_id, citizen_id, user_id, full_name, national_id, phone_number,
            ward, institution_name, institution_type, academic_year,
            total_fees, amount_paid, outstanding_balance, amount_requested, approved_amount,
            total_disbursed, remaining_balance, status,
            created_by, created_by_name, approved_by, approved_by_name, approved_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?, ?, NOW(), NOW(), NOW())`,
          [
            beneficiaryNumberVal,
            applicationId,
            application.citizen_id,
            application.user_id,
            application.full_name,
            application.national_id,
            application.phone_number,
            application.ward,
            application.institution_name,
            application.institution_type,
            application.academic_year,
            parseFloat(application.total_fees || 0),
            amountPaid,
            outstandingBalance,
            parseFloat(application.amount_requested || 0),
            approvedAmountVal,
            0,
            approvedAmountVal,
            performedBy,
            performedByName,
            performedBy,
            performedByName,
          ]
        );

        beneficiaryCreated = true;
        beneficiaryNumber = beneficiaryNumberVal;

        // Add beneficiary history
        await pool.execute(
          `INSERT INTO bursary_beneficiary_history (beneficiary_id, action, previous_status, new_status, performed_by, performed_by_name, notes, created_at)
           VALUES (LAST_INSERT_ID(), 'Beneficiary Created', null, 'Active', ?, ?, ?, NOW())`,
          [performedBy, performedByName, `Beneficiary created from approved application ${application.application_number}`]
        );

        // Add audit log
        await addAuditLog(
          performedBy,
          performedByName,
          req.user.role,
          "Create Beneficiary",
          "Beneficiary",
          applicationId,
          beneficiaryNumberVal,
          null,
          { applicationId, applicationNumber: application.application_number, approvedAmount: approvedAmountVal },
          "Success",
          null,
          req.ip || req.connection.remoteAddress || null,
          req.get("user-agent") || null
        );
      }
    }

    // Add history entry
    const actionMap = {
      Submitted: "Application Submitted",
      Under_Review: "Application Under Review",
      Verified: "Application Verified",
      Approved: "Application Approved",
      Rejected: "Application Rejected",
      Disbursed: "Bursary Disbursed",
    };

    await addHistoryEntry(
      applicationId,
      actionMap[status] || `Status changed to ${status}`,
      previousStatus,
      status,
      performedBy,
      performedByName,
      reviewComments || rejectionReason || null
    );

    // Create notification for the applicant
    const notificationMessages = {
      Submitted: "Your bursary application has been submitted successfully.",
      Under_Review: "Your bursary application is now under review.",
      Verified: "Your bursary application has been verified.",
      Approved: `Your bursary application has been approved for KES ${parseFloat(approvedAmount || 0).toLocaleString()}.`,
      Rejected: "Your bursary application has been rejected. Please check the reason.",
      Disbursed: "Your bursary funds have been disbursed.",
    };

    await createNotification(
      application.user_id,
      `Bursary Application ${status.replace("_", " ")}`,
      notificationMessages[status] || `Your bursary application status has been updated to ${status.replace("_", " ")}.`,
      applicationId,
      "bursary_application"
    );

    const response = {
      message: `Application status updated to ${status.replace("_", " ")}.`,
    };

    if (beneficiaryCreated) {
      response.beneficiaryCreated = true;
      response.beneficiaryNumber = beneficiaryNumber;
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Update bursary application status error:", error);
    return res.status(500).json({ message: "Failed to update application status." });
  }
}

// ============================================================
// UPLOAD DOCUMENT
// ============================================================

async function uploadDocument(req, res) {
  try {
    const applicationId = req.params.id;
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    if (!DOCUMENT_TYPES.includes(documentType)) {
      return res.status(400).json({ message: "Invalid document type." });
    }

    // Verify application exists
    const [appRows] = await pool.execute(
      `SELECT id FROM bursary_applications WHERE id = ? LIMIT 1`,
      [applicationId]
    );

    if (appRows.length === 0) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Upload to Cloudinary
    const cloudinary = require("../config/cloudinary");
    const { v4: uuidv4 } = require("uuid");

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "bursary_documents",
          public_id: `bursary_${applicationId}_${Date.now()}_${uuidv4().slice(0, 8)}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Save to database
    const [docResult] = await pool.execute(
      `INSERT INTO bursary_application_documents 
       (application_id, document_type, file_name, file_path, secure_url, public_id, file_type, file_size, uploaded_by, uploaded_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        applicationId,
        documentType,
        req.file.originalname,
        result.url,
        result.secure_url,
        result.public_id,
        req.file.mimetype,
        req.file.size,
        req.user.id,
      ]
    );

    // Add history entry
    await addHistoryEntry(
      applicationId,
      "Document Uploaded",
      null,
      null,
      req.user.id,
      req.user.fullName || req.user.username,
      `Uploaded document: ${documentType.replace("_", " ")} - ${req.file.originalname}`
    );

    return res.status(201).json({
      message: "Document uploaded successfully.",
      documentId: docResult.insertId,
      document: {
        id: docResult.insertId,
        documentType,
        fileName: req.file.originalname,
        filePath: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Upload bursary document error:", error);
    return res.status(500).json({ message: "Failed to upload document." });
  }
}

// ============================================================
// DELETE DOCUMENT
// ============================================================

async function deleteDocument(req, res) {
  try {
    const documentId = req.params.documentId;
    const applicationId = req.params.id;

    // Get document info
    const [docRows] = await pool.execute(
      `SELECT * FROM bursary_application_documents WHERE id = ? AND application_id = ? LIMIT 1`,
      [documentId, applicationId]
    );

    if (docRows.length === 0) {
      return res.status(404).json({ message: "Document not found." });
    }

    const document = docRows[0];

    // Delete from Cloudinary
    const cloudinary = require("../config/cloudinary");
    try {
      await cloudinary.uploader.destroy(document.public_id);
    } catch (cloudinaryError) {
      console.error("Cloudinary delete error:", cloudinaryError);
    }

    // Delete from database
    await pool.execute(
      `DELETE FROM bursary_application_documents WHERE id = ?`,
      [documentId]
    );

    // Add history entry
    await addHistoryEntry(
      applicationId,
      "Document Removed",
      null,
      null,
      req.user.id,
      req.user.fullName || req.user.username,
      `Removed document: ${document.document_type.replace("_", " ")} - ${document.file_name}`
    );

    return res.status(200).json({ message: "Document deleted successfully." });
  } catch (error) {
    console.error("Delete bursary document error:", error);
    return res.status(500).json({ message: "Failed to delete document." });
  }
}

// ============================================================
// GET DASHBOARD STATS
// ============================================================

async function getBursaryStats(req, res) {
  try {
    const userWard = req.user?.ward;
    const userRole = req.user?.role?.toLowerCase();

    let appWhereClause = "WHERE 1=1";
    const appParams = [];

    if (userRole !== "admin" && userRole !== "super_admin" && userWard) {
      appWhereClause += " AND ward = ?";
      appParams.push(userWard);
    }

    const [appStatsRows] = await pool.execute(
      `SELECT
        COUNT(*) AS total_applications,
        SUM(CASE WHEN status = 'Submitted' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'Under_Review' THEN 1 ELSE 0 END) AS under_review,
        SUM(CASE WHEN status = 'Verified' THEN 1 ELSE 0 END) AS verified,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN status = 'Disbursed' THEN 1 ELSE 0 END) AS disbursed,
        SUM(amount_requested) AS total_amount_requested,
        SUM(approved_amount) AS total_amount_approved
       FROM bursary_applications ${appWhereClause}`,
      appParams
    );

    const appStats = appStatsRows[0] || {};

    // Beneficiary stats
    let benWhereClause = "WHERE 1=1";
    const benParams = [];

    if (userRole !== "admin" && userRole !== "super_admin" && userWard) {
      benWhereClause += " AND ward = ?";
      benParams.push(userWard);
    }

    const [benStatsRows] = await pool.execute(
      `SELECT
        COUNT(*) AS total_beneficiaries,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS active_beneficiaries,
        SUM(CASE WHEN status = 'Suspended' THEN 1 ELSE 0 END) AS suspended_beneficiaries,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_beneficiaries,
        SUM(approved_amount) AS total_approved_amount,
        SUM(total_disbursed) AS total_disbursed_amount,
        SUM(remaining_balance) AS total_remaining_balance
       FROM bursary_beneficiaries ${benWhereClause}`,
      benParams
    );

    const benStats = benStatsRows[0] || {};

    // Payment stats
    const [payStatsRows] = await pool.execute(
      `SELECT
        COUNT(*) AS total_payments,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS successful_payments,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_payments,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) AS failed_payments,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_payments,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_payments,
        SUM(payment_amount) AS total_payment_amount
       FROM bursary_payments`
    );

    const payStats = payStatsRows[0] || {};

    return res.status(200).json({
      // Application stats
      totalApplications: appStats.total_applications || 0,
      pending: appStats.pending || 0,
      underReview: appStats.under_review || 0,
      verified: appStats.verified || 0,
      approved: appStats.approved || 0,
      rejected: appStats.rejected || 0,
      disbursed: appStats.disbursed || 0,
      totalAmountRequested: parseFloat(appStats.total_amount_requested || 0),
      totalAmountApproved: parseFloat(appStats.total_amount_approved || 0),
      // Beneficiary stats
      totalBeneficiaries: benStats.total_beneficiaries || 0,
      activeBeneficiaries: benStats.active_beneficiaries || 0,
      suspendedBeneficiaries: benStats.suspended_beneficiaries || 0,
      completedBeneficiaries: benStats.completed_beneficiaries || 0,
      totalApprovedAmount: parseFloat(benStats.total_approved_amount || 0),
      totalDisbursedAmount: parseFloat(benStats.total_disbursed_amount || 0),
      totalRemainingBalance: parseFloat(benStats.total_remaining_balance || 0),
      // Payment stats
      totalPayments: payStats.total_payments || 0,
      successfulPayments: payStats.successful_payments || 0,
      pendingPayments: payStats.pending_payments || 0,
      failedPayments: payStats.failed_payments || 0,
      rejectedPayments: payStats.rejected_payments || 0,
      cancelledPayments: payStats.cancelled_payments || 0,
      totalPaymentAmount: parseFloat(payStats.total_payment_amount || 0),
    });
  } catch (error) {
    console.error("Get bursary stats error:", error);
    return res.status(500).json({ message: "Failed to fetch stats." });
  }
}

// ============================================================
// GET REPORTS DATA
// ============================================================

async function getBursaryReports(req, res) {
  try {
    const { ward, institutionType, academicYear, status, startDate, endDate } = req.query;
    const userWard = req.user?.ward;
    const userRole = req.user?.role?.toLowerCase();

    let whereClause = "WHERE 1=1";
    const params = [];

    if (userRole !== "admin" && userWard) {
      whereClause += " AND ward = ?";
      params.push(userWard);
    }

    if (ward) {
      whereClause += " AND ward = ?";
      params.push(ward);
    }

    if (institutionType) {
      whereClause += " AND institution_type = ?";
      params.push(institutionType);
    }

    if (academicYear) {
      whereClause += " AND academic_year = ?";
      params.push(academicYear);
    }

    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }

    if (startDate) {
      whereClause += " AND created_at >= ?";
      params.push(startDate);
    }

    if (endDate) {
      whereClause += " AND created_at <= ?";
      params.push(endDate + " 23:59:59");
    }

    // Summary stats
    const [summaryRows] = await pool.execute(
      `SELECT 
        COUNT(*) AS total_applications,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved_count,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_count,
        SUM(amount_requested) AS total_requested,
        SUM(approved_amount) AS total_approved
       FROM bursary_applications ${whereClause}`,
      params
    );

    // By ward
    const [wardRows] = await pool.execute(
      `SELECT ward, COUNT(*) AS count, SUM(amount_requested) AS total_requested, SUM(approved_amount) AS total_approved
       FROM bursary_applications ${whereClause}
       GROUP BY ward
       ORDER BY count DESC`,
      params
    );

    // By institution type
    const [instTypeRows] = await pool.execute(
      `SELECT institution_type, COUNT(*) AS count, SUM(amount_requested) AS total_requested, SUM(approved_amount) AS total_approved
       FROM bursary_applications ${whereClause}
       GROUP BY institution_type
       ORDER BY count DESC`,
      params
    );

    // By status
    const [statusRows] = await pool.execute(
      `SELECT status, COUNT(*) AS count
       FROM bursary_applications ${whereClause}
       GROUP BY status
       ORDER BY count DESC`,
      params
    );

    // By academic year
    const [yearRows] = await pool.execute(
      `SELECT academic_year, COUNT(*) AS count, SUM(amount_requested) AS total_requested, SUM(approved_amount) AS total_approved
       FROM bursary_applications ${whereClause}
       GROUP BY academic_year
       ORDER BY academic_year DESC`,
      params
    );

    // Monthly trend
    const [monthlyRows] = await pool.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count, SUM(amount_requested) AS total_requested
       FROM bursary_applications ${whereClause}
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month DESC
       LIMIT 12`,
      params
    );

    return res.status(200).json({
      summary: summaryRows[0] || {},
      byWard: wardRows,
      byInstitutionType: instTypeRows,
      byStatus: statusRows,
      byAcademicYear: yearRows,
      monthlyTrend: monthlyRows,
    });
  } catch (error) {
    console.error("Get bursary reports error:", error);
    return res.status(500).json({ message: "Failed to fetch reports." });
  }
}

// ============================================================
// GET BENEFICIARIES (from bursary_beneficiaries table)
// ============================================================

function formatBeneficiary(row) {
  return {
    id: row.id,
    beneficiaryNumber: row.beneficiary_number,
    applicationId: row.application_id,
    citizenId: row.citizen_id,
    userId: row.user_id,
    fullName: row.full_name,
    nationalId: row.national_id,
    phoneNumber: row.phone_number,
    email: row.email,
    ward: row.ward,
    county: row.county,
    constituency: row.constituency,
    institutionName: row.institution_name,
    institutionType: row.institution_type,
    courseOrForm: row.course_or_form,
    yearOfStudy: row.year_of_study,
    admissionNumber: row.admission_number,
    academicYear: row.academic_year,
    studentRegistrationNumber: row.student_registration_number,
    parentFullName: row.parent_full_name,
    parentRelationship: row.parent_relationship,
    parentPhone: row.parent_phone,
    totalFees: parseFloat(row.total_fees || 0),
    amountPaid: parseFloat(row.amount_paid || 0),
    outstandingBalance: parseFloat(row.outstanding_balance || 0),
    amountRequested: parseFloat(row.amount_requested || 0),
    approvedAmount: parseFloat(row.approved_amount || 0),
    totalDisbursed: parseFloat(row.total_disbursed || 0),
    remainingBalance: parseFloat(row.remaining_balance || 0),
    status: row.status,
    programId: row.program_id,
    programName: row.program_name,
    createdByName: row.created_by_name,
    approvedByName: row.approved_by_name,
    approvedAt: row.approved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getBeneficiaries(req, res) {
  try {
    const {
      search = "",
      ward = "",
      institutionType = "",
      academicYear = "",
      status = "",
      county = "",
      startDate = "",
      endDate = "",
      page = 1,
      limit = 20,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const userRole = req.user?.role?.toLowerCase();
    const userWard = req.user?.ward;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (userRole !== "admin" && userRole !== "super_admin" && userWard) {
      whereClause += " AND b.ward = ?";
      params.push(userWard);
    }

    if (search) {
      whereClause += " AND (b.full_name LIKE ? OR b.national_id LIKE ? OR b.beneficiary_number LIKE ? OR b.institution_name LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (ward) {
      whereClause += " AND b.ward = ?";
      params.push(ward);
    }

    if (institutionType) {
      whereClause += " AND b.institution_type = ?";
      params.push(institutionType);
    }

    if (academicYear) {
      whereClause += " AND b.academic_year = ?";
      params.push(academicYear);
    }

    if (status) {
      const statusList = status.split(",").map((s) => s.trim());
      const placeholders = statusList.map(() => "?").join(", ");
      whereClause += ` AND b.status IN (${placeholders})`;
      params.push(...statusList);
    }

    if (county) {
      whereClause += " AND b.county = ?";
      params.push(county);
    }

    if (startDate) {
      whereClause += " AND b.created_at >= ?";
      params.push(startDate + " 00:00:00");
    }

    if (endDate) {
      whereClause += " AND b.created_at <= ?";
      params.push(endDate + " 23:59:59");
    }

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM bursary_beneficiaries b ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    const [rows] = await pool.execute(
      `SELECT b.*, u.full_name AS created_by_name, a.full_name AS approved_by_name
       FROM bursary_beneficiaries b
       LEFT JOIN users u ON b.created_by = u.id
       LEFT JOIN users a ON b.approved_by = a.id
       ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const beneficiaries = rows.map(formatBeneficiary);

    return res.status(200).json({
      beneficiaries,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get beneficiaries error:", error);
    return res.status(500).json({ message: "Failed to fetch beneficiaries." });
  }
}

// ============================================================
// ADMIN: CREATE BENEFICIARY
// ============================================================

async function createBeneficiary(req, res) {
  try {
    const adminId = req.user.id;
    const adminName = req.user.fullName || req.user.username;

    const {
      // Applicant
      fullName,
      nationalId,
      dateOfBirth,
      gender,
      phoneNumber,
      email,
      residentialAddress,
      county,
      constituency,
      ward,
      // Education
      institutionName,
      institutionType,
      courseOrForm,
      yearOfStudy,
      admissionNumber,
      academicYear,
      studentRegistrationNumber,
      // Parent/Guardian
      parentFullName,
      parentRelationship,
      parentPhone,
      parentOccupation,
      numberOfDependants,
      householdMonthlyIncome,
      // Financial
      totalFees,
      amountPaid,
      amountRequested,
      approvedAmount,
      previousBursaryReceived,
      previousBursaryAmount,
      otherFinancialAssistance,
      reasonForApplication,
      status,
    } = req.body;

    // Validation
    if (!fullName || !nationalId || !institutionName || !institutionType || !academicYear || !amountRequested) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (!INSTITUTION_TYPES.includes(institutionType)) {
      return res.status(400).json({ message: "Invalid institution type." });
    }

    const totalFeesNum = parseFloat(totalFees || 0);
    const amountPaidNum = parseFloat(amountPaid || 0);
    const amountRequestedNum = parseFloat(amountRequested);
    const approvedAmountNum = approvedAmount ? parseFloat(approvedAmount) : null;

    if (isNaN(amountRequestedNum) || amountRequestedNum <= 0) {
      return res.status(400).json({ message: "Amount requested must be a positive number." });
    }

    // Link to an existing citizen record (and their portal account) when the
    // national ID is already registered; otherwise store as unlinked (NULL).
    let citizenId = null;
    let linkedUserId = null;
    const [citizenRows] = await pool.execute(
      `SELECT id, user_id FROM citizens WHERE national_id = ? LIMIT 1`,
      [nationalId]
    );
    if (citizenRows.length > 0) {
      citizenId = citizenRows[0].id;
      linkedUserId = citizenRows[0].user_id || null;
    }

    const applicationNumber = await generateApplicationNumber();

    const [result] = await pool.execute(
      `INSERT INTO bursary_applications
       (application_number, citizen_id, user_id, ward, full_name, national_id, date_of_birth, gender, phone_number, email,
        residential_address, county, constituency, institution_name, institution_type, course_or_form, year_of_study,
        admission_number, academic_year, student_registration_number, parent_full_name, parent_relationship, parent_phone,
        parent_occupation, number_of_dependants, household_monthly_income, total_fees, amount_paid, outstanding_balance,
        amount_requested, approved_amount, previous_bursary_received, previous_bursary_amount, other_financial_assistance,
        reason_for_application, status, submitted_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [
        applicationNumber,
        citizenId,
        linkedUserId,
        ward || "Westlands",
        fullName,
        nationalId,
        dateOfBirth || null,
        gender || "Male",
        phoneNumber || null,
        email || null,
        residentialAddress || null,
        county || null,
        constituency || null,
        institutionName,
        institutionType,
        courseOrForm || null,
        yearOfStudy || null,
        admissionNumber || null,
        academicYear,
        studentRegistrationNumber || null,
        parentFullName || null,
        parentRelationship || null,
        parentPhone || null,
        parentOccupation || null,
        parseInt(numberOfDependants) || 0,
        parseFloat(householdMonthlyIncome) || 0,
        totalFeesNum,
        amountPaidNum,
        totalFeesNum - amountPaidNum,
        amountRequestedNum,
        approvedAmountNum,
        previousBursaryReceived || "No",
        previousBursaryAmount ? parseFloat(previousBursaryAmount) : 0,
        otherFinancialAssistance || null,
        reasonForApplication || null,
        status || "Approved",
      ]
    );

    const applicationId = result.insertId;

    // Add history entry
    await addHistoryEntry(
      applicationId,
      "Beneficiary Created",
      null,
      status || "Approved",
      adminId,
      adminName,
      "Beneficiary record created by administrator"
    );

    return res.status(201).json({
      message: "Beneficiary created successfully.",
      applicationId,
      applicationNumber,
    });
  } catch (error) {
    console.error("Create beneficiary error:", error);
    return res.status(500).json({ message: "Failed to create beneficiary." });
  }
}

// ============================================================
// GET SINGLE BENEFICIARY PROFILE (from bursary_beneficiaries)
// ============================================================

async function getBeneficiaryById(req, res) {
  try {
    const beneficiaryId = req.params.id;
    const userRole = req.user?.role?.toLowerCase();
    const userWard = req.user?.ward;

    let whereClause = "WHERE b.id = ?";
    const params = [beneficiaryId];

    if (userRole !== "admin" && userRole !== "super_admin" && userWard) {
      whereClause += " AND b.ward = ?";
      params.push(userWard);
    }

    const [rows] = await pool.execute(
      `SELECT b.*,
              u.full_name AS created_by_name,
              a.full_name AS approved_by_name,
              c.photo_url AS citizen_photo_url
       FROM bursary_beneficiaries b
       LEFT JOIN users u ON b.created_by = u.id
       LEFT JOIN users a ON b.approved_by = a.id
       LEFT JOIN citizens c ON b.citizen_id = c.id
       ${whereClause}
       LIMIT 1`,
      params
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Beneficiary not found." });
    }

    const beneficiary = formatBeneficiary(rows[0]);
    beneficiary.photoUrl = rows[0].citizen_photo_url || null;
    beneficiary.createdByName = rows[0].created_by_name || null;
    beneficiary.approvedByName = rows[0].approved_by_name || null;

    // Get application details
    const [appRows] = await pool.execute(
      `SELECT ba.*, u.full_name AS submitted_by_name, r.full_name AS reviewed_by_name
       FROM bursary_applications ba
       LEFT JOIN users u ON ba.user_id = u.id
       LEFT JOIN users r ON ba.reviewed_by = r.id
       WHERE ba.id = ? LIMIT 1`,
      [beneficiary.applicationId]
    );
    if (appRows.length > 0) {
      beneficiary.application = formatBursaryApplication(appRows[0]);
    }

    // Get payments
    const [paymentRows] = await pool.execute(
      `SELECT * FROM bursary_payments WHERE beneficiary_id = ? ORDER BY created_at DESC`,
      [beneficiaryId]
    );
    beneficiary.payments = paymentRows.map((p) => ({
      id: p.id,
      paymentCode: p.payment_code,
      amount: parseFloat(p.payment_amount || 0),
      method: p.payment_method,
      status: p.status,
      transactionReference: p.transaction_reference,
      createdAt: p.created_at,
      completedAt: p.completed_at,
    }));

    // Beneficiary history
    const [beneficiaryHistoryRows] = await pool.execute(
      `SELECT * FROM bursary_beneficiary_history WHERE beneficiary_id = ? ORDER BY created_at DESC`,
      [beneficiaryId]
    );
    beneficiary.history = beneficiaryHistoryRows.map((h) => ({
      id: h.id,
      action: h.action,
      previousStatus: h.previous_status,
      newStatus: h.new_status,
      performedByName: h.performed_by_name,
      notes: h.notes,
      createdAt: h.created_at,
    }));

    return res.status(200).json({ beneficiary });
  } catch (error) {
    console.error("Get beneficiary error:", error);
    return res.status(500).json({ message: "Failed to fetch beneficiary." });
  }
}

// ============================================================
// EXPORT BENEFICIARIES (CSV, national IDs masked)
// ============================================================

async function exportBeneficiaries(req, res) {
  try {
    const { whereClause, params } = buildBeneficiaryWhere(req);

    const [rows] = await pool.execute(
      `SELECT b.* FROM bursary_beneficiaries b
       ${whereClause.replace(/ba\./g, "b.")}
       ORDER BY b.created_at DESC`,
      params
    );

    const headers = [
      "Beneficiary ID", "Full Name", "National ID", "Phone", "Ward", "County",
      "Program", "Institution", "Academic Year", "Amount Requested",
      "Approved Amount", "Total Disbursed", "Remaining Balance", "Status", "Registration Date",
    ];

    const csvRows = rows.map((row) => [
      row.beneficiary_number,
      row.full_name,
      maskNationalId(row.national_id),
      row.phone_number,
      row.ward,
      row.county || "",
      row.institution_type,
      row.institution_name,
      row.academic_year,
      row.amount_requested,
      row.approved_amount || 0,
      row.total_disbursed || 0,
      row.remaining_balance || 0,
      row.status,
      row.created_at ? new Date(row.created_at).toISOString().slice(0, 10) : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvRows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=beneficiaries_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Export beneficiaries error:", error);
    return res.status(500).json({ message: "Failed to export beneficiaries." });
  }
}

// ============================================================
// BENEFICIARY FILTER OPTIONS (distinct counties, wards, years)
// ============================================================

async function getBeneficiaryFilterOptions(req, res) {
  try {
    const userRole = req.user?.role?.toLowerCase();
    const userWard = req.user?.ward;

    let whereClause = "WHERE 1=1";
    const params = [];
    if (userRole !== "admin" && userRole !== "super_admin" && userWard) {
      whereClause += " AND ward = ?";
      params.push(userWard);
    }

    const [countyRows] = await pool.execute(
      `SELECT DISTINCT county FROM bursary_beneficiaries ${whereClause} AND county IS NOT NULL AND county <> '' ORDER BY county`,
      params
    );
    const [wardRows] = await pool.execute(
      `SELECT DISTINCT ward FROM bursary_beneficiaries ${whereClause} AND ward IS NOT NULL AND ward <> '' ORDER BY ward`,
      params
    );
    const [yearRows] = await pool.execute(
      `SELECT DISTINCT academic_year FROM bursary_beneficiaries ${whereClause} AND academic_year IS NOT NULL AND academic_year <> '' ORDER BY academic_year DESC`,
      params
    );

    return res.status(200).json({
      counties: countyRows.map((r) => r.county),
      wards: wardRows.map((r) => r.ward),
      academicYears: yearRows.map((r) => r.academic_year),
      programs: INSTITUTION_TYPES,
      statuses: ["Active", "Suspended", "Completed", "Cancelled"],
    });
  } catch (error) {
    console.error("Get beneficiary filter options error:", error);
    return res.status(500).json({ message: "Failed to fetch filter options." });
  }
}

// ============================================================
// CREATE PAYMENT
// ============================================================

async function generatePaymentCode() {
  const year = new Date().getFullYear();
  const prefix = `PAY-${year}`;
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS count FROM bursary_payments WHERE YEAR(created_at) = ?`,
    [year]
  );
  const count = (countRows[0]?.count || 0) + 1;
  return `${prefix}-${String(count).padStart(5, "0")}`;
}

async function addPaymentHistoryEntry(paymentId, action, previousStatus, newStatus, performedBy, performedByName, notes) {
  await pool.execute(
    `INSERT INTO bursary_payment_history (payment_id, action, previous_status, new_status, performed_by, performed_by_name, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [paymentId, action, previousStatus, newStatus, performedBy, performedByName, notes]
  );
}

async function addAuditLog(userId, userName, userRole, action, entityType, entityId, entityName, oldValues, newValues, status, errorMessage, ipAddress, userAgent) {
  await pool.execute(
    `INSERT INTO audit_logs (user_id, user_name, user_role, action, entity_type, entity_id, entity_name, old_values, new_values, status, error_message, ip_address, user_agent, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      userId,
      userName,
      userRole,
      action,
      entityType,
      entityId,
      entityName,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      status,
      errorMessage,
      ipAddress,
      userAgent,
    ]
  );
}

async function getAuditLogs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const entityType = req.query.entityType || null;
    const action = req.query.action || null;
    const status = req.query.status || null;
    const userId = req.query.userId || null;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (entityType) {
      whereClause += " AND entity_type = ?";
      params.push(entityType);
    }
    if (action) {
      whereClause += " AND action LIKE ?";
      params.push(`%${action}%`);
    }
    if (status) {
      whereClause += " AND status = ?";
      params.push(status);
    }
    if (userId) {
      whereClause += " AND user_id = ?";
      params.push(userId);
    }

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    const [logs] = await pool.execute(
      `SELECT id, user_id, user_name, user_role, action, entity_type, entity_id, entity_name,
              old_values, new_values, status, error_message, ip_address, user_agent, created_at
       FROM audit_logs
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const formattedLogs = logs.map((log) => ({
      ...log,
      old_values: log.old_values ? JSON.parse(log.old_values) : null,
      new_values: log.new_values ? JSON.parse(log.new_values) : null,
    }));

    res.json({
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ message: "Failed to fetch audit logs.", error: error.message });
  }
}

async function createPayment(req, res) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.id;
    const userName = req.user.fullName || req.user.username;
    const userRole = req.user.role;
    const ipAddress = req.ip || req.connection.remoteAddress || null;
    const userAgent = req.get("user-agent") || null;

    // Authorization: only finance_officer, admin, super_admin can create payments
    const role = String(userRole).toLowerCase();
    if (!["finance_officer", "officer", "admin", "super_admin"].includes(role)) {
      await connection.rollback();
      await addAuditLog(userId, userName, userRole, "Create Payment", "Payment", null, null, null, null, "Failed", "Unauthorized: insufficient permissions", ipAddress, userAgent);
      return res.status(403).json({ message: "Only finance officers and administrators can create payments." });
    }

    const {
      beneficiaryId,
      applicationId,
      programId,
      paymentAmount,
      paymentMethod,
      mpesaNumber,
      mpesaTransactionId,
      bankName,
      bankAccountNumber,
      bankBranch,
      chequeNumber,
      chequeDate,
      transactionReference,
      externalReference,
      notes,
    } = req.body;

    // Validation
    if (!beneficiaryId || !applicationId || !paymentAmount) {
      await connection.rollback();
      await addAuditLog(userId, userName, userRole, "Create Payment", "Payment", null, null, null, null, "Failed", "Missing required fields: beneficiaryId, applicationId, paymentAmount", ipAddress, userAgent);
      return res.status(400).json({ message: "Beneficiary ID, application ID, and payment amount are required." });
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      await connection.rollback();
      await addAuditLog(userId, userName, userRole, "Create Payment", "Payment", null, null, null, null, "Failed", "Payment amount must be greater than zero", ipAddress, userAgent);
      return res.status(400).json({ message: "Payment amount must be greater than zero." });
    }

    if (!["M-Pesa", "Bank_Transfer", "Cheque"].includes(paymentMethod)) {
      await connection.rollback();
      await addAuditLog(userId, userName, userRole, "Create Payment", "Payment", null, null, null, null, "Failed", "Invalid payment method", ipAddress, userAgent);
      return res.status(400).json({ message: "Invalid payment method." });
    }

    // Check transaction reference uniqueness
    if (transactionReference) {
      const [refRows] = await connection.execute(
        `SELECT id FROM bursary_payments WHERE transaction_reference = ? LIMIT 1`,
        [transactionReference]
      );
      if (refRows.length > 0) {
        await connection.rollback();
        await addAuditLog(userId, userName, userRole, "Create Payment", "Payment", null, null, null, null, "Failed", "Duplicate transaction reference", ipAddress, userAgent);
        return res.status(409).json({ message: "Payment reference number already exists." });
      }
    }

    // Verify beneficiary exists and is active
    const [beneficiaryRows] = await connection.execute(
      `SELECT id, beneficiary_number, full_name, national_id, approved_amount, total_disbursed, remaining_balance, status, ward, institution_name, institution_type, academic_year
       FROM bursary_beneficiaries WHERE id = ? LIMIT 1`,
      [beneficiaryId]
    );

    if (beneficiaryRows.length === 0) {
      await connection.rollback();
      await addAuditLog(userId, userName, userRole, "Create Payment", "Beneficiary", beneficiaryId, null, null, null, "Failed", "Beneficiary not found", ipAddress, userAgent);
      return res.status(404).json({ message: "Beneficiary not found." });
    }

    const beneficiary = beneficiaryRows[0];

    if (beneficiary.status !== "Active") {
      await connection.rollback();
      await addAuditLog(userId, userName, userRole, "Create Payment", "Beneficiary", beneficiaryId, beneficiary.full_name, null, null, "Failed", "Beneficiary is not active", ipAddress, userAgent);
      return res.status(400).json({ message: "Beneficiary is not active or eligible for payment." });
    }

    // Verify application exists and is approved
    const [appRows] = await connection.execute(
      `SELECT id, application_number, status, approved_amount FROM bursary_applications WHERE id = ? LIMIT 1`,
      [applicationId]
    );

    if (appRows.length === 0) {
      await connection.rollback();
      await addAuditLog(userId, userName, userRole, "Create Payment", "Application", applicationId, null, null, null, "Failed", "Application not found", ipAddress, userAgent);
      return res.status(404).json({ message: "Application not found." });
    }

    const application = appRows[0];
    if (application.status !== "Approved" && application.status !== "Disbursed") {
      await connection.rollback();
      await addAuditLog(userId, userName, userRole, "Create Payment", "Application", applicationId, application.application_number, null, null, "Failed", "Application is not approved", ipAddress, userAgent);
      return res.status(400).json({ message: "Application must be approved before payment can be created." });
    }

    // Verify beneficiary belongs to application
    if (beneficiary.application_id !== parseInt(applicationId)) {
      await connection.rollback();
      await addAuditLog(userId, userName, userRole, "Create Payment", "Beneficiary", beneficiaryId, beneficiary.full_name, null, null, "Failed", "Beneficiary does not belong to this application", ipAddress, userAgent);
      return res.status(400).json({ message: "Beneficiary does not belong to the specified application." });
    }

    // Check remaining balance
    const remainingBalance = parseFloat(beneficiary.remaining_balance || 0);
    if (amount > remainingBalance) {
      await connection.rollback();
      await addAuditLog(userId, userName, userRole, "Create Payment", "Payment", null, null, { amount, remainingBalance }, null, "Failed", "Payment amount exceeds remaining balance", ipAddress, userAgent);
      return res.status(400).json({
        message: "Payment amount exceeds the beneficiary's remaining approved balance.",
        remainingBalance,
        requestedAmount: amount,
      });
    }

    // Generate payment code
    const paymentCode = await generatePaymentCode();

    // Calculate new balances
    const previouslyPaid = parseFloat(beneficiary.total_disbursed || 0);
    const newTotalDisbursed = previouslyPaid + amount;
    const newRemainingBalance = remainingBalance - amount;

    // Insert payment
    const [paymentResult] = await connection.execute(
      `INSERT INTO bursary_payments
       (payment_code, beneficiary_id, application_id, program_id, awarded_amount, previously_paid, payment_amount, remaining_balance,
        payment_method, mpesa_number, mpesa_transaction_id, bank_name, bank_account_number, bank_branch,
        cheque_number, cheque_date, transaction_reference, external_reference,
        status, initiated_by, initiated_by_name, approved_by, approved_by_name, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        paymentCode,
        beneficiaryId,
        applicationId,
        programId || null,
        parseFloat(beneficiary.approved_amount),
        previouslyPaid,
        amount,
        newRemainingBalance,
        paymentMethod,
        mpesaNumber || null,
        mpesaTransactionId || null,
        bankName || null,
        bankAccountNumber || null,
        bankBranch || null,
        chequeNumber || null,
        chequeDate || null,
        transactionReference || null,
        externalReference || null,
        userId,
        userName,
        userId,
        userName,
        notes || null,
      ]
    );

    const paymentId = paymentResult.insertId;

    // Update beneficiary balances
    await connection.execute(
      `UPDATE bursary_beneficiaries SET total_disbursed = ?, remaining_balance = ?, updated_at = NOW() WHERE id = ?`,
      [newTotalDisbursed, newRemainingBalance, beneficiaryId]
    );

    // Add payment history
    await addPaymentHistoryEntry(paymentId, "Payment Created", null, "PENDING", userId, userName, "Payment record created");

    // Add beneficiary history
    await connection.execute(
      `INSERT INTO bursary_beneficiary_history (beneficiary_id, action, previous_status, new_status, performed_by, performed_by_name, notes, created_at)
       VALUES (?, 'Payment Recorded', ?, ?, ?, ?, ?, NOW())`,
      [beneficiaryId, beneficiary.status, beneficiary.status, userId, userName, `Payment of KES ${amount.toLocaleString()} recorded`]
    );

    // Add audit log
    await addAuditLog(
      userId,
      userName,
      userRole,
      "Create Payment",
      "Payment",
      paymentId,
      paymentCode,
      null,
      { paymentCode, beneficiaryId, applicationId, amount, paymentMethod },
      "Success",
      null,
      ipAddress,
      userAgent
    );

    await connection.commit();

    return res.status(201).json({
      message: "Payment created successfully.",
      payment: {
        id: paymentId,
        paymentCode,
        beneficiaryId,
        applicationId,
        amount,
        paymentMethod,
        status: "PENDING",
        remainingBalance: newRemainingBalance,
        totalDisbursed: newTotalDisbursed,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Create payment error:", error);
    return res.status(500).json({ message: "Failed to create payment." });
  } finally {
    connection.release();
  }
}

// ============================================================
// GET PAYMENTS (from bursary_payments table)
// ============================================================

async function getPayments(req, res) {
  try {
    const { search = "", ward = "", status = "", page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const userRole = req.user?.role?.toLowerCase();
    const userWard = req.user?.ward;

    let whereClause = "WHERE 1=1";
    const params = [];

    // Non-admin users can only see their ward
    if (userRole !== "admin" && userRole !== "super_admin" && userWard) {
      whereClause += " AND b.ward = ?";
      params.push(userWard);
    }

    if (status) {
      whereClause += " AND p.status = ?";
      params.push(status);
    }

    if (search) {
      whereClause += " AND (b.full_name LIKE ? OR b.national_id LIKE ? OR p.payment_code LIKE ? OR b.institution_name LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (ward) {
      whereClause += " AND b.ward = ?";
      params.push(ward);
    }

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM bursary_payments p JOIN bursary_beneficiaries b ON p.beneficiary_id = b.id ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    const [rows] = await pool.execute(
      `SELECT p.*, b.full_name AS beneficiary_name, b.national_id AS beneficiary_national_id,
              b.institution_name, b.institution_type, b.academic_year, b.ward, b.beneficiary_number,
              u.full_name AS initiated_by_name, a.full_name AS approved_by_name
       FROM bursary_payments p
       JOIN bursary_beneficiaries b ON p.beneficiary_id = b.id
       LEFT JOIN users u ON p.initiated_by = u.id
       LEFT JOIN users a ON p.approved_by = a.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const payments = rows.map((row) => ({
      id: row.id,
      paymentCode: row.payment_code,
      beneficiaryId: row.beneficiary_id,
      applicationId: row.application_id,
      programId: row.program_id,
      beneficiaryName: row.beneficiary_name,
      beneficiaryNumber: row.beneficiary_number,
      nationalId: row.beneficiary_national_id,
      institutionName: row.institution_name,
      institutionType: row.institution_type,
      academicYear: row.academic_year,
      ward: row.ward,
      awardedAmount: parseFloat(row.awarded_amount || 0),
      previouslyPaid: parseFloat(row.previously_paid || 0),
      paymentAmount: parseFloat(row.payment_amount || 0),
      remainingBalance: parseFloat(row.remaining_balance || 0),
      paymentMethod: row.payment_method,
      mpesaNumber: row.mpesa_number,
      mpesaTransactionId: row.mpesa_transaction_id,
      bankName: row.bank_name,
      bankAccountNumber: row.bank_account_number,
      bankBranch: row.bank_branch,
      chequeNumber: row.cheque_number,
      chequeDate: row.cheque_date,
      transactionReference: row.transaction_reference,
      externalReference: row.external_reference,
      status: row.status,
      failureReason: row.failure_reason,
      rejectionReason: row.rejection_reason,
      initiatedByName: row.initiated_by_name,
      approvedByName: row.approved_by_name,
      notes: row.notes,
      approvedAt: row.approved_at,
      processedAt: row.processed_at,
      completedAt: row.completed_at,
      failedAt: row.failed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return res.status(200).json({
      payments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);
    return res.status(500).json({ message: "Failed to fetch payments." });
  }
}

// ============================================================
// BURSARY PROGRAMS CRUD
// ============================================================

async function getPrograms(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM bursary_programs ORDER BY created_at DESC`
    );
    return res.status(200).json({ programs: rows });
  } catch (error) {
    console.error("Get programs error:", error);
    return res.status(500).json({ message: "Failed to fetch programs." });
  }
}

async function createProgram(req, res) {
  try {
    const {
      programCode,
      programName,
      description,
      institutionType,
      maxAmount,
      minAmount,
      totalBudget,
      applicationStartDate,
      applicationEndDate,
      academicYear,
      ward,
      requirements,
      isActive,
    } = req.body;

    if (!programCode || !programName || !maxAmount || !totalBudget) {
      return res.status(400).json({ message: "Program code, name, max amount, and total budget are required." });
    }

    const [result] = await pool.execute(
      `INSERT INTO bursary_programs
       (program_code, program_name, description, institution_type, max_amount, min_amount, total_budget,
        application_start_date, application_end_date, academic_year, ward, requirements, is_active, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        programCode,
        programName,
        description || null,
        institutionType || "All",
        parseFloat(maxAmount),
        parseFloat(minAmount || 0),
        parseFloat(totalBudget),
        applicationStartDate || null,
        applicationEndDate || null,
        academicYear || null,
        ward || null,
        requirements || null,
        isActive !== false ? 1 : 0,
        req.user.id,
      ]
    );

    return res.status(201).json({
      message: "Program created successfully.",
      programId: result.insertId,
    });
  } catch (error) {
    console.error("Create program error:", error);
    return res.status(500).json({ message: "Failed to create program." });
  }
}

async function updateProgram(req, res) {
  try {
    const programId = req.params.id;
    const {
      programCode,
      programName,
      description,
      institutionType,
      maxAmount,
      minAmount,
      totalBudget,
      applicationStartDate,
      applicationEndDate,
      academicYear,
      ward,
      requirements,
      isActive,
    } = req.body;

    const [result] = await pool.execute(
      `UPDATE bursary_programs SET
        program_code = ?, program_name = ?, description = ?, institution_type = ?,
        max_amount = ?, min_amount = ?, total_budget = ?,
        application_start_date = ?, application_end_date = ?, academic_year = ?, ward = ?,
        requirements = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        programCode,
        programName,
        description || null,
        institutionType || "All",
        parseFloat(maxAmount),
        parseFloat(minAmount || 0),
        parseFloat(totalBudget),
        applicationStartDate || null,
        applicationEndDate || null,
        academicYear || null,
        ward || null,
        requirements || null,
        isActive !== false ? 1 : 0,
        programId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Program not found." });
    }

    return res.status(200).json({ message: "Program updated successfully." });
  } catch (error) {
    console.error("Update program error:", error);
    return res.status(500).json({ message: "Failed to update program." });
  }
}

async function deleteProgram(req, res) {
  try {
    const programId = req.params.id;
    const [result] = await pool.execute(
      `DELETE FROM bursary_programs WHERE id = ?`,
      [programId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Program not found." });
    }

    return res.status(200).json({ message: "Program deleted successfully." });
  } catch (error) {
    console.error("Delete program error:", error);
    return res.status(500).json({ message: "Failed to delete program." });
  }
}

// ============================================================
// NOTIFICATIONS
// ============================================================

async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [userId]
    );
    return res.status(200).json({ notifications: rows });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ message: "Failed to fetch notifications." });
  }
}

async function markNotificationAsRead(req, res) {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;
    const [result] = await pool.execute(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );
    return res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return res.status(500).json({ message: "Failed to update notification." });
  }
}

module.exports = {
  getAllApplications,
  getApplicationById,
  getMyApplications,
  getMyApplicationById,
  createApplication,
  createBeneficiary,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
  deleteDraftApplication,
  withdrawApplication,
  exportApplications,
  uploadDocument,
  deleteDocument,
  getBursaryStats,
  getBursaryReports,
  getBeneficiaries,
  getBeneficiaryById,
  exportBeneficiaries,
  getBeneficiaryFilterOptions,
  getPayments,
  createPayment,
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getNotifications,
  markNotificationAsRead,
  getAuditLogs,
  addAuditLog,
  BURSARY_STATUS,
  INSTITUTION_TYPES,
  DOCUMENT_TYPES,
};
