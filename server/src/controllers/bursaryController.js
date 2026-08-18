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
        parentFullName,
        parentRelationship,
        parentPhone,
        parentOccupation || null,
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

    return res.status(200).json({
      message: `Application status updated to ${status.replace("_", " ")}.`,
    });
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

    let whereClause = "WHERE 1=1";
    const params = [];

    if (userRole !== "admin" && userWard) {
      whereClause += " AND ward = ?";
      params.push(userWard);
    }

    const [statsRows] = await pool.execute(
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
       FROM bursary_applications ${whereClause}`,
      params
    );

    const stats = statsRows[0] || {};

    return res.status(200).json({
      totalApplications: stats.total_applications || 0,
      pending: stats.pending || 0,
      underReview: stats.under_review || 0,
      verified: stats.verified || 0,
      approved: stats.approved || 0,
      rejected: stats.rejected || 0,
      disbursed: stats.disbursed || 0,
      totalAmountRequested: parseFloat(stats.total_amount_requested || 0),
      totalAmountApproved: parseFloat(stats.total_amount_approved || 0),
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
// GET BENEFICIARIES (Approved/Disbursed applications)
// ============================================================

async function getBeneficiaries(req, res) {
  try {
    const { search = "", ward = "", institutionType = "", academicYear = "", page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const userRole = req.user?.role?.toLowerCase();
    const userWard = req.user?.ward;

    let whereClause = "WHERE status IN ('Approved', 'Disbursed')";
    const params = [];

    if (userRole !== "admin" && userWard) {
      whereClause += " AND ward = ?";
      params.push(userWard);
    }

    if (search) {
      whereClause += " AND (full_name LIKE ? OR national_id LIKE ? OR application_number LIKE ? OR institution_name LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
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

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM bursary_applications ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    const [rows] = await pool.execute(
      `SELECT ba.*, u.full_name AS submitted_by_name, r.full_name AS reviewed_by_name
       FROM bursary_applications ba
       LEFT JOIN users u ON ba.user_id = u.id
       LEFT JOIN users r ON ba.reviewed_by = r.id
       ${whereClause}
       ORDER BY ba.approved_at DESC, ba.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const beneficiaries = rows.map(formatBursaryApplication);

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
// GET PAYMENTS (Disbursed applications)
// ============================================================

async function getPayments(req, res) {
  try {
    const { search = "", ward = "", status = "", page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const userRole = req.user?.role?.toLowerCase();
    const userWard = req.user?.ward;

    let whereClause = "WHERE status = 'Disbursed'";
    const params = [];

    if (userRole !== "admin" && userWard) {
      whereClause += " AND ward = ?";
      params.push(userWard);
    }

    if (search) {
      whereClause += " AND (full_name LIKE ? OR national_id LIKE ? OR application_number LIKE ? OR institution_name LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (ward) {
      whereClause += " AND ward = ?";
      params.push(ward);
    }

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM bursary_applications ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    const [rows] = await pool.execute(
      `SELECT ba.*, u.full_name AS submitted_by_name, r.full_name AS reviewed_by_name
       FROM bursary_applications ba
       LEFT JOIN users u ON ba.user_id = u.id
       LEFT JOIN users r ON ba.reviewed_by = r.id
       ${whereClause}
       ORDER BY ba.disbursed_at DESC, ba.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const payments = rows.map(formatBursaryApplication);

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
  getPayments,
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getNotifications,
  markNotificationAsRead,
  BURSARY_STATUS,
  INSTITUTION_TYPES,
  DOCUMENT_TYPES,
};
