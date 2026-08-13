import { motion } from "framer-motion";
import { Search, RefreshCw, FileText, Plus } from "lucide-react";

function ComplaintFilters({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  priorityFilter,
  onPriorityChange,
  statusFilter,
  onStatusChange,
  villageFilter,
  onVillageChange,
  officerFilter,
  onOfficerChange,
  dateFilter,
  onDateChange,
  categories,
  priorities,
  statuses,
  villages,
  officers,
  onRegisterClick,
  onExportPdf,
  onRefresh,
}) {
  return (
    <motion.div
      className="citizen-filters"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="filters-row">
        <div className="filters-search-group">
          <div className="filter-label">Search complaint by:</div>
          <div className="search-input-group">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Complaint ID, Citizen Name, Phone or National ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="filter-search-input"
            />
          </div>
        </div>

        <div className="filters-select-group">
          <div className="filter-item">
            <label>Category</label>
            <select value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Priority</label>
            <select value={priorityFilter} onChange={(e) => onPriorityChange(e.target.value)}>
              <option value="">All Priorities</option>
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
              <option value="">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Village</label>
            <select value={villageFilter} onChange={(e) => onVillageChange(e.target.value)}>
              <option value="">All Villages</option>
              {villages.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Assigned Officer</label>
            <select value={officerFilter} onChange={(e) => onOfficerChange(e.target.value)}>
              <option value="">All Officers</option>
              {officers.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>From Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="filters-actions">
        <button className="gov-btn gov-btn-primary" onClick={onRegisterClick}>
          <Plus size={16} />
          <span>Register Complaint</span>
        </button>
        <button className="gov-btn gov-btn-secondary" onClick={onExportPdf}>
          <FileText size={16} />
          <span>Export PDF</span>
        </button>
        <button className="gov-btn gov-btn-ghost" onClick={onRefresh}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>
    </motion.div>
  );
}

export default ComplaintFilters;
