import { Bell, CalendarDays, ChevronDown, Menu, Moon, Sun } from "lucide-react";

function CitizenHeader({
  breadcrumb,
  currentDate,
  onToggleTheme,
  isDarkMode,
  onOpenMobileMenu,
  userName = "Citizen",
  userRole = "Ward Resident",
  unreadNotifications = 0,
  onOpenNotifications,
}) {
  return (
    <header className="top-nav citizen-top-nav">
      <div className="top-nav-row">
        <div className="top-nav-left">
          <button className="icon-btn mobile-only" onClick={onOpenMobileMenu} aria-label="Open sidebar menu">
            <Menu size={18} />
          </button>

          <div className="breadcrumb">
            {breadcrumb.map((item, index) => (
              <span key={`${item}-${index}`} className={index === breadcrumb.length - 1 ? "current" : ""}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="top-nav-right">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search complaints, projects..." />
          </div>

          <button className="icon-btn notification-btn" onClick={onOpenNotifications} aria-label="Notifications">
            <Bell size={18} />
            {unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications}</span>}
          </button>

          <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="user-menu" role="button" tabIndex={0}>
            <div className="avatar citizen-avatar">C</div>
            <div className="user-meta">
              <strong>{userName}</strong>
              <small>{userRole}</small>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      <div className="top-nav-row sub-row">
        <div className="date-chip">
          <CalendarDays size={16} />
          <span>{currentDate}</span>
        </div>
      </div>
    </header>
  );
}

export default CitizenHeader;
