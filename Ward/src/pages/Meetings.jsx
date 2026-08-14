import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarCheck2, X } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import TopNavbar from "../components/layout/TopNavbar";
import MeetingStats from "../components/meetings/MeetingStats";
import MeetingFilters from "../components/meetings/MeetingFilters";
import MeetingTable from "../components/meetings/MeetingTable";
import MeetingModal from "../components/meetings/MeetingModal";
import MeetingDetails from "../components/meetings/MeetingDetails";
import MeetingCharts from "../components/meetings/MeetingCharts";
import MeetingSidebar from "../components/meetings/MeetingSidebar";
import initialMeetings, {
  meetingTypes,
  meetingStatuses,
  priorities,
  venues,
  villages,
  chairpersons,
  secretaries,
} from "../data/meetings";

function Meetings({ onLogout }) {
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState(() => {
    const stored = localStorage.getItem("ward-meetings");
    return stored ? JSON.parse(stored) : initialMeetings;
  });
  const [activeItem, setActiveItem] = useState("meetings");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [venueFilter, setVenueFilter] = useState("");
  const [chairpersonFilter, setChairpersonFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [viewingMeeting, setViewingMeeting] = useState(null);

  // Complete meeting modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completingMeeting, setCompletingMeeting] = useState(null);
  const [completeAttendance, setCompleteAttendance] = useState(0);

  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString("en-KE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    []
  );

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("ward-meetings", JSON.stringify(meetings));
  }, [meetings]);

  // Filtered meetings
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        m.id.toLowerCase().includes(term) ||
        m.title.toLowerCase().includes(term) ||
        m.type.toLowerCase().includes(term) ||
        m.venue.toLowerCase().includes(term) ||
        (m.chairperson || "").toLowerCase().includes(term);

      const matchesType = !typeFilter || m.type === typeFilter;
      const matchesStatus = !statusFilter || m.status === statusFilter;
      const matchesVenue = !venueFilter || m.venue === venueFilter;
      const matchesChairperson = !chairpersonFilter || m.chairperson === chairpersonFilter;
      const matchesDate = !dateFilter || m.date >= dateFilter;

      return matchesSearch && matchesType && matchesStatus && matchesVenue && matchesChairperson && matchesDate;
    });
  }, [meetings, searchTerm, typeFilter, statusFilter, venueFilter, chairpersonFilter, dateFilter]);

  // Stats
  const totalMeetings = filteredMeetings.length;
  const upcomingCount = filteredMeetings.filter((m) => m.status === "Scheduled" || m.status === "In Progress").length;
  const completedCount = filteredMeetings.filter((m) => m.status === "Completed").length;
  const totalExpected = filteredMeetings.reduce((sum, m) => sum + m.expectedAttendance, 0);
  const totalActual = filteredMeetings.reduce((sum, m) => sum + m.actualAttendance, 0);
  const attendanceRate = totalExpected > 0 ? (totalActual / totalExpected) * 100 : 0;

  // Handlers
  const handleItemClick = useCallback(
    (id) => {
      if (id === "logout") {
        onLogout();
        return;
      }
      if (id === "dashboard") {
        navigate("/dashboard");
        return;
      }
      if (id === "citizens") {
        navigate("/citizens");
        return;
      }
      if (id === "complaints") {
        navigate("/complaints");
        return;
      }
      if (id === "projects") {
        navigate("/projects");
        return;
      }
      if (id === "budget") {
        navigate("/budget");
        return;
      }
      if (id === "reports") {
        navigate("/reports");
        return;
      }
      if (id === "settings") {
        navigate("/settings");
        return;
      }
      setActiveItem(id);
      setMobileOpen(false);
    },
    [navigate, onLogout]
  );

  const handleScheduleClick = () => {
    setEditingMeeting(null);
    setModalOpen(true);
  };

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting);
    setModalOpen(true);
  };

  const handleSave = (meetingData) => {
    setMeetings((prev) => {
      const exists = prev.find((m) => m.id === meetingData.id);
      if (exists) {
        return prev.map((m) => (m.id === meetingData.id ? meetingData : m));
      }
      return [...prev, meetingData];
    });
  };

  const handleDelete = (meeting) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete meeting ${meeting.id} - ${meeting.title}? This action cannot be undone.`
    );
    if (confirmed) {
      setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
    }
  };

  const handleView = (meeting) => {
    setViewingMeeting(meeting);
  };

  const handleBack = () => {
    setViewingMeeting(null);
  };

  const handleMarkComplete = (meeting) => {
    setCompletingMeeting(meeting);
    setCompleteAttendance(meeting.actualAttendance || 0);
    setCompleteModalOpen(true);
  };

  const handleCompleteSubmit = (meetingId, attendance) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              status: "Completed",
              actualAttendance: attendance,
              minutes: [
                ...(m.minutes || []),
                { item: "Meeting concluded and minutes recorded" },
              ],
              activityTimeline: [
                ...(m.activityTimeline || []),
                { date: new Date().toISOString().split("T")[0], action: "Meeting marked as completed", by: "Ward Administrator's Office" },
              ],
            }
          : m
      )
    );
    setCompleteModalOpen(false);
    setCompletingMeeting(null);
    setCompleteAttendance(0);
  };

  const handleCancel = (meeting) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel meeting ${meeting.id} - ${meeting.title}?`
    );
    if (confirmed) {
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === meeting.id
            ? {
                ...m,
                status: "Cancelled",
                activityTimeline: [
                  ...(m.activityTimeline || []),
                  { date: new Date().toISOString().split("T")[0], action: "Meeting cancelled", by: "Ward Administrator's Office" },
                ],
              }
            : m
        )
      );
    }
  };

  // Export functions
  const exportPdf = () => {
    const tableRows = filteredMeetings
      .map(
        (m) =>
          `<tr>
            <td>${m.id}</td>
            <td>${m.title}</td>
            <td>${m.type}</td>
            <td>${m.date}</td>
            <td>${m.time}</td>
            <td>${m.venue}</td>
            <td>${m.village}</td>
            <td>${m.chairperson}</td>
            <td>${m.actualAttendance} / ${m.expectedAttendance}</td>
            <td>${m.status}</td>
          </tr>`
      )
      .join("");

    const html = `
      <html>
        <head><title>Meetings Export</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #7c3aed; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
          th { background: #7c3aed; color: white; }
        </style>
        </head>
        <body>
          <h1>Meeting Records - Women Repsentative system</h1>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead><tr>
              <th>Meeting ID</th><th>Title</th><th>Type</th><th>Date</th><th>Time</th>
              <th>Venue</th><th>Village</th><th>Chairperson</th><th>Attendance</th><th>Status</th>
            </tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
          <p style="margin-top:20px;color:#666;">Total: ${filteredMeetings.length} meetings</p>
        </body>
      </html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  const handleRefresh = () => {
    setSearchTerm("");
    setTypeFilter("");
    setStatusFilter("");
    setVenueFilter("");
    setChairpersonFilter("");
    setDateFilter("");
  };

  // Check if we are viewing a meeting detail
  if (viewingMeeting) {
    return (
      <div className={`dashboard-shell ${isDarkMode ? "dark-mode" : ""}`}>
        <Sidebar
          activeItem={activeItem}
          onItemClick={handleItemClick}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="dashboard-main">
          <TopNavbar
            breadcrumb={["Dashboard", "Meetings", viewingMeeting.id]}
            currentDate={currentDate}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            onOpenMobileMenu={() => setMobileOpen(true)}
          />
          <MeetingDetails meeting={viewingMeeting} onBack={handleBack} />
          <footer className="dashboard-footer">
            <p>Women Repsentative system</p>
            <p>Academic Demonstration Project</p>
            <p>Version 1.0</p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-shell ${isDarkMode ? "dark-mode" : ""}`}>
      <Sidebar
        activeItem={activeItem}
        onItemClick={handleItemClick}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="dashboard-main">
        <TopNavbar
          breadcrumb={["Dashboard", "Meetings"]}
          currentDate={currentDate}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <motion.section
          className="welcome-banner meetings-hero"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div>
            <h1>Meetings Management</h1>
            <h2>Schedule, track and manage ward meetings efficiently.</h2>
            <p>
              Manage ward committee meetings, public barazas, budget reviews and planning sessions.
              Track attendance, agendas, minutes, action items, and ensure effective stakeholder
              engagement through one centralized dashboard.
            </p>
          </div>
          <div className="welcome-illustration" aria-hidden="true">
            Ward Meetings
          </div>
        </motion.section>

        <MeetingStats
          totalMeetings={totalMeetings}
          upcomingCount={upcomingCount}
          completedCount={completedCount}
          attendanceRate={attendanceRate}
        />

        <MeetingFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          venueFilter={venueFilter}
          onVenueChange={setVenueFilter}
          chairpersonFilter={chairpersonFilter}
          onChairpersonChange={setChairpersonFilter}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          meetingTypes={meetingTypes}
          meetingStatuses={meetingStatuses}
          venues={venues}
          chairpersons={chairpersons}
          onScheduleClick={handleScheduleClick}
          onExportPdf={exportPdf}
          onRefresh={handleRefresh}
        />

        <div className="meetings-main-col">
          <MeetingTable
            meetings={filteredMeetings}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkComplete={handleMarkComplete}
            onCancel={handleCancel}
            onScheduleFirst={handleScheduleClick}
          />
          <MeetingCharts meetings={filteredMeetings} />
          <MeetingSidebar meetings={filteredMeetings} />
        </div>

        <MeetingModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          meeting={editingMeeting}
          meetingTypes={meetingTypes}
          meetingStatuses={meetingStatuses}
          priorities={priorities}
          venues={venues}
          villages={villages}
          chairpersons={chairpersons}
          secretaries={secretaries}
        />

        {/* Mark Complete Modal */}
        {completeModalOpen && completingMeeting && (
          <>
            <div className="modal-backdrop" onClick={() => setCompleteModalOpen(false)} />
            <div className="modal-container" style={{ maxWidth: "450px" }}>
              <div className="modal-header">
                <h2>Mark Meeting Complete</h2>
                <button className="modal-close" onClick={() => setCompleteModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const attendance = Number(form.attendance.value);
                handleCompleteSubmit(completingMeeting.id, attendance);
              }}>
                <div className="modal-body">
                  <p style={{ fontSize: "0.85rem", color: "#475569", marginBottom: "0.8rem" }}>
                    Marking <strong>{completingMeeting.id}</strong> - <strong>{completingMeeting.title}</strong> as completed.
                  </p>
                  <div className="form-group" style={{ marginBottom: "0.8rem" }}>
                    <label>Actual Attendance (Expected: {completingMeeting.expectedAttendance})</label>
                    <input
                      type="number"
                      name="attendance"
                      min="0"
                      max={completingMeeting.expectedAttendance}
                      value={completeAttendance}
                      onChange={(e) => setCompleteAttendance(Number(e.target.value))}
                      required
                      style={{
                        width: "100%", border: "1px solid var(--gov-border)", borderRadius: "0.6rem",
                        padding: "0.5rem 0.6rem", fontSize: "0.85rem", background: "#fff", color: "#0f172a"
                      }}
                    />
                  </div>
                  <div className="quick-stat-item" style={{ background: "#f8fafc" }}>
                    <div className="quick-stat-icon"><CalendarCheck2 size={16} /></div>
                    <div className="quick-stat-info">
                      <span className="quick-stat-value">
                        {completingMeeting.expectedAttendance > 0
                          ? `${Math.min(Math.round((Number(completeAttendance) / completingMeeting.expectedAttendance) * 100), 100)}%`
                          : "0%"}
                      </span>
                      <span className="quick-stat-label">Attendance Rate</span>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="gov-btn gov-btn-ghost" onClick={() => setCompleteModalOpen(false)}>Cancel</button>
                  <button type="submit" className="gov-btn gov-btn-primary">Mark Complete</button>
                </div>
              </form>
            </div>
          </>
        )}

        <footer className="dashboard-footer">
          <p>Women Repsentative system</p>
          <p>Academic Demonstration Project</p>
          <p>Version 1.0</p>
        </footer>
      </div>
    </div>
  );
}

export default Meetings;
