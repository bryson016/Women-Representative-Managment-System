import { motion } from "framer-motion";
import { Search, RefreshCw, FileText, Plus } from "lucide-react";

function MeetingFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeChange,
  statusFilter,
  onStatusChange,
  venueFilter,
  onVenueChange,
  chairpersonFilter,
  onChairpersonChange,
  dateFilter,
  onDateChange,
  meetingTypes,
  meetingStatuses,
  venues,
  chairpersons,
  onScheduleClick,
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
          <div className="filter-label">Search meetings by:</div>
          <div className="search-input-group">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Meeting ID, Title, Type or Venue..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="filter-search-input"
            />
          </div>
        </div>

        <div className="filters-select-group">
          <div className="filter-item">
            <label>Meeting Type</label>
            <select value={typeFilter} onChange={(e) => onTypeChange(e.target.value)}>
              <option value="">All Types</option>
              {meetingTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
              <option value="">All Statuses</option>
              {meetingStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Venue</label>
            <select value={venueFilter} onChange={(e) => onVenueChange(e.target.value)}>
              <option value="">All Venues</option>
              {venues.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Chairperson</label>
            <select value={chairpersonFilter} onChange={(e) => onChairpersonChange(e.target.value)}>
              <option value="">All Chairpersons</option>
              {chairpersons.map((c) => (
                <option key={c} value={c}>{c}</option>
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
        <button className="gov-btn gov-btn-primary" onClick={onScheduleClick}>
          <Plus size={16} />
          <span>Schedule Meeting</span>
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

export default MeetingFilters;
