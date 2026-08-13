import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, CalendarDays, MapPin, Clock, Users, Filter } from "lucide-react";
import CitizenLayout from "../../components/citizens/CitizenLayout";
import { getWardMeetings } from "../../services/citizenApi";

const MEETING_TYPES = [
  "Ward_Development_Committee",
  "Public_Baraza",
  "Budget_Review",
  "Planning_Session",
  "Town_Hall",
  "Project_Steering_Committee",
  "Health_Sanitation_Forum",
  "Education_Committee",
  "Security_Committee",
  "Water_Environment_Committee",
];

function CitizenMeetings() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("meetings");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    async function loadMeetings() {
      try {
        const response = await getWardMeetings();
        setMeetings(response.meetings || []);
      } catch (error) {
        console.error("Error loading meetings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMeetings();
  }, []);

  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        m.title.toLowerCase().includes(term) ||
        m.venue.toLowerCase().includes(term) ||
        (m.description && m.description.toLowerCase().includes(term));

      const matchesType = !typeFilter || m.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [meetings, searchTerm, typeFilter]);

  const breadcrumb = ["Dashboard", "Upcoming Meetings"];

  const handleItemClick = (id) => {
    setActiveItem(id);
    switch (id) {
      case "dashboard":
        navigate("/citizen/dashboard");
        break;
      case "complaints":
        navigate("/citizen/complaints");
        break;
      case "projects":
        navigate("/citizen/projects");
        break;
      case "meetings":
        navigate("/citizen/meetings");
        break;
      case "announcements":
        navigate("/citizen/announcements");
        break;
      case "notifications":
        navigate("/citizen/notifications");
        break;
      case "profile":
        navigate("/citizen/profile");
        break;
      default:
        break;
    }
  };

  return (
    <CitizenLayout activeItem={activeItem} onItemClick={handleItemClick} breadcrumb={breadcrumb}>
      {/* Filters */}
      <div className="citizen-filters">
        <div className="filters-row">
          <div className="filters-search-group">
            <label className="filter-label">Search Meetings</label>
            <div className="search-input-group">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by title, venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-search-input"
              />
            </div>
          </div>
          <div className="filters-select-group">
            <div className="filter-item">
              <label className="filter-label">Meeting Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                {MEETING_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      {loading ? (
        <div className="loading-screen">
          <p>Loading meetings...</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <motion.div
          className="panel-card empty-state-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="empty-state">
            <div className="empty-illustration">
              <CalendarDays size={64} strokeWidth={1} />
            </div>
            <h3>No upcoming meetings</h3>
            <p>There are no upcoming meetings scheduled at this time.</p>
          </div>
        </motion.div>
      ) : (
        <div className="citizen-meetings-list">
          {filteredMeetings.map((meeting, index) => (
            <motion.div
              key={meeting.id}
              className="citizen-meeting-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ y: -2 }}
            >
              <div className="citizen-meeting-card-header">
                <h4>{meeting.title}</h4>
                <span className={`status-pill meeting-${meeting.status.toLowerCase()}`}>
                  {meeting.status}
                </span>
              </div>

              <p className="citizen-meeting-type">
                <span className={`meeting-type-pill ${meeting.type.toLowerCase().replace("_", "-")}`}>
                  {meeting.type.replace("_", " ")}
                </span>
              </p>

              {meeting.description && (
                <p className="citizen-meeting-desc">{meeting.description}</p>
              )}

              <div className="citizen-meeting-details">
                <div className="citizen-meeting-detail">
                  <CalendarDays size={14} />
                  <span>{meeting.date}</span>
                </div>
                <div className="citizen-meeting-detail">
                  <Clock size={14} />
                  <span>
                    {meeting.time} - {meeting.endTime}
                  </span>
                </div>
                <div className="citizen-meeting-detail">
                  <MapPin size={14} />
                  <span>{meeting.venue}</span>
                </div>
                <div className="citizen-meeting-detail">
                  <Users size={14} />
                  <span>Expected: {meeting.expectedAttendance}</span>
                </div>
              </div>

              {meeting.chairperson && (
                <p className="citizen-meeting-chairperson">
                  Chairperson: {meeting.chairperson}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </CitizenLayout>
  );
}

export default CitizenMeetings;
