import { motion } from "framer-motion";
import { Activity, CalendarClock, CheckCircle2, ClipboardList, TrendingUp, Users } from "lucide-react";

function MeetingSidebar({ meetings }) {
  // Upcoming meetings (scheduled or in progress), sorted by date
  const upcomingMeetings = meetings
    .filter((m) => m.status === "Scheduled" || m.status === "In Progress")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  // Recent activities from all meetings
  const recentActivities = meetings
    .flatMap((m) =>
      (m.activityTimeline || []).map((a) => ({ ...a, meetingId: m.id, meetingTitle: m.title }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Pending / in-progress action items
  const pendingActions = meetings
    .flatMap((m) =>
      (m.actionItems || [])
        .filter((a) => a.status !== "Completed")
        .map((a) => ({ ...a, meetingId: m.id, meetingTitle: m.title }))
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  // Completed meetings
  const completedMeetings = meetings
    .filter((m) => m.status === "Completed")
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  // Quick summary stats
  const completedCount = meetings.filter((m) => m.status === "Completed").length;
  const totalActions = meetings.reduce((sum, m) => sum + (m.actionItems || []).length, 0);
  const completedActions = meetings.reduce(
    (sum, m) => sum + (m.actionItems || []).filter((a) => a.status === "Completed").length,
    0
  );
  const totalExpected = meetings.reduce((sum, m) => sum + m.expectedAttendance, 0);
  const totalActual = meetings.reduce((sum, m) => sum + m.actualAttendance, 0);
  const attendanceRate = totalExpected > 0 ? Math.round((totalActual / totalExpected) * 100) : 0;

  return (
    <div className="meetings-sidebar">
      {/* Upcoming Meetings */}
      <motion.div
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><CalendarClock size={16} /> Upcoming Meetings</h3>
        </div>
        {upcomingMeetings.length > 0 ? (
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {upcomingMeetings.map((meeting, index) => {
              const dateObj = new Date(meeting.date + "T00:00:00");
              const day = dateObj.toLocaleDateString("en-KE", { weekday: "short" });
              const dayNum = dateObj.toLocaleDateString("en-KE", { day: "2-digit" });
              return (
                <div key={meeting.id} className="milestone-item">
                  <div className="milestone-head">
                    <span className="milestone-title">{meeting.title}</span>
                    <span className="status-pill meeting-scheduled">{meeting.status}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                    <div style={{
                      width: "2rem", height: "2rem", borderRadius: "0.5rem",
                      background: "#f5f3ff", color: "#7c3aed", display: "grid",
                      placeItems: "center", flexShrink: 0,
                    }}>
                      <div style={{ textAlign: "center", lineHeight: 1.05 }}>
                        <div style={{ fontSize: "0.58rem", fontWeight: 600 }}>{day}</div>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700 }}>{dayNum}</div>
                      </div>
                    </div>
                    <div className="milestone-meta" style={{ display: "grid", gap: "0.1rem" }}>
                      <span style={{ color: "#475569" }}>{meeting.time}</span>
                      <span>{meeting.venue}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-data">No upcoming meetings.</p>
        )}
      </motion.div>

      {/* Recent Meeting Activities */}
      <motion.div
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><Activity size={16} /> Recent Meeting Activities</h3>
        </div>
        {recentActivities.length > 0 ? (
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {recentActivities.map((activity, index) => (
              <div key={index} className="project-activity-item">
                <div className="milestone-head">
                  <strong>{activity.action}</strong>
                </div>
                <div className="milestone-meta">
                  <span>{activity.meetingId}</span>
                  <span>· {activity.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No recent activities.</p>
        )}
      </motion.div>

      {/* Pending Action Items */}
      <motion.div
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><ClipboardList size={16} /> Pending Action Items</h3>
        </div>
        {pendingActions.length > 0 ? (
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {pendingActions.map((action, index) => (
              <div key={index} className="milestone-item">
                <div className="milestone-head">
                  <span className="milestone-title">{action.item}</span>
                  <span className={`status-pill ${action.status === "In Progress" ? "in-progress" : "pending"}`}>
                    {action.status}
                  </span>
                </div>
                <div className="milestone-meta">
                  <span>Owner: {action.owner}</span>
                  <span>· Due: {action.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No pending action items.</p>
        )}
      </motion.div>

      {/* Latest Completed Meetings */}
      <motion.div
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><CheckCircle2 size={16} /> Latest Completed Meetings</h3>
        </div>
        {completedMeetings.length > 0 ? (
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {completedMeetings.map((meeting, index) => (
              <div key={meeting.id} className="project-activity-item">
                <div className="milestone-head">
                  <span className="milestone-title">{meeting.title}</span>
                </div>
                <div className="milestone-meta">
                  <span>{meeting.id}</span>
                  <span>· {meeting.date}</span>
                  <span>· {meeting.actualAttendance} attended</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">No completed meetings yet.</p>
        )}
      </motion.div>

      {/* Quick Summary */}
      <motion.div
        className="panel-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.28 }}
      >
        <div className="card-title-row">
          <h3><TrendingUp size={16} /> Quick Summary</h3>
        </div>
        <div className="quick-stats-grid">
          <div className="quick-stat-item">
            <div className="quick-stat-icon"><CalendarClock size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{upcomingMeetings.length}</span>
              <span className="quick-stat-label">Upcoming Meetings</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon"><CheckCircle2 size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{completedCount}</span>
              <span className="quick-stat-label">Completed</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon"><Users size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{attendanceRate}%</span>
              <span className="quick-stat-label">Attendance Rate</span>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-icon"><ClipboardList size={16} /></div>
            <div className="quick-stat-info">
              <span className="quick-stat-value">{completedActions} / {totalActions}</span>
              <span className="quick-stat-label">Actions Completed</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default MeetingSidebar;
