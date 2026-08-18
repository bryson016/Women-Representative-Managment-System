import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import ImageCard from "./ImageCard";
import ImageModal from "./ImageModal";
import ImageFilters from "./ImageFilters";
import { FolderOpen, Upload, RefreshCw } from "lucide-react";

function ImageGallery({
  images,
  categories,
  loading,
  totalPages,
  currentPage,
  onPageChange,
  onViewImage,
  onEditImage,
  onDeleteImage,
  onUploadClick,
  onRefresh,
  viewMode,
  onViewModeChange,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  sortBy,
  onSortChange,
  onClearFilters,
}) {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleView = (image) => {
    setSelectedImage(image);
    onViewImage?.(image);
  };

  const handleEdit = (image) => {
    onEditImage?.(image);
  };

  const handleDelete = (image) => {
    onDeleteImage?.(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Generate page numbers
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div className="gallery-loading">
        <div className="spinner" />
        <p>Loading images...</p>
      </div>
    );
  }

  return (
    <div className="image-gallery">
      <ImageFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        categoryFilter={categoryFilter}
        onCategoryChange={onCategoryChange}
        dateFrom={dateFrom}
        onDateFromChange={onDateFromChange}
        dateTo={dateTo}
        onDateToChange={onDateToChange}
        sortBy={sortBy}
        onSortChange={onSortChange}
        categories={categories}
        onClearFilters={onClearFilters}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />

      {images.length === 0 ? (
        <motion.div
          className="gallery-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FolderOpen size={64} />
          <h3>No Images Found</h3>
          <p>Upload your first image or adjust your filters to see results.</p>
          <button className="btn btn-primary" onClick={onUploadClick}>
            <Upload size={18} /> Upload Images
          </button>
        </motion.div>
      ) : (
        <>
          <motion.div
            className={`gallery-grid ${viewMode === "list" ? "list-view" : "grid-view"}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {images.map((image, index) => (
              <ImageCard
                key={image.id}
                image={image}
                viewMode={viewMode}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="gallery-pagination">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
              >
                Previous
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? "active" : ""}`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Image Modal */}
      <ImageModal
        image={selectedImage}
        onClose={closeModal}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default ImageGallery;
