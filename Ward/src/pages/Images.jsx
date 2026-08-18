import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import ImageGallery from "../components/images/ImageGallery";
import ImageUpload from "../components/images/ImageUpload";
import CategoryManager from "../components/images/CategoryManager";
import {
  Upload,
  Images as ImagesIcon,
  FolderOpen,
  BarChart3,
  Settings2,
  X,
} from "lucide-react";
import { getImages, getCategories, getImageStats, deleteImage } from "../services/imageApi";

function Images({ onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeItem, setActiveItem] = useState("images");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Data state
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const currentDate = new Date().toLocaleDateString("en-KE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const breadcrumb = ["Images", activeItem === "images" ? "Gallery" : activeItem];

  // Load data
  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        category: categoryFilter,
        date_from: dateFrom,
        date_to: dateTo,
        sort: sortBy,
        page: currentPage,
        limit: 12,
      };
      const data = await getImages(params);
      setImages(data.images || []);
      setPagination(data.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      console.error("Failed to load images:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter, dateFrom, dateTo, sortBy, currentPage]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await getImageStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, []);

  // Load images when filters change
  useEffect(() => {
    loadImages();
  }, [searchTerm, categoryFilter, dateFrom, dateTo, sortBy, currentPage]);

  // Load categories and stats once on mount
  useEffect(() => {
    loadCategories();
    loadStats();
  }, [loadCategories, loadStats]);

  const handleItemClick = (id) => {
    if (id === "logout") {
      onLogout();
      return;
    }
    if (id === "dashboard") {
      navigate("/dashboard");
      return;
    }
    if (id === "images") {
      navigate("/images");
      return;
    }
    if (id === "citizens") {
      navigate("/citizens");
      return;
    }
    if (id === "complaints") {
      navigate("/complaints");
      return;
    }
    if (id === "bursary") {
      navigate("/bursary");
      return;
    }
    if (id === "beneficiaries") {
      navigate("/beneficiaries");
      return;
    }
    if (id === "payments") {
      navigate("/payments");
      return;
    }
    if (id === "bursary-programs") {
      navigate("/bursary-programs");
      return;
    }
    if (id === "projects") {
      navigate("/projects");
      return;
    }
    if (id === "meetings") {
      navigate("/meetings");
      return;
    }
    if (id === "staff") {
      navigate("/staff");
      return;
    }
    if (id === "budget") {
      navigate("/budget");
      return;
    }
    if (id === "reports") {
      navigate("/reports");
      return;
    }
    if (id === "notifications") {
      navigate("/notifications");
      return;
    }
    if (id === "settings") {
      navigate("/settings");
      return;
    }
    setActiveItem(id);
    setMobileOpen(false);
  };

  const handleViewImage = (image) => {
    // Handled by ImageGallery modal
  };

  const handleEditImage = (image) => {
    // Could open edit modal here
    console.log("Edit image:", image);
  };

  const handleDeleteImage = async (image) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${image.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;
    try {
      await deleteImage(image.id);
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      loadStats();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete image.");
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    loadImages();
    loadStats();
    loadCategories();
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setDateFrom("");
    setDateTo("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className={`dashboard-shell ${isDarkMode ? "dark-mode" : ""}`}>
      <Sidebar
        activeItem={activeItem}
        userRole={user?.role}
        onItemClick={handleItemClick}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="dashboard-main">
        <TopNavbar
          breadcrumb={breadcrumb}
          currentDate={currentDate}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <motion.section
          className="welcome-banner"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
            >
              Image Management
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
            >
              Upload, organize, and manage ward images and media.
            </motion.p>
          </div>
        </motion.section>

        {/* Stats Cards */}
        {stats && (
          <motion.section
            className="stats-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <motion.div className="stat-card" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="stat-icon" style={{ backgroundColor: "#7c3aed20", color: "#7c3aed" }}>
                <ImagesIcon size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalImages.toLocaleString()}</span>
                <span className="stat-label">Total Images</span>
              </div>
            </motion.div>
            <motion.div className="stat-card" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="stat-icon" style={{ backgroundColor: "#2D936C20", color: "#2D936C" }}>
                <FolderOpen size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalCategories}</span>
                <span className="stat-label">Categories</span>
              </div>
            </motion.div>
            <motion.div className="stat-card" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="stat-icon" style={{ backgroundColor: "#C9A22720", color: "#C9A227" }}>
                <Upload size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.imagesThisMonth}</span>
                <span className="stat-label">Uploaded This Month</span>
              </div>
            </motion.div>
            <motion.div className="stat-card" whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <div className="stat-icon" style={{ backgroundColor: "#65A30D20", color: "#65A30D" }}>
                <BarChart3 size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.storageUsedFormatted}</span>
                <span className="stat-label">Storage Used</span>
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* Action Bar */}
        <motion.div
          className="page-actions"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
              <Upload size={18} /> Upload Images
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCategories(!showCategories)}
            >
              <Settings2 size={18} /> {showCategories ? "Hide Categories" : "Manage Categories"}
            </button>
          </div>
        </motion.div>

        {/* Category Manager */}
        <AnimatePresence>
          {showCategories && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="category-manager-section"
            >
              <CategoryManager onCategoriesChange={setCategories} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUpload(false)}
            >
              <motion.div
                className="modal-content upload-modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3>Upload Images</h3>
                  <button className="modal-close" onClick={() => setShowUpload(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <ImageUpload
                    onUploadComplete={handleUploadComplete}
                    onCancel={() => setShowUpload(false)}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery */}
        <motion.section
          className="gallery-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ImageGallery
            images={images}
            categories={categories}
            loading={loading}
            totalPages={pagination.totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onViewImage={handleViewImage}
            onEditImage={handleEditImage}
            onDeleteImage={handleDeleteImage}
            onUploadClick={() => setShowUpload(true)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </motion.section>
      </div>
    </div>
  );
}

export default Images;
