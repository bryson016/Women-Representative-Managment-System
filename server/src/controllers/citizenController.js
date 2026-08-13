const pool = require("../config/db");

// ============================================================
// CITIZEN PROFILE
// ============================================================

async function getCitizenProfile(req, res) {
  try {
    const userId = req.user.id;

    const [userRows] = await pool.execute(
      `SELECT id, full_name, username, role, ward, email, phone_number, is_active, last_login_at, created_at, updated_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = userRows[0];

    // Get citizen details if exists
    const [citizenRows] = await pool.execute(
      `SELECT id, national_id, first_name, last_name, gender, date_of_birth, phone_number, email,
              occupation, village, sub_location, ward, physical_address, emergency_contact,
              photo_url, status, registration_date
       FROM citizens
       WHERE user_id = ?
       LIMIT 1`,
      [userId]
    );

    const citizen = citizenRows.length > 0 ? citizenRows[0] : null;

    return res.status(200).json({
      user: {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        role: user.role,
        ward: user.ward,
        email: user.email,
        phoneNumber: user.phone_number,
        isActive: user.is_active,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      citizen: citizen ? {
        id: citizen.id,
        nationalId: citizen.national_id,
        firstName: citizen.first_name,
        lastName: citizen.last_name,
        gender: citizen.gender,
        dateOfBirth: citizen.date_of_birth,
        phoneNumber: citizen.phone_number,
        email: citizen.email,
        occupation: citizen.occupation,
        village: citizen.village,
        subLocation: citizen.sub_location,
        ward: citizen.ward,
        physicalAddress: citizen.physical_address,
        emergencyContact: citizen.emergency_contact,
        photoUrl: citizen.photo_url,
        status: citizen.status,
        registrationDate: citizen.registration_date,
      } : null,
    });
  } catch (error) {
    console.error("Get citizen profile error:", error);
    return res.status(500).json({ message: "Failed to fetch profile." });
  }
}

async function updateCitizenProfile(req, res) {
  try {
    const userId = req.user.id;
    const { fullName, email, phoneNumber, ward, firstName, lastName, gender, dateOfBirth, occupation, village, subLocation, physicalAddress, emergencyContact } = req.body;

    // Update users table
    await pool.execute(
      `UPDATE users SET full_name = ?, email = ?, phone_number = ?, ward = ?, updated_at = NOW() WHERE id = ?`,
      [fullName, email, phoneNumber, ward, userId]
    );

    // Update or insert citizen details
    const [citizenRows] = await pool.execute(
      `SELECT id FROM citizens WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (citizenRows.length > 0) {
      await pool.execute(
        `UPDATE citizens SET first_name = ?, last_name = ?, gender = ?, date_of_birth = ?, phone_number = ?,
         email = ?, occupation = ?, village = ?, sub_location = ?, ward = ?, physical_address = ?, emergency_contact = ?, updated_at = NOW()
         WHERE user_id = ?`,
        [firstName, lastName, gender, dateOfBirth, phoneNumber, email, occupation, village, subLocation, ward, physicalAddress, emergencyContact, userId]
      );
    } else {
      await pool.execute(
        `INSERT INTO citizens (user_id, national_id, first_name, last_name, gender, date_of_birth, phone_number, email,
         occupation, village, sub_location, ward, physical_address, emergency_contact, status, registration_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [userId, `PENDING-${userId}`, firstName, lastName, gender, dateOfBirth, phoneNumber, email, occupation, village, subLocation, ward, physicalAddress, emergencyContact, "Active"]
      );
    }

    return res.status(200).json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("Update citizen profile error:", error);
    return res.status(500).json({ message: "Failed to update profile." });
  }
}

// ============================================================
// CITIZEN COMPLAINTS
// ============================================================

async function getCitizenComplaints(req, res) {
  try {
    const userId = req.user.id;

    // Get citizen ID from user ID
    const [citizenRows] = await pool.execute(
      `SELECT id FROM citizens WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (citizenRows.length === 0) {
      return res.status(200).json({ complaints: [] });
    }

    const citizenId = citizenRows[0].id;

    const [complaints] = await pool.execute(
      `SELECT c.id, c.complaint_code, c.citizen_name, c.category, c.priority, c.status, c.village,
              c.description, c.date_reported, c.last_updated, c.resolved_at, c.officer_notes, c.resolution_notes,
              s.first_name AS officer_first_name, s.last_name AS officer_last_name
       FROM complaints c
       LEFT JOIN staff s ON c.assigned_officer_id = s.id
       WHERE c.citizen_id = ?
       ORDER BY c.created_at DESC`,
      [citizenId]
    );

    const formatted = complaints.map((c) => ({
      id: c.id,
      complaintCode: c.complaint_code,
      citizenName: c.citizen_name,
      category: c.category,
      priority: c.priority,
      status: c.status,
      village: c.village,
      description: c.description,
      dateReported: c.date_reported,
      lastUpdated: c.last_updated,
      resolvedAt: c.resolved_at,
      officerNotes: c.officer_notes,
      resolutionNotes: c.resolution_notes,
      assignedOfficer: c.officer_first_name && c.officer_last_name
        ? `${c.officer_first_name} ${c.officer_last_name}`
        : null,
    }));

    return res.status(200).json({ complaints: formatted });
  } catch (error) {
    console.error("Get citizen complaints error:", error);
    return res.status(500).json({ message: "Failed to fetch complaints." });
  }
}

async function getCitizenComplaintDetails(req, res) {
  try {
    const userId = req.user.id;
    const complaintId = req.params.id;

    // Get citizen ID
    const [citizenRows] = await pool.execute(
      `SELECT id FROM citizens WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (citizenRows.length === 0) {
      return res.status(404).json({ message: "Citizen profile not found." });
    }

    const citizenId = citizenRows[0].id;

    // Get complaint
    const [complaintRows] = await pool.execute(
      `SELECT c.id, c.complaint_code, c.citizen_id, c.citizen_name, c.national_id, c.phone_number,
              c.category, c.priority, c.status, c.village, c.description, c.officer_notes,
              c.resolution_notes, c.date_reported, c.last_updated, c.resolved_at,
              s.first_name AS officer_first_name, s.last_name AS officer_last_name, s.phone_number AS officer_phone
       FROM complaints c
       LEFT JOIN staff s ON c.assigned_officer_id = s.id
       WHERE c.id = ? AND c.citizen_id = ?
       LIMIT 1`,
      [complaintId, citizenId]
    );

    if (complaintRows.length === 0) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    const c = complaintRows[0];

    // Get communications/updates
    const [communications] = await pool.execute(
      `SELECT id, date, action, performed_by, notes, created_at
       FROM complaint_communications
       WHERE complaint_id = ?
       ORDER BY created_at DESC`,
      [complaintId]
    );

    return res.status(200).json({
      complaint: {
        id: c.id,
        complaintCode: c.complaint_code,
        citizenName: c.citizen_name,
        nationalId: c.national_id,
        phoneNumber: c.phone_number,
        category: c.category,
        priority: c.priority,
        status: c.status,
        village: c.village,
        description: c.description,
        officerNotes: c.officer_notes,
        resolutionNotes: c.resolution_notes,
        dateReported: c.date_reported,
        lastUpdated: c.last_updated,
        resolvedAt: c.resolved_at,
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
      },
    });
  } catch (error) {
    console.error("Get complaint details error:", error);
    return res.status(500).json({ message: "Failed to fetch complaint details." });
  }
}

async function submitComplaint(req, res) {
  try {
    const userId = req.user.id;

    // Get citizen info
    const [citizenRows] = await pool.execute(
      `SELECT id, first_name, last_name, national_id, phone_number, ward, village FROM citizens WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    let citizenId = null;
    let citizenName = req.user.fullName;
    let nationalId = null;
    let phoneNumber = req.user.phoneNumber;
    let ward = req.user.ward || "Westlands";
    let village = "Unknown";

    if (citizenRows.length > 0) {
      citizenId = citizenRows[0].id;
      citizenName = `${citizenRows[0].first_name} ${citizenRows[0].last_name}`;
      nationalId = citizenRows[0].national_id;
      phoneNumber = citizenRows[0].phone_number;
      ward = citizenRows[0].ward;
      village = citizenRows[0].village;
    }

    const { category, priority, description, village: complaintVillage } = req.body;

    const finalVillage = complaintVillage || village;

    // Generate complaint code
    const [codeRows] = await pool.execute(
      `SELECT COUNT(*) AS count FROM complaints WHERE DATE(created_at) = CURDATE()`
    );
    const todayCount = codeRows[0].count + 1;
    const complaintCode = `CMP-${new Date().getFullYear()}-${String(todayCount).padStart(4, "0")}`;

    const [result] = await pool.execute(
      `INSERT INTO complaints (complaint_code, citizen_id, citizen_name, national_id, phone_number, category, priority, status, village, description, date_reported, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Open', ?, ?, CURDATE(), CURDATE())`,
      [complaintCode, citizenId, citizenName, nationalId, phoneNumber, category, priority || "Medium", finalVillage, description]
    );

    const complaintId = result.insertId;

    // Add initial communication
    await pool.execute(
      `INSERT INTO complaint_communications (complaint_id, date, action, performed_by, notes)
       VALUES (?, CURDATE(), 'Submitted', ?, 'Complaint submitted by citizen via dashboard')`,
      [complaintId, citizenName]
    );

    // Create notification for the citizen
    await pool.execute(
      `INSERT INTO notifications (user_id, type, title, message, related_id, related_type)
       VALUES (?, 'Complaint_Update', 'Complaint Submitted', ?, ?, 'complaint')`,
      [userId, `Your complaint ${complaintCode} has been submitted successfully.`, complaintId]
    );

    return res.status(201).json({
      message: "Complaint submitted successfully.",
      complaintId,
      complaintCode,
    });
  } catch (error) {
    console.error("Submit complaint error:", error);
    return res.status(500).json({ message: "Failed to submit complaint." });
  }
}

// ============================================================
// WARD PROJECTS
// ============================================================

async function getWardProjects(req, res) {
  try {
    const userWard = req.user.ward || "Westlands";

    const [projects] = await pool.execute(
      `SELECT id, project_code, project_name, category, ward, location, village, description,
              contractor_name, budget, amount_spent, funding_source, start_date, expected_completion,
              priority, project_manager_name, status, progress, financial_year
       FROM projects
       WHERE ward = ? AND status NOT IN ('Cancelled', 'Planning')
       ORDER BY created_at DESC`,
      [userWard]
    );

    const formatted = projects.map((p) => ({
      id: p.id,
      projectCode: p.project_code,
      projectName: p.project_name,
      category: p.category,
      ward: p.ward,
      location: p.location,
      village: p.village,
      description: p.description,
      contractorName: p.contractor_name,
      budget: parseFloat(p.budget),
      amountSpent: parseFloat(p.amount_spent),
      fundingSource: p.funding_source,
      startDate: p.start_date,
      expectedCompletion: p.expected_completion,
      priority: p.priority,
      projectManagerName: p.project_manager_name,
      status: p.status,
      progress: p.progress,
      financialYear: p.financial_year,
    }));

    return res.status(200).json({ projects: formatted });
  } catch (error) {
    console.error("Get ward projects error:", error);
    return res.status(500).json({ message: "Failed to fetch projects." });
  }
}

// ============================================================
// WARD MEETINGS
// ============================================================

async function getWardMeetings(req, res) {
  try {
    const userWard = req.user.ward || "Westlands";

    const [meetings] = await pool.execute(
      `SELECT id, meeting_code, title, type, priority, status, date, time, end_time, venue, village,
              chairperson, secretary, organizer, expected_attendance, actual_attendance, description
       FROM meetings
       WHERE (village IS NULL OR village = '' OR village IN (
         SELECT name FROM villages WHERE ward = ?
       ))
       AND status IN ('Scheduled', 'In_Progress')
       AND date >= CURDATE()
       ORDER BY date ASC, time ASC`,
      [userWard]
    );

    const formatted = meetings.map((m) => ({
      id: m.id,
      meetingCode: m.meeting_code,
      title: m.title,
      type: m.type,
      priority: m.priority,
      status: m.status,
      date: m.date,
      time: m.time,
      endTime: m.end_time,
      venue: m.venue,
      village: m.village,
      chairperson: m.chairperson,
      secretary: m.secretary,
      organizer: m.organizer,
      expectedAttendance: m.expected_attendance,
      actualAttendance: m.actual_attendance,
      description: m.description,
    }));

    return res.status(200).json({ meetings: formatted });
  } catch (error) {
    console.error("Get ward meetings error:", error);
    return res.status(500).json({ message: "Failed to fetch meetings." });
  }
}

// ============================================================
// ANNOUNCEMENTS
// ============================================================

async function getAnnouncements(req, res) {
  try {
    const userWard = req.user.ward || "Westlands";

    const [announcements] = await pool.execute(
      `SELECT id, title, description, category, ward, is_published, published_at, created_at, updated_at
       FROM announcements
       WHERE ward = ? AND is_published = 1
       ORDER BY created_at DESC
       LIMIT 50`,
      [userWard]
    );

    const formatted = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      category: a.category,
      ward: a.ward,
      isPublished: a.is_published,
      publishedAt: a.published_at,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));

    return res.status(200).json({ announcements: formatted });
  } catch (error) {
    console.error("Get announcements error:", error);
    return res.status(500).json({ message: "Failed to fetch announcements." });
  }
}

// ============================================================
// NOTIFICATIONS
// ============================================================

async function getNotifications(req, res) {
  try {
    const userId = req.user.id;

    const [notifications] = await pool.execute(
      `SELECT id, user_id, type, title, message, related_id, related_type, is_read, read_at, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    const formatted = notifications.map((n) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      relatedId: n.related_id,
      relatedType: n.related_type,
      isRead: n.is_read,
      readAt: n.read_at,
      createdAt: n.created_at,
    }));

    // Count unread
    const [unreadRows] = await pool.execute(
      `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    return res.status(200).json({
      notifications: formatted,
      unreadCount: unreadRows[0].count,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ message: "Failed to fetch notifications." });
  }
}

async function markNotificationAsRead(req, res) {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    await pool.execute(
      `UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?`,
      [notificationId, userId]
    );

    return res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return res.status(500).json({ message: "Failed to update notification." });
  }
}

async function markAllNotificationsAsRead(req, res) {
  try {
    const userId = req.user.id;

    await pool.execute(
      `UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0`,
      [userId]
    );

    return res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return res.status(500).json({ message: "Failed to update notifications." });
  }
}

module.exports = {
  getCitizenProfile,
  updateCitizenProfile,
  getCitizenComplaints,
  getCitizenComplaintDetails,
  submitComplaint,
  getWardProjects,
  getWardMeetings,
  getAnnouncements,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
