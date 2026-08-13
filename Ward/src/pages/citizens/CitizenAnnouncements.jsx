import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Megaphone, Calendar, Tag } from "lucide-react";
import CitizenLayout from "../../components/citizens/CitizenLayout";
import { getAnnouncements } from "../../services/citizenApi";

const CATEGORIES = [
  "General",
  "Road_Maintenance",
  "Water_Service",
  "Health_Campaign",
  "Public_Participation",
  "Community_Event",
  "Emergency",
  "Other",
];

function CitizenAnnouncements() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("announcements");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const response = await getAnnouncements();
        setAnnouncements(response.announcements || []);
      } catch (error) {
        console.error("Error loading announcements:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnnouncements();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        a.title.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term);

      const matchesCategory = !categoryFilter || a.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [announcements, searchTerm, categoryFilter]);

  const breadcrumb = ["Dashboard", "Announcements"];

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
            <label className="filter-label">Search Announcements</label>
            <div className="search-input-group">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-search-input"
              />
            </div>
          </div>
          <div className="filters-select-group">
            <div className="filter-item">
              <label className="filter-label">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="loading-screen">
          <p>Loading announcements...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <motion.div
          className="panel-card empty-state-card"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="empty-state">
            <div className="empty-illustration">
              <Megaphone size={64} strokeWidth={1} />
            </div>
            <h3>No announcements found</h3>
            <p>There are no announcements matching your criteria.</p>
          </div>
        </motion.div>
      ) : (
        <div className="citizen-announcements-list">
          {filteredAnnouncements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              className="citizen-announcement-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ y: -2 }}
            >
              <div className="citizen-announcement-card-header">
                <h4>{announcement.title}</h4>
                <span className={`announcement-category-pill ${announcement.category.toLowerCase().replace("_", "-")}`}>
                  {announcement.category.replace("_", " ")}
                </span>
              </div>
              <p className="citizen-announcement-desc">{announcement.description}</p>
              <div className="citizen-announcement-meta">
                <span>
                  <Calendar size={14} />
                  {announcement.publishedAt
                    ? new Date(announcement.publishedAt).toLocaleDateString()
                    : new Date(announcement.createdAt).toLocaleDateString()}
                </span>
                <span>
                  <Tag size={14} />
                  {announcement.ward}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </CitizenLayout>
  );
}

export default CitizenAnnouncements;
