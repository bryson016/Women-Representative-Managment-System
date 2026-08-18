import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../services/imageApi";

function CategoryManager({ onCategoriesChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "", color: "#7c3aed" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const presetColors = [
    "#7c3aed", "#2D936C", "#C9A227", "#65A30D", "#2563eb",
    "#dc2626", "#0891b2", "#7c3aed", "#ea580c", "#4f46e5",
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
      onCategoriesChange?.(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData);
      }
      await loadCategories();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || "#7c3aed",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this category? Images in this category will become uncategorized.");
    if (!confirmed) return;

    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete category.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", color: "#7c3aed" });
    setError("");
  };

  return (
    <div className="category-manager">
      <div className="category-manager-header">
        <h3>Categories</h3>
        <button className="btn btn-sm btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading categories...</div>
      ) : (
        <div className="category-list">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              className="category-item"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="category-color" style={{ backgroundColor: category.color || "#7c3aed" }} />
              <div className="category-info">
                <span className="category-name">{category.name}</span>
                <span className="category-count">{category.image_count || 0} images</span>
              </div>
              <div className="category-actions">
                <button className="icon-btn" onClick={() => handleEdit(category)} title="Edit">
                  <Pencil size={14} />
                </button>
                <button className="icon-btn danger" onClick={() => handleDelete(category.id)} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Category Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="modal-content category-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{editingCategory ? "Edit Category" : "New Category"}</h3>
                <button className="modal-close" onClick={closeModal}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                  <label htmlFor="cat-name">Category Name *</label>
                  <input
                    id="cat-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Events, Projects, Staff"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cat-desc">Description</label>
                  <textarea
                    id="cat-desc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this category"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <div className="color-picker">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-option ${formData.color === color ? "selected" : ""}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                        title={color}
                      >
                        {formData.color === color && <Check size={12} color="white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : editingCategory ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CategoryManager;
