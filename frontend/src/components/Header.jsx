import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";

const Header = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.email ? user.email[0].toUpperCase() : "?";

  return (
    <header className="app-header">
      <div className="app-header-left">
        <span className="app-logo">Vantage</span>
        <span className="app-tagline">Watchlist</span>
      </div>

      <nav className="app-header-nav">
        <span className="nav-item active">Watchlist</span>
        <span className="nav-item disabled">Markets</span>
        <span className="nav-item disabled">News</span>
      </nav>

      <div className="app-header-right" ref={menuRef}>
        <button className="user-avatar" onClick={() => setMenuOpen((v) => !v)}>
          {initials}
        </button>
        {menuOpen && (
          <div className="user-dropdown">
            <div className="user-email">{user?.email}</div>
            <button onClick={logout}>Log out</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;