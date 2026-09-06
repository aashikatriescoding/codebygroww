

import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [indexData, setIndexData] = useState(null);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("shift-theme") === "dark"
  );

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

  useEffect(() => {
    const loadIndex = async () => {
      try {
        const res = await api.get(`/market/${encodeURIComponent("^NSEI")}`);
        setIndexData(res.data.data);
      } catch (err) {
        setIndexData(null);
      }
    };

    loadIndex();
    const interval = setInterval(loadIndex, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("theme-dark", darkMode);
    localStorage.setItem("shift-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const initials = user?.email ? user.email[0].toUpperCase() : "?";

  return (
    <header className="app-header">
      <div className="app-header-left">
        <span className="app-logo">
          Shift<span className="logo-dot">.</span>
        </span>
        <span className="app-tagline">Signals That Matter</span>
      </div>

      {indexData && (
        <div className="index-ticker">
          <span className="index-name">NIFTY 50</span>
          <span className="index-price">{indexData.price?.toFixed(2)}</span>
          <span
            className={`index-change ${
              indexData.dayChangePercent >= 0 ? "up" : "down"
            }`}
          >
            {indexData.dayChangePercent >= 0 ? "+" : ""}
            {indexData.dayChangePercent?.toFixed(2)}%
          </span>
        </div>
      )}

      <nav className="app-header-nav">
        <span
          className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
          onClick={() => navigate("/")}
        >
          Watchlist
        </span>
        <span
          className={`nav-item ${
            location.pathname === "/markets" ? "active" : ""
          }`}
          onClick={() => navigate("/markets")}
        >
          Markets
        </span>
        <span
          className={`nav-item ${
            location.pathname === "/news" ? "active" : ""
          }`}
          onClick={() => navigate("/news")}
        >
          News
        </span>
      </nav>

      <div className="app-header-right" ref={menuRef}>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Light mode" : "Dark mode"}
        >
          <span aria-hidden="true">{darkMode ? "☀" : "☾"}</span>
        </button>

        <button
          type="button"
          className="user-avatar"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open account menu"
        >
          {initials}
        </button>

        {menuOpen && (
          <div className="user-dropdown">
            <div className="user-email">{user?.email}</div>
            <button type="button" onClick={logout}>
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
