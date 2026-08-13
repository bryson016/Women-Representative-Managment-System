import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import ComplaintRow from "./ComplaintRow";

const ITEMS_PER_PAGE = 10;

function ComplaintTable({ complaints, onView, onEdit, onDelete, onAssign, onResolve, onRegisterFirst }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(complaints.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedComplaints = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return complaints.slice(start, start + ITEMS_PER_PAGE);
  }, [complaints, safePage]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, safePage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  if (complaints.length === 0) {
    return (
      <motion.div
        className="panel-card empty-state-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <div className="empty-state">
          <div className="empty-illustration">
            <Megaphone size={64} strokeWidth={1} />
          </div>
          <h3>No complaints have been registered yet.</h3>
          <p>Start by registering the first complaint in your ward.</p>
          <button className="gov-btn gov-btn-primary" onClick={onRegisterFirst}>
            <Megaphone size={16} />
            <span>Register First Complaint</span>
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
        <h3>Complaint Records</h3>
        <span className="citizen-count">{complaints.length} record{complaints.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="table-wrap">
        <table className="complaint-table">
          <thead>
            <tr>
              <th>Complaint ID</th>
              <th>Citizen</th>
              <th>National ID</th>
              <th>Phone</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Village</th>
              <th>Assigned Officer</th>
              <th>Status</th>
              <th>Date Reported</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paginatedComplaints.map((complaint, index) => (
                <ComplaintRow
                  key={complaint.id}
                  complaint={complaint}
                  index={index}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAssign={onAssign}
                  onResolve={onResolve}
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

export default ComplaintTable;
