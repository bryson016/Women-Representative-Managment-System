import { motion } from "framer-motion";
import { Search, RefreshCw, FileText, Plus } from "lucide-react";

function CitizenFilters({
  searchTerm,
  onSearchChange,
  villageFilter,
  onVillageChange,
  genderFilter,
  onGenderChange,
  dateFilter,
  onDateChange,
  villages,
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
          <div className="filter-label">Search citizen by:</div>
          <div className="search-input-group">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Name, National ID or Phone Number..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="filter-search-input"
            />
          </div>
        </div>

        <div className="filters-select-group">
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
            <label>Gender</label>
            <select value={genderFilter} onChange={(e) => onGenderChange(e.target.value)}>
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
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
          <span>Register Citizen</span>
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

export default CitizenFilters;
