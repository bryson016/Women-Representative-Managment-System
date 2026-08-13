import { motion } from "framer-motion";
import { Search, RefreshCw, FileText, Plus } from "lucide-react";

function ProjectFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  financialYearFilter,
  onFinancialYearChange,
  budgetRangeFilter,
  onBudgetRangeChange,
  wardFilter,
  onWardChange,
  contractorFilter,
  onContractorChange,
  priorityFilter,
  onPriorityChange,
  completionFilter,
  onCompletionChange,
  statuses,
  categories,
  financialYears,
  budgetRanges,
  wards,
  contractors,
  priorities,
  completionRanges,
  onAddClick,
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
          <div className="filter-label">Search project by:</div>
          <div className="search-input-group">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Project Name, Code, Contractor, Ward or Location..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="filter-search-input"
            />
          </div>
        </div>

        <div className="filters-select-group">
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
            <label>Category</label>
            <select value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Financial Year</label>
            <select value={financialYearFilter} onChange={(e) => onFinancialYearChange(e.target.value)}>
              <option value="">All Years</option>
              {financialYears.map((fy) => (
                <option key={fy} value={fy}>{fy}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Budget Range</label>
            <select value={budgetRangeFilter} onChange={(e) => onBudgetRangeChange(e.target.value)}>
              <option value="">All Budgets</option>
              {budgetRanges.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Ward</label>
            <select value={wardFilter} onChange={(e) => onWardChange(e.target.value)}>
              <option value="">All Wards</option>
              {wards.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label>Contractor</label>
            <select value={contractorFilter} onChange={(e) => onContractorChange(e.target.value)}>
              <option value="">All Contractors</option>
              {contractors.map((c) => (
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
            <label>Completion</label>
            <select value={completionFilter} onChange={(e) => onCompletionChange(e.target.value)}>
              <option value="">All Progress</option>
              {completionRanges.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="filters-actions">
        <button className="gov-btn gov-btn-primary" onClick={onAddClick}>
          <Plus size={16} />
          <span>Add New Project</span>
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

export default ProjectFilters;
