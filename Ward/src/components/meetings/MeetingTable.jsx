import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import MeetingRow from "./MeetingRow";

const ITEMS_PER_PAGE = 10;

function MeetingTable({ meetings, onView, onEdit, onDelete, onMarkComplete, onCancel, onScheduleFirst }) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(meetings.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedMeetings = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return meetings.slice(start, start + ITEMS_PER_PAGE);
  }, [meetings, safePage]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, safePage + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [safePage, totalPages]);

  if (meetings.length === 0) {
    return (
      <motion.div
        className="panel-card empty-state-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <div className="empty-state">
          <div className="empty-illustration">
            <CalendarDays size={64} strokeWidth={1} />
          </div>
          <h3>No meetings have been scheduled yet.</h3>
          <p>Schedule the first meeting for your ward to start managing meetings efficiently.</p>
          <button className="gov-btn gov-btn-primary" onClick={onScheduleFirst}>
            <CalendarDays size={16} />
            <span>Schedule Meeting</span>
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
        <h3>Meeting Records</h3>
        <span className="citizen-count">{meetings.length} meeting{meetings.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="table-wrap">
        <table className="meeting-table">
          <thead>
            <tr>
              <th>Meeting ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Venue</th>
              <th>Chairperson</th>
              <th>Attendance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paginatedMeetings.map((meeting, index) => (
                <MeetingRow
                  key={meeting.id}
                  meeting={meeting}
                  index={index}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onMarkComplete={onMarkComplete}
                  onCancel={onCancel}
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

export default MeetingTable;
