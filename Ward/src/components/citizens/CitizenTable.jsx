import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import CitizenRow from "./CitizenRow";

const ITEMS_PER_PAGE = 10;

function CitizenTable({ citizens, onView, onEdit, onDelete, onRegisterFirst }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(citizens.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedCitizens = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return citizens.slice(start, start + ITEMS_PER_PAGE);
  }, [citizens, safePage]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, safePage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  if (citizens.length === 0) {
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
          <h3>No citizens have been registered yet.</h3>
          <p>Start by registering the first citizen in your ward.</p>
          <button className="gov-btn gov-btn-primary" onClick={onRegisterFirst}>
            <Users size={16} />
            <span>Register First Citizen</span>
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
        <h3>Registered Citizens</h3>
        <span className="citizen-count">{citizens.length} record{citizens.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="table-wrap">
        <table className="citizen-table">
          <thead>
            <tr>
              <th>Profile Photo</th>
              <th>National ID</th>
              <th>Full Name</th>
              <th>Gender</th>
              <th>Phone Number</th>
              <th>Village</th>
              <th>Occupation</th>
              <th>Registration Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paginatedCitizens.map((citizen, index) => (
                <CitizenRow
                  key={citizen.id}
                  citizen={citizen}
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

export default CitizenTable;
