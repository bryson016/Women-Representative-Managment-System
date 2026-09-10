const pool = require("../config/db");

// Get all projects for the admin
async function getAllProjects(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, project_code, project_name, category, ward, location, village, description,
              contractor_name, budget, amount_spent, funding_source, start_date, expected_completion,
              priority, project_manager_name, status, progress, financial_year, created_at, updated_at
       FROM projects
       ORDER BY created_at DESC`
    );

    const projects = rows.map((p) => ({
      id: p.id,
      projectCode: p.project_code,
      projectName: p.project_name,
      category: p.category,
      ward: p.ward,
      location: p.location,
      village: p.village,
      description: p.description,
      contractor: p.contractor_name,
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
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Get all projects error:", error);
    return res.status(500).json({ message: "Failed to fetch projects." });
  }
}

// Get a single project by ID
async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT id, project_code, project_name, category, ward, location, village, description,
              contractor_name, budget, amount_spent, funding_source, start_date, expected_completion,
              priority, project_manager_name, status, progress, financial_year, created_at, updated_at
       FROM projects
       WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Project not found." });
    }

    const p = rows[0];
    const project = {
      id: p.id,
      projectCode: p.project_code,
      projectName: p.project_name,
      category: p.category,
      ward: p.ward,
      location: p.location,
      village: p.village,
      description: p.description,
      contractor: p.contractor_name,
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
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };

    return res.status(200).json({ project });
  } catch (error) {
    console.error("Get project error:", error);
    return res.status(500).json({ message: "Failed to fetch project." });
  }
}

// Create a new project
async function createProject(req, res) {
  try {
    const {
      projectCode,
      projectName,
      category,
      ward,
      location,
      village,
      description,
      contractorName,
      budget,
      amountSpent,
      fundingSource,
      startDate,
      expectedCompletion,
      priority,
      projectManagerName,
      status,
      progress,
      financialYear,
    } = req.body;

    if (!projectCode || !projectName || !category || !ward) {
      return res.status(400).json({ message: "Project code, name, category, and ward are required." });
    }

    const [result] = await pool.execute(
      `INSERT INTO projects
       (project_code, project_name, category, ward, location, village, description,
        contractor_name, budget, amount_spent, funding_source, start_date, expected_completion,
        priority, project_manager_name, status, progress, financial_year)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectCode,
        projectName,
        category,
        ward,
        location || null,
        village || null,
        description || null,
        contractorName || null,
        budget || 0,
        amountSpent || 0,
        fundingSource || null,
        startDate || null,
        expectedCompletion || null,
        priority || "Medium",
        projectManagerName || null,
        status || "Planning",
        progress || 0,
        financialYear || null,
      ]
    );

    const project = {
      id: result.insertId,
      projectCode,
      projectName,
      category,
      ward,
      location,
      village,
      description,
      contractor: contractorName,
      contractorName,
      budget: parseFloat(budget || 0),
      amountSpent: parseFloat(amountSpent || 0),
      fundingSource,
      startDate,
      expectedCompletion,
      priority: priority || "Medium",
      projectManagerName,
      status: status || "Planning",
      progress: progress || 0,
      financialYear,
    };

    return res.status(201).json({ project });
  } catch (error) {
    console.error("Create project error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Project code already exists." });
    }
    return res.status(500).json({ message: "Failed to create project." });
  }
}

// Update a project
async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const {
      projectCode,
      projectName,
      category,
      ward,
      location,
      village,
      description,
      contractorName,
      budget,
      amountSpent,
      fundingSource,
      startDate,
      expectedCompletion,
      priority,
      projectManagerName,
      status,
      progress,
      financialYear,
    } = req.body;

    const [result] = await pool.execute(
      `UPDATE projects SET
       project_code = ?, project_name = ?, category = ?, ward = ?, location = ?, village = ?,
       description = ?, contractor_name = ?, budget = ?, amount_spent = ?, funding_source = ?,
       start_date = ?, expected_completion = ?, priority = ?, project_manager_name = ?,
       status = ?, progress = ?, financial_year = ?
       WHERE id = ?`,
      [
        projectCode,
        projectName,
        category,
        ward,
        location || null,
        village || null,
        description || null,
        contractorName || null,
        budget || 0,
        amountSpent || 0,
        fundingSource || null,
        startDate || null,
        expectedCompletion || null,
        priority || "Medium",
        projectManagerName || null,
        status || "Planning",
        progress || 0,
        financialYear || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project not found." });
    }

    const project = {
      id: parseInt(id),
      projectCode,
      projectName,
      category,
      ward,
      location,
      village,
      description,
      contractor: contractorName,
      contractorName,
      budget: parseFloat(budget || 0),
      amountSpent: parseFloat(amountSpent || 0),
      fundingSource,
      startDate,
      expectedCompletion,
      priority: priority || "Medium",
      projectManagerName,
      status: status || "Planning",
      progress: progress || 0,
      financialYear,
    };

    return res.status(200).json({ project });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({ message: "Failed to update project." });
  }
}

// Delete a project
async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM projects WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Project not found." });
    }

    return res.status(200).json({ message: "Project deleted successfully." });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({ message: "Failed to delete project." });
  }
}

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
