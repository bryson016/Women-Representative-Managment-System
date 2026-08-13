import { Bell, CalendarDays, ChevronDown, Menu, Moon, Search, Sun } from "lucide-react";

function TopNavbar({
  breadcrumb,
  currentDate,
  onToggleTheme,
  isDarkMode,
  onOpenMobileMenu,
  userName = "Hon. Gabriel Kithaka",
  userRole = "Ward Administrator",
}) {
  return (
    <header className="top-nav">
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
            <Search size={16} />
            <input type="text" placeholder="Search citizens, complaints, projects..." />
          </div>

          <button className="icon-btn" aria-label="Notifications">
            <Bell size={18} />
            <span className="badge-dot" />
          </button>

          <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="user-menu" role="button" tabIndex={0}>
            <div className="avatar">JK</div>
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

export default TopNavbar;
