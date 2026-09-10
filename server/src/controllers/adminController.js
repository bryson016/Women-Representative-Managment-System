const pool = require("../config/db");

function normalizeStatus(status) {
  if (!status) return status;
  return String(status).replace(/\s+/g, "_");
}

// ============================================================
// ADMIN COMPLAINTS
// ============================================================

async function getAllComplaints(req, res) {
  try {
    const { status, category, priority, village, search, page = 1, limit = 50 } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (status) {
      whereClause += " AND c.status = ?";
      params.push(status);
    }
    if (category) {
      whereClause += " AND c.category = ?";
      params.push(category);
    }
    if (priority) {
      whereClause += " AND c.priority = ?";
      params.push(priority);
    }
    if (village) {
      whereClause += " AND c.village = ?";
      params.push(village);
    }
    if (search) {
      whereClause += " AND (c.citizen_name LIKE ? OR c.complaint_code LIKE ? OR c.description LIKE ? OR c.national_id LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM complaints c ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    // Get complaints
    const [complaints] = await pool.execute(
      `SELECT c.id, c.complaint_code, c.citizen_id, c.citizen_name, c.national_id, c.phone_number,
              c.category, c.priority, c.status, c.village, c.description, c.officer_notes,
              c.resolution_notes, c.date_reported, c.last_updated, c.resolved_at, c.created_at,
              s.first_name AS officer_first_name, s.last_name AS officer_last_name, s.phone_number AS officer_phone
       FROM complaints c
       LEFT JOIN staff s ON c.assigned_officer_id = s.id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const formatted = complaints.map((c) => ({
      id: c.id,
      complaintCode: c.complaint_code,
      citizenId: c.citizen_id,
      citizenName: c.citizen_name,
      nationalId: c.national_id,
      phoneNumber: c.phone_number,
      category: c.category,
      priority: c.priority,
      status: normalizeStatus(c.status),
      village: c.village,
      description: c.description,
      officerNotes: c.officer_notes,
      resolutionNotes: c.resolution_notes,
      dateReported: c.date_reported,
      lastUpdated: c.last_updated,
      resolvedAt: c.resolved_at,
      createdAt: c.created_at,
      assignedOfficer: c.officer_first_name && c.officer_last_name
        ? `${c.officer_first_name} ${c.officer_last_name}`
        : null,
      officerPhone: c.officer_phone,
    }));

    return res.status(200).json({
      complaints: formatted,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all complaints error:", error);
    return res.status(500).json({ message: "Failed to fetch complaints." });
  }
}

async function getComplaintById(req, res) {
  try {
    const complaintId = req.params.id;

    const [complaintRows] = await pool.execute(
      `SELECT c.id, c.complaint_code, c.citizen_id, c.citizen_name, c.national_id, c.phone_number,
              c.category, c.priority, c.status, c.village, c.description, c.officer_notes,
              c.resolution_notes, c.date_reported, c.last_updated, c.resolved_at, c.created_at,
              s.first_name AS officer_first_name, s.last_name AS officer_last_name, s.phone_number AS officer_phone
       FROM complaints c
       LEFT JOIN staff s ON c.assigned_officer_id = s.id
       WHERE c.id = ?
       LIMIT 1`,
      [complaintId]
    );

    if (complaintRows.length === 0) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    const c = complaintRows[0];

    // Get communications
    const [communications] = await pool.execute(
      `SELECT id, date, action, performed_by, notes, created_at
       FROM complaint_communications
       WHERE complaint_id = ?
       ORDER BY created_at DESC`,
      [complaintId]
    );

    // Get attachments
    const [attachments] = await pool.execute(
      `SELECT id, file_name, file_path, file_type, file_size, uploaded_at
       FROM complaint_attachments
       WHERE complaint_id = ?`,
      [complaintId]
    );

    return res.status(200).json({
      complaint: {
        id: c.id,
        complaintCode: c.complaint_code,
        citizenId: c.citizen_id,
        citizenName: c.citizen_name,
        nationalId: c.national_id,
        phoneNumber: c.phone_number,
        category: c.category,
        priority: c.priority,
        status: normalizeStatus(c.status),
        village: c.village,
        description: c.description,
        officerNotes: c.officer_notes,
        resolutionNotes: c.resolution_notes,
        dateReported: c.date_reported,
        lastUpdated: c.last_updated,
        resolvedAt: c.resolved_at,
        createdAt: c.created_at,
        assignedOfficer: c.officer_first_name && c.officer_last_name
          ? `${c.officer_first_name} ${c.officer_last_name}`
          : null,
        officerPhone: c.officer_phone,
        communications: communications.map((comm) => ({
          id: comm.id,
          date: comm.date,
          action: comm.action,
          performedBy: comm.performed_by,
          notes: comm.notes,
          createdAt: comm.created_at,
        })),
        attachments: attachments.map((att) => ({
          id: att.id,
          fileName: att.file_name,
          filePath: att.file_path,
          fileType: att.file_type,
          fileSize: att.file_size,
          uploadedAt: att.uploaded_at,
        })),
      },
    });
  } catch (error) {
    console.error("Get complaint by ID error:", error);
    return res.status(500).json({ message: "Failed to fetch complaint details." });
  }
}

async function updateComplaintStatus(req, res) {
  try {
    const complaintId = req.params.id;
    const { status, officerNotes, resolutionNotes, assignedOfficerId } = req.body;
    const adminId = req.user.id;
    const adminName = req.user.fullName || req.user.username;

    // Validate status
    const validStatuses = ["Open", "Assigned", "In_Progress", "Resolved", "Closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // Get current complaint
    const [complaintRows] = await pool.execute(
      `SELECT id, status, citizen_id, complaint_code FROM complaints WHERE id = ? LIMIT 1`,
      [complaintId]
    );

    if (complaintRows.length === 0) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    const currentComplaint = complaintRows[0];
    const previousStatus = currentComplaint.status;

    // Build update query
    const updateFields = ["status = ?", "last_updated = CURDATE()"];
    const updateParams = [status];

    if (officerNotes !== undefined) {
      updateFields.push("officer_notes = ?");
      updateParams.push(officerNotes);
    }
    if (resolutionNotes !== undefined) {
      updateFields.push("resolution_notes = ?");
      updateParams.push(resolutionNotes);
    }
    if (assignedOfficerId !== undefined) {
      updateFields.push("assigned_officer_id = ?");
      updateParams.push(assignedOfficerId);
    }

    updateParams.push(complaintId);

    await pool.execute(
      `UPDATE complaints SET ${updateFields.join(", ")} WHERE id = ?`,
      updateParams
    );

    // Add communication record
    const actionMap = {
      "Open": "Opened",
      "Assigned": "Assigned",
      "In_Progress": "In Progress",
      "Resolved": "Resolved",
      "Closed": "Closed",
    };
    const action = actionMap[status] || "Status Updated";

    await pool.execute(
      `INSERT INTO complaint_communications (complaint_id, date, action, performed_by, notes)
       VALUES (?, CURDATE(), ?, ?, ?)`,
      [complaintId, action, adminName, officerNotes || `Status changed from ${previousStatus} to ${status}`]
    );

    // Create notification for the citizen
    if (currentComplaint.citizen_id) {
      const notificationTitle = `Complaint ${currentComplaint.complaint_code} Updated`;
      const notificationMessage = `Your complaint status has been changed to "${status}".`;

      await pool.execute(
        `INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
         VALUES (?, 'Complaint_Update', ?, ?, ?, 'complaint')`,
        [currentComplaint.citizen_id, notificationTitle, notificationMessage, complaintId]
      );
    }

    return res.status(200).json({
      message: "Complaint status updated successfully.",
      complaintId,
      previousStatus,
      newStatus: status,
    });
  } catch (error) {
    console.error("Update complaint status error:", error);
    return res.status(500).json({ message: "Failed to update complaint status." });
  }
}

// ============================================================
// ADMIN CITIZENS
// ============================================================

async function getAllCitizens(req, res) {
  try {
    const { search, ward, status, page = 1, limit = 50 } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (search) {
      whereClause += " AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.national_id LIKE ? OR c.phone_number LIKE ? OR u.username LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (ward) {
      whereClause += " AND c.ward = ?";
      params.push(ward);
    }
    if (status) {
      whereClause += " AND c.status = ?";
      params.push(status);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM citizens c ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    // Get citizens
    const [citizens] = await pool.execute(
      `SELECT c.id, c.national_id, c.first_name, c.last_name, c.gender, c.date_of_birth,
              c.phone_number, c.email, c.occupation, c.village, c.sub_location, c.ward,
              c.physical_address, c.emergency_contact, c.photo_url, c.status, c.registration_date,
              c.created_at, c.updated_at, u.username, u.is_active
       FROM citizens c
       LEFT JOIN users u ON c.user_id = u.id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const formatted = citizens.map((c) => ({
      id: c.id,
      nationalId: c.national_id,
      firstName: c.first_name,
      lastName: c.last_name,
      fullName: `${c.first_name} ${c.last_name}`,
      gender: c.gender,
      dateOfBirth: c.date_of_birth,
      phoneNumber: c.phone_number,
      email: c.email,
      occupation: c.occupation,
      village: c.village,
      subLocation: c.sub_location,
      ward: c.ward,
      physicalAddress: c.physical_address,
      emergencyContact: c.emergency_contact,
      photoUrl: c.photo_url,
      status: c.status,
      registrationDate: c.registration_date,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      username: c.username,
      isActive: c.is_active,
    }));

    return res.status(200).json({
      citizens: formatted,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all citizens error:", error);
    return res.status(500).json({ message: "Failed to fetch citizens." });
  }
}

// ============================================================
// ADMIN NOTIFICATIONS
// ============================================================

async function getAllNotifications(req, res) {
  try {
    const { type, isRead, page = 1, limit = 50 } = req.query;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (type) {
      whereClause += " AND n.type = ?";
      params.push(type);
    }
    if (isRead !== undefined && isRead !== "") {
      whereClause += " AND n.is_read = ?";
      params.push(isRead === "true" || isRead === true ? 1 : 0);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM notifications n ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    // Get notifications with user info
    const [notifications] = await pool.execute(
      `SELECT n.id, n.user_id, n.type, n.title, n.message, n.related_id, n.related_type,
              n.is_read, n.read_at, n.created_at,
              u.full_name AS user_name, u.username, u.role AS user_role
       FROM notifications n
       LEFT JOIN users u ON n.user_id = u.id
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const formatted = notifications.map((n) => ({
      id: n.id,
      userId: n.user_id,
      userName: n.user_name,
      username: n.username,
      userRole: n.user_role,
      type: n.type,
      title: n.title,
      message: n.message,
      relatedId: n.related_id,
      relatedType: n.related_type,
      isRead: n.is_read,
      readAt: n.read_at,
      createdAt: n.created_at,
    }));

    // Get unread count
    const [unreadRows] = await pool.execute(
      `SELECT COUNT(*) AS count FROM notifications WHERE is_read = 0`
    );

    return res.status(200).json({
      notifications: formatted,
      unreadCount: unreadRows[0]?.count || 0,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all notifications error:", error);
    return res.status(500).json({ message: "Failed to fetch notifications." });
  }
}

async function markNotificationAsRead(req, res) {
  try {
    const notificationId = req.params.id;

    await pool.execute(
      `UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ?`,
      [notificationId]
    );

    return res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return res.status(500).json({ message: "Failed to update notification." });
  }
}

async function markAllNotificationsAsRead(req, res) {
  try {
    await pool.execute(
      `UPDATE notifications SET is_read = 1, read_at = NOW() WHERE is_read = 0`
    );

    return res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return res.status(500).json({ message: "Failed to update notifications." });
  }
}

// ============================================================
// ADMIN DASHBOARD STATS
// ============================================================

async function getDashboardStats(req, res) {
  try {
    // Total citizens
    const [citizenCount] = await pool.execute(
      `SELECT COUNT(*) AS count FROM citizens`
    );

    // Total complaints
    const [complaintCount] = await pool.execute(
      `SELECT COUNT(*) AS count FROM complaints`
    );

    // Complaints by status
    const [statusCounts] = await pool.execute(
      `SELECT status, COUNT(*) AS count FROM complaints GROUP BY status`
    );

    // New registrations this month
    const [newRegistrations] = await pool.execute(
      `SELECT COUNT(*) AS count FROM citizens WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`
    );

    // New complaints this month
    const [newComplaints] = await pool.execute(
      `SELECT COUNT(*) AS count FROM complaints WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`
    );

    // Unread notifications
    const [unreadNotifications] = await pool.execute(
      `SELECT COUNT(*) AS count FROM notifications WHERE is_read = 0`
    );

    // Recent complaints (last 5)
    const [recentComplaints] = await pool.execute(
      `SELECT c.id, c.complaint_code, c.citizen_name, c.category, c.status, c.date_reported, c.created_at
       FROM complaints c
       ORDER BY c.created_at DESC
       LIMIT 5`
    );

    // Recent citizens (last 5)
    const [recentCitizens] = await pool.execute(
      `SELECT c.id, c.first_name, c.last_name, c.ward, c.registration_date, c.created_at
       FROM citizens c
       ORDER BY c.created_at DESC
       LIMIT 5`
    );

    return res.status(200).json({
      stats: {
        totalCitizens: citizenCount[0]?.count || 0,
        totalComplaints: complaintCount[0]?.count || 0,
        newRegistrationsThisMonth: newRegistrations[0]?.count || 0,
        newComplaintsThisMonth: newComplaints[0]?.count || 0,
        unreadNotifications: unreadNotifications[0]?.count || 0,
        complaintsByStatus: statusCounts.reduce((acc, row) => {
          acc[row.status] = row.count;
          return acc;
        }, {}),
      },
      recentComplaints: recentComplaints.map((c) => ({
        id: c.id,
        complaintCode: c.complaint_code,
        citizenName: c.citizen_name,
        category: c.category,
        status: c.status,
        dateReported: c.date_reported,
        createdAt: c.created_at,
      })),
      recentCitizens: recentCitizens.map((c) => ({
        id: c.id,
        fullName: `${c.first_name} ${c.last_name}`,
        ward: c.ward,
        registrationDate: c.registration_date,
        createdAt: c.created_at,
      })),
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard stats." });
  }
}

module.exports = {
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  getAllCitizens,
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getDashboardStats,
};
