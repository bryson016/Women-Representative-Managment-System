import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import StaffRow from "./StaffRow";

const ITEMS_PER_PAGE = 10;

function StaffTable({ staff, onView, onEdit, onDelete, onRegisterFirst }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(staff.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedStaff = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return staff.slice(start, start + ITEMS_PER_PAGE);
  }, [staff, safePage]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, safePage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  if (staff.length === 0) {
    return (
      <motion.div
        className="panel-card empty-state-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <div className="empty-state">
          <div className="empty-illustration">
            <Users size={64} strokeWidth={1} />
          </div>
          <h3>No staff members have been added yet.</h3>
          <p>Start by adding the first staff member to your ward.</p>
          <button className="gov-btn gov-btn-primary" onClick={onRegisterFirst}>
            <Users size={16} />
            <span>Add First Staff Member</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="panel-card"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="card-title-row">
        <h3>Staff Directory</h3>
        <span className="citizen-count">{staff.length} record{staff.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="table-wrap">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Performance</th>
              <th>Workload</th>
              <th>Villages Covered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paginatedStaff.map((member, index) => (
                <StaffRow
                  key={member.id}
                  staff={member}
                  index={index}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="pagination-pages">
            {pageNumbers.map((page) => (
              <button
                key={page}
                className={`pagination-page ${page === safePage ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default StaffTable;
