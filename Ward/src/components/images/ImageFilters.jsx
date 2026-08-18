import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";

function ImageFilters({
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
  categories,
  onClearFilters,
  viewMode,
  onViewModeChange,
}) {
  return (
    <motion.div
      className="image-filters"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="filters-row">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search images by title, description..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => onSearchChange("")}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-select">
          <SlidersHorizontal size={18} />
          <select value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)}>
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-date">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            placeholder="From"
          />
          <span className="date-separator">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            placeholder="To"
          />
        </div>

        <div className="filter-select">
          <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
            <option value="size_desc">Largest First</option>
            <option value="size_asc">Smallest First</option>
          </select>
          <ChevronDown size={16} />
        </div>

        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => onViewModeChange("grid")}
            title="Grid View"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => onViewModeChange("list")}
            title="List View"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1" y="2" width="16" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="7.5" width="16" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="13" width="16" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        {(searchTerm || categoryFilter || dateFrom || dateTo) && (
          <button className="clear-filters-btn" onClick={onClearFilters}>
            <X size={14} /> Clear Filters
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default ImageFilters;
