import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, User, Tag, FileText, Download, Pencil, Trash2, FolderOpen } from "lucide-react";

function ImageModal({ image, onClose, onEdit, onDelete }) {
  if (!image) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "long",
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

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = image.image_url;
    link.download = image.image_name || "image";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content image-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>

            <div className="image-modal-body">
              <div className="image-modal-preview">
                <img src={image.image_url} alt={image.title} />
              </div>

              <div className="image-modal-details">
                <h2>{image.title}</h2>

                {image.description && (
                  <p className="image-modal-description">{image.description}</p>
                )}

                <div className="image-modal-meta">
                  {image.category_name && (
                    <div className="meta-item">
                      <Tag size={16} />
                      <div>
                        <span className="meta-label">Category</span>
                        <span
                          className="meta-value"
                          style={{ color: image.category_color || "#7c3aed" }}
                        >
                          {image.category_name}
                        </span>
                      </div>
                    </div>
                  )}

                  {image.event && (
                    <div className="meta-item">
                      <Calendar size={16} />
                      <div>
                        <span className="meta-label">Event</span>
                        <span className="meta-value">{image.event}</span>
                      </div>
                    </div>
                  )}

                  {image.project && (
                    <div className="meta-item">
                      <FolderOpen size={16} />
                      <div>
                        <span className="meta-label">Project</span>
                        <span className="meta-value">{image.project}</span>
                      </div>
                    </div>
                  )}

                  <div className="meta-item">
                    <Calendar size={16} />
                    <div>
                      <span className="meta-label">Upload Date</span>
                      <span className="meta-value">{formatDate(image.upload_date || image.created_at)}</span>
                    </div>
                  </div>

                  {image.uploaded_by_name && (
                    <div className="meta-item">
                      <User size={16} />
                      <div>
                        <span className="meta-label">Uploaded By</span>
                        <span className="meta-value">{image.uploaded_by_name}</span>
                      </div>
                    </div>
                  )}

                  <div className="meta-item">
                    <FileText size={16} />
                    <div>
                      <span className="meta-label">File Info</span>
                      <span className="meta-value">
                        {image.file_type?.split("/")?.[1]?.toUpperCase() || "N/A"} •{" "}
                        {formatFileSize(image.file_size)}
                        {image.width && image.height && (
                          <span> • {image.width}x{image.height}</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="image-modal-actions">
                  <button className="btn btn-secondary" onClick={handleDownload}>
                    <Download size={16} /> Download
                  </button>
                  <button className="btn btn-primary" onClick={() => onEdit(image)}>
                    <Pencil size={16} /> Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => onDelete(image)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ImageModal;
