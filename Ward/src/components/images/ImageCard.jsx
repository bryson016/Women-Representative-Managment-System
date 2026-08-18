import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Pencil,
  Trash2,
  Calendar,
  User,
  FolderOpen,
  Tag,
} from "lucide-react";

function ImageCard({ image, onView, onEdit, onDelete, viewMode = "grid" }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (viewMode === "list") {
    return (
      <motion.div
        className="image-card-list"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="image-card-list-thumb">
          {!imageError ? (
            <img
              src={image.image_url}
              alt={image.title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{ opacity: imageLoaded ? 1 : 0 }}
            />
          ) : (
            <div className="image-placeholder">
              <FolderOpen size={32} />
            </div>
          )}
        </div>
        <div className="image-card-list-info">
          <h4>{image.title}</h4>
          <div className="image-card-list-meta">
            {image.category_name && (
              <span className="image-badge" style={{ backgroundColor: image.category_color || "#7c3aed" }}>
                <Tag size={12} /> {image.category_name}
              </span>
            )}
            {image.event && (
              <span className="image-meta-item">
                <Calendar size={14} /> {image.event}
              </span>
            )}
            {image.uploaded_by_name && (
              <span className="image-meta-item">
                <User size={14} /> {image.uploaded_by_name}
              </span>
            )}
            <span className="image-meta-item">
              <Calendar size={14} /> {formatDate(image.upload_date || image.created_at)}
            </span>
            <span className="image-meta-item">{formatFileSize(image.file_size)}</span>
          </div>
        </div>
        <div className="image-card-list-actions">
          <button className="icon-btn" onClick={() => onView(image)} title="View">
            <Eye size={16} />
          </button>
          <button className="icon-btn" onClick={() => onEdit(image)} title="Edit">
            <Pencil size={16} />
          </button>
          <button className="icon-btn danger" onClick={() => onDelete(image)} title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="image-card-grid"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="image-card-grid-thumb">
        {!imageError ? (
          <img
            src={image.image_url}
            alt={image.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        ) : (
          <div className="image-placeholder">
            <FolderOpen size={48} />
          </div>
        )}
        <div className="image-card-overlay">
          <button className="icon-btn" onClick={() => onView(image)} title="View">
            <Eye size={18} />
          </button>
          <button className="icon-btn" onClick={() => onEdit(image)} title="Edit">
            <Pencil size={18} />
          </button>
          <button className="icon-btn danger" onClick={() => onDelete(image)} title="Delete">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="image-card-grid-info">
        <h4>{image.title}</h4>
        {image.category_name && (
          <span className="image-badge" style={{ backgroundColor: image.category_color || "#7c3aed" }}>
            {image.category_name}
          </span>
        )}
        <div className="image-card-grid-meta">
          <span>
            <Calendar size={12} /> {formatDate(image.upload_date || image.created_at)}
          </span>
          {image.uploaded_by_name && (
            <span>
              <User size={12} /> {image.uploaded_by_name}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ImageCard;
