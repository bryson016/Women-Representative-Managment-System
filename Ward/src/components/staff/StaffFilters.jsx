import { motion } from "framer-motion";
import { Search, RefreshCw, FileText, Plus } from "lucide-react";

function StaffFilters({
  searchTerm,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  departments,
  roles,
  statuses,
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
          <div className="filter-label">Search staff by:</div>
          <div className="search-input-group">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Staff ID, Name, Phone or Email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="filter-search-input"
            />
          </div>
        </div>

        <div className="filters-select-group">
          <div className="filter-item">
            <label>Department</label>
            <select value={departmentFilter} onChange={(e) => onDepartmentChange(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Role</label>
            <select value={roleFilter} onChange={(e) => onRoleChange(e.target.value)}>
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
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
        </div>
      </div>

      <div className="filters-actions">
        <button className="gov-btn gov-btn-primary" onClick={onRegisterClick}>
          <Plus size={16} />
          <span>Add Staff Member</span>
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

export default StaffFilters;
