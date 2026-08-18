import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  Tag,
  Calendar,
  FolderOpen,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { uploadImages, getCategories } from "../../services/imageApi";

function ImageUpload({ onUploadComplete, onCancel }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    event: "",
    project: "",
    upload_date: new Date().toISOString().split("T")[0],
  });

  const fileInputRef = useRef(null);

  // Load categories on mount
  useState(() => {
    getCategories().then(setCategories).catch(console.error);
  });

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFiles = (fileList) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = [];
    const errors = [];

    Array.from(fileList).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only JPG, JPEG, PNG, WEBP allowed.`);
      } else if (file.size > maxSize) {
        errors.push(`${file.name}: File too large. Maximum size is 10MB.`);
      } else {
        validFiles.push(file);
      }
    });

    return { validFiles, errors };
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError("");

    const { validFiles, errors } = validateFiles(e.dataTransfer.files);
    if (errors.length > 0) {
      setError(errors.join("\n"));
      return;
    }

    const newFiles = validFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleFileSelect = (e) => {
    const { validFiles, errors } = validateFiles(e.target.files);
    if (errors.length > 0) {
      setError(errors.join("\n"));
      return;
    }

    const newFiles = validFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    setError("");
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (files.length === 0) {
      setError("Please select at least one image to upload.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const uploadFormData = new FormData();
      files.forEach((f) => {
        uploadFormData.append("files", f.file);
      });
      uploadFormData.append("title", formData.title);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("category_id", formData.category_id);
      uploadFormData.append("event", formData.event);
      uploadFormData.append("project", formData.project);
      uploadFormData.append("upload_date", formData.upload_date);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadImages(uploadFormData);

      clearInterval(progressInterval);
      setProgress(100);
      setSuccess(`${result.images?.length || files.length} image(s) uploaded successfully!`);

      // Clean up previews
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
      setFormData({
        title: "",
        description: "",
        category_id: "",
        event: "",
        project: "",
        upload_date: new Date().toISOString().split("T")[0],
      });

      onUploadComplete?.(result);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload images. Please try again.");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setError("");
    setSuccess("");
    setProgress(0);
    onCancel?.();
  };

  return (
    <motion.div
      className="image-upload"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="upload-header">
        <h2>Upload Images</h2>
        <p>Upload images to the ward management system. Supported formats: JPG, JPEG, PNG, WEBP (max 10MB each).</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Drag & Drop Area */}
        <div
          className={`upload-dropzone ${dragActive ? "drag-active" : ""} ${files.length > 0 ? "has-files" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            multiple
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />

          {files.length === 0 ? (
            <div className="dropzone-content">
              <Upload size={48} />
              <h3>Drag & Drop Images Here</h3>
              <p>or click to browse from your computer</p>
              <span className="dropzone-hint">Supports JPG, JPEG, PNG, WEBP up to 10MB</span>
            </div>
          ) : (
            <div className="dropzone-preview">
              <div className="preview-grid">
                {files.map((file) => (
                  <div key={file.id} className="preview-item">
                    <img src={file.preview} alt={file.name} />
                    <button
                      type="button"
                      className="preview-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                    >
                      <X size={14} />
                    </button>
                    <div className="preview-info">
                      <span className="preview-name">{file.name}</span>
                      <span className="preview-size">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="add-more-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload size={16} /> Add More
              </button>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="upload-form-fields">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">
                <FileText size={16} /> Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Image title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">
                <Tag size={16} /> Category
              </label>
              <select
                id="category"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the image"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event">
                <Calendar size={16} /> Event
              </label>
              <input
                id="event"
                type="text"
                value={formData.event}
                onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                placeholder="e.g., Monthly Development Forum"
              />
            </div>

            <div className="form-group">
              <label htmlFor="project">
                <FolderOpen size={16} /> Project
              </label>
              <input
                id="project"
                type="text"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                placeholder="e.g., Water Extension Project"
              />
            </div>

            <div className="form-group">
              <label htmlFor="upload_date">Upload Date</label>
              <input
                id="upload_date"
                type="date"
                value={formData.upload_date}
                onChange={(e) => setFormData({ ...formData, upload_date: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            className="alert alert-error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={18} />
            <pre>{error}</pre>
          </motion.div>
        )}

        {success && (
          <motion.div
            className="alert alert-success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle size={18} />
            {success}
          </motion.div>
        )}

        {/* Progress Bar */}
        {uploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}

        {/* Actions */}
        <div className="upload-actions">
          <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={uploading}>
            <X size={16} /> Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={uploading || files.length === 0}>
            {uploading ? (
              <>
                <div className="spinner" /> Uploading...
              </>
            ) : (
              <>
                <Upload size={16} /> Upload {files.length > 0 ? `(${files.length})` : ""}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default ImageUpload;
