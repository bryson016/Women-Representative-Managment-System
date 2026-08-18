const cloudinary = require("../config/cloudinary");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");

// Helper: Format file size
function formatFileSize(bytes) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Helper: Generate unique file name
function generateFileName(originalName) {
  const ext = originalName.split(".").pop();
  const baseName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_");
  return `${baseName}_${Date.now()}_${uuidv4().slice(0, 8)}.${ext}`;
}

// ============================================================
// IMAGE CRUD OPERATIONS
// ============================================================

// Upload single or multiple images
async function uploadImages(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    const userId = req.user?.id || null;
    const userName = req.user?.fullName || req.user?.username || "Admin";
    const { title, description, category_id, event, project, upload_date } = req.body;

    const uploadedImages = [];

    for (const file of req.files) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: `Invalid file type: ${file.originalname}. Only JPG, JPEG, PNG, and WEBP are allowed.`,
        });
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return res.status(400).json({
          message: `File too large: ${file.originalname}. Maximum size is 10MB.`,
        });
      }

      // Generate unique file name
      const fileName = generateFileName(file.originalname);

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "ward_management/images",
            public_id: `ward_img_${Date.now()}_${uuidv4().slice(0, 8)}`,
            resource_type: "image",
            transformation: [{ width: 1200, height: 800, crop: "limit", quality: "auto" }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      // Save to database
      const [imageResult] = await pool.query(
        `INSERT INTO images 
         (image_name, image_path, image_url, title, description, category_id, event, project, uploaded_by, file_size, file_type, width, height, upload_date, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          fileName,
          result.secure_url,
          result.secure_url,
          title || file.originalname.replace(/\.[^/.]+$/, ""),
          description || null,
          category_id || null,
          event || null,
          project || null,
          userId,
          file.size,
          file.mimetype,
          result.width,
          result.height,
          upload_date || new Date().toISOString().split("T")[0],
        ]
      );

      const imageId = imageResult.insertId;

      // Log activity
      await pool.query(
        "INSERT INTO system_activities (activity, user_id, user_name, details, status, created_at) VALUES (?, ?, ?, ?, 'Success', NOW())",
        [
          "Image Upload",
          userId,
          userName,
          `Uploaded image: ${fileName} (${file.mimetype}, ${formatFileSize(file.size)})`,
        ]
      );

      uploadedImages.push({
        id: imageId,
        imageName: fileName,
        imageUrl: result.secure_url,
        title: title || file.originalname.replace(/\.[^/.]+$/, ""),
        fileSize: file.size,
        fileType: file.mimetype,
        width: result.width,
        height: result.height,
      });
    }

    res.status(201).json({
      message: `${uploadedImages.length} image(s) uploaded successfully.`,
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Upload images error:", error);
    res.status(500).json({ message: "Failed to upload images." });
  }
}

// Get all images with filters
async function getImages(req, res) {
  try {
    const {
      search = "",
      category = "",
      event = "",
      project = "",
      date_from = "",
      date_to = "",
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = "WHERE i.status = 'active'";
    const params = [];

    if (search) {
      whereClause += " AND (i.title LIKE ? OR i.description LIKE ? OR i.image_name LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      whereClause += " AND i.category_id = ?";
      params.push(category);
    }

    if (event) {
      whereClause += " AND i.event LIKE ?";
      params.push(`%${event}%`);
    }

    if (project) {
      whereClause += " AND i.project LIKE ?";
      params.push(`%${project}%`);
    }

    if (date_from) {
      whereClause += " AND i.upload_date >= ?";
      params.push(date_from);
    }

    if (date_to) {
      whereClause += " AND i.upload_date <= ?";
      params.push(date_to);
    }

    // Sorting
    let orderBy = "ORDER BY i.created_at DESC";
    if (sort === "oldest") orderBy = "ORDER BY i.created_at ASC";
    else if (sort === "title_asc") orderBy = "ORDER BY i.title ASC";
    else if (sort === "title_desc") orderBy = "ORDER BY i.title DESC";
    else if (sort === "size_asc") orderBy = "ORDER BY i.file_size ASC";
    else if (sort === "size_desc") orderBy = "ORDER BY i.file_size DESC";

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM images i ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    // Get images
    const [rows] = await pool.query(
      `SELECT i.*, c.name as category_name, c.color as category_color,
              u.full_name as uploaded_by_name
       FROM images i
       LEFT JOIN image_categories c ON i.category_id = c.id
       LEFT JOIN users u ON i.uploaded_by = u.id
       ${whereClause}
       ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.status(200).json({
      images: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get images error:", error);
    res.status(500).json({ message: "Failed to fetch images." });
  }
}

// Get single image by ID
async function getImageById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT i.*, c.name as category_name, c.color as category_color,
              u.full_name as uploaded_by_name
       FROM images i
       LEFT JOIN image_categories c ON i.category_id = c.id
       LEFT JOIN users u ON i.uploaded_by = u.id
       WHERE i.id = ? AND i.status != 'deleted'`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Image not found." });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Get image by ID error:", error);
    res.status(500).json({ message: "Failed to fetch image." });
  }
}

// Update image information
async function updateImage(req, res) {
  try {
    const { id } = req.params;
    const { title, description, category_id, event, project, upload_date, status } = req.body;

    // Check if image exists
    const [existing] = await pool.query("SELECT * FROM images WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Image not found." });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push("title = ?"); params.push(title); }
    if (description !== undefined) { updates.push("description = ?"); params.push(description); }
    if (category_id !== undefined) { updates.push("category_id = ?"); params.push(category_id); }
    if (event !== undefined) { updates.push("event = ?"); params.push(event); }
    if (project !== undefined) { updates.push("project = ?"); params.push(project); }
    if (upload_date !== undefined) { updates.push("upload_date = ?"); params.push(upload_date); }
    if (status !== undefined) { updates.push("status = ?"); params.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    params.push(id);
    await pool.query(`UPDATE images SET ${updates.join(", ")} WHERE id = ?`, params);

    // Log activity
    const userId = req.user?.id || null;
    const userName = req.user?.fullName || req.user?.username || "Admin";
    await pool.query(
      "INSERT INTO system_activities (activity, user_id, user_name, details, status, created_at) VALUES (?, ?, ?, ?, 'Success', NOW())",
      ["Image Update", userId, userName, `Updated image ID: ${id}`]
    );

    // Return updated image
    const [updated] = await pool.query(
      `SELECT i.*, c.name as category_name, c.color as category_color,
              u.full_name as uploaded_by_name
       FROM images i
       LEFT JOIN image_categories c ON i.category_id = c.id
       LEFT JOIN users u ON i.uploaded_by = u.id
       WHERE i.id = ?`,
      [id]
    );

    res.status(200).json({
      message: "Image updated successfully.",
      image: updated[0],
    });
  } catch (error) {
    console.error("Update image error:", error);
    res.status(500).json({ message: "Failed to update image." });
  }
}

// Delete image (soft delete)
async function deleteImage(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query("SELECT * FROM images WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Image not found." });
    }

    // Soft delete
    await pool.query("UPDATE images SET status = 'deleted' WHERE id = ?", [id]);

    // Log activity
    const userId = req.user?.id || null;
    const userName = req.user?.fullName || req.user?.username || "Admin";
    await pool.query(
      "INSERT INTO system_activities (activity, user_id, user_name, details, status, created_at) VALUES (?, ?, ?, ?, 'Success', NOW())",
      ["Image Delete", userId, userName, `Deleted image: ${existing[0].image_name}`]
    );

    res.status(200).json({ message: "Image deleted successfully." });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({ message: "Failed to delete image." });
  }
}

// ============================================================
// CATEGORY OPERATIONS
// ============================================================

// Get all categories
async function getCategories(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT c.*, COUNT(i.id) as image_count FROM image_categories c LEFT JOIN images i ON c.id = i.category_id AND i.status = 'active' GROUP BY c.id ORDER BY c.name ASC"
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Failed to fetch categories." });
  }
}

// Create category
async function createCategory(req, res) {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required." });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const [result] = await pool.query(
      "INSERT INTO image_categories (name, slug, description, color) VALUES (?, ?, ?, ?)",
      [name, slug, description || null, color || "#7c3aed"]
    );

    const categoryId = result.insertId;

    // Log activity
    const userId = req.user?.id || null;
    const userName = req.user?.fullName || req.user?.username || "Admin";
    await pool.query(
      "INSERT INTO system_activities (activity, user_id, user_name, details, status, created_at) VALUES (?, ?, ?, ?, 'Success', NOW())",
      ["Category Created", userId, userName, `Created category: ${name}`]
    );

    res.status(201).json({
      message: "Category created successfully.",
      category: { id: categoryId, name, slug, description, color },
    });
  } catch (error) {
    console.error("Create category error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Category with this name already exists." });
    }
    res.status(500).json({ message: "Failed to create category." });
  }
}

// Update category
async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description, color, is_active } = req.body;

    const [existing] = await pool.query("SELECT * FROM image_categories WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push("name = ?");
      params.push(name);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      updates.push("slug = ?");
      params.push(slug);
    }
    if (description !== undefined) { updates.push("description = ?"); params.push(description); }
    if (color !== undefined) { updates.push("color = ?"); params.push(color); }
    if (is_active !== undefined) { updates.push("is_active = ?"); params.push(is_active); }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update." });
    }

    params.push(id);
    await pool.query(`UPDATE image_categories SET ${updates.join(", ")} WHERE id = ?`, params);

    res.status(200).json({ message: "Category updated successfully." });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Failed to update category." });
  }
}

// Delete category
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await pool.query("SELECT * FROM image_categories WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Set images in this category to uncategorized (NULL)
    await pool.query("UPDATE images SET category_id = NULL WHERE category_id = ?", [id]);
    await pool.query("DELETE FROM image_categories WHERE id = ?", [id]);

    res.status(200).json({ message: "Category deleted successfully." });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Failed to delete category." });
  }
}

// ============================================================
// DASHBOARD STATS
// ============================================================

async function getImageStats(req, res) {
  try {
    const [totalImages] = await pool.query("SELECT COUNT(*) as count FROM images WHERE status = 'active'");
    const [totalCategories] = await pool.query("SELECT COUNT(*) as count FROM image_categories WHERE is_active = TRUE");

    const currentMonth = new Date().toISOString().slice(0, 7);
    const [imagesThisMonth] = await pool.query(
      "SELECT COUNT(*) as count FROM images WHERE status = 'active' AND DATE_FORMAT(created_at, '%Y-%m') = ?",
      [currentMonth]
    );

    const [storageResult] = await pool.query(
      "SELECT SUM(file_size) as total FROM images WHERE status = 'active'"
    );

    const [recentImages] = await pool.query(
      `SELECT i.id, i.title, i.image_url, i.upload_date, u.full_name as uploaded_by_name, c.name as category_name
       FROM images i
       LEFT JOIN users u ON i.uploaded_by = u.id
       LEFT JOIN image_categories c ON i.category_id = c.id
       WHERE i.status = 'active'
       ORDER BY i.created_at DESC
       LIMIT 6`
    );

    const [recentEvents] = await pool.query(
      `SELECT DISTINCT event, COUNT(*) as image_count, MAX(upload_date) as latest_date
       FROM images
       WHERE status = 'active' AND event IS NOT NULL AND event != ''
       GROUP BY event
       ORDER BY latest_date DESC
       LIMIT 5`
    );

    const [activityData] = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM images
       WHERE status = 'active' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    res.status(200).json({
      totalImages: totalImages[0]?.count || 0,
      totalCategories: totalCategories[0]?.count || 0,
      imagesThisMonth: imagesThisMonth[0]?.count || 0,
      storageUsed: storageResult[0]?.total || 0,
      storageUsedFormatted: formatFileSize(storageResult[0]?.total || 0),
      recentImages,
      recentEvents,
      activityData,
    });
  } catch (error) {
    console.error("Get image stats error:", error);
    res.status(500).json({ message: "Failed to fetch image statistics." });
  }
}

module.exports = {
  uploadImages,
  getImages,
  getImageById,
  updateImage,
  deleteImage,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getImageStats,
};
