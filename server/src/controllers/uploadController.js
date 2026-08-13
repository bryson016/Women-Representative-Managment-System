const cloudinary = require("../config/cloudinary");
const { v4: uuidv4 } = require("uuid");

// We use raw mysql pool for now since Prisma client may not be generated yet
const pool = require("../config/db");

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const userId = req.user?.id || null;
    const userName = req.user?.fullName || req.user?.username || "Admin";

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "ward_management",
          public_id: `ward_${Date.now()}_${uuidv4().slice(0, 8)}`,
          resource_type: "auto",
          transformation: [{ width: 800, height: 800, crop: "limit" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    // Save to database
    const [mediaResult] = await pool.query(
      `INSERT INTO media 
       (public_id, url, secure_url, format, resource_type, width, height, bytes, original_name, mime_type, uploaded_by, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        result.public_id,
        result.url,
        result.secure_url,
        result.format,
        result.resource_type,
        result.width,
        result.height,
        result.bytes,
        req.file.originalname,
        req.file.mimetype,
        userId,
      ]
    );

    const mediaId = mediaResult.insertId;

    // Log activity
    await pool.query(
      "INSERT INTO system_activities (activity, user_id, user_name, details, status, created_at) VALUES (?, ?, ?, ?, 'Success', NOW())",
      [
        "Image Upload",
        userId,
        userName,
        `Uploaded image: ${req.file.originalname} (${result.format}, ${result.width}x${result.height})`,
      ]
    );

    res.status(201).json({
      message: "Image uploaded successfully.",
      media: {
        id: mediaId,
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        resourceType: result.resource_type,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error("Upload image error:", error);
    res.status(500).json({ message: "Failed to upload image." });
  }
}

async function deleteImage(req, res) {
  try {
    const { publicId } = req.params;
    const userId = req.user?.id || null;
    const userName = req.user?.fullName || req.user?.username || "Admin";

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Delete from database
    await pool.query("DELETE FROM media WHERE public_id = ?", [publicId]);

    // Log activity
    await pool.query(
      "INSERT INTO system_activities (activity, user_id, user_name, details, status, created_at) VALUES (?, ?, ?, ?, 'Success', NOW())",
      ["Image Delete", userId, userName, `Deleted image: ${publicId}`]
    );

    res.status(200).json({ message: "Image deleted successfully." });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({ message: "Failed to delete image." });
  }
}

async function getMedia(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM media ORDER BY created_at DESC LIMIT 50"
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Get media error:", error);
    res.status(500).json({ message: "Failed to fetch media." });
  }
}

module.exports = {
  uploadImage,
  deleteImage,
  getMedia,
};
