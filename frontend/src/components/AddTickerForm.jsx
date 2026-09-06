
import { useState, useEffect, useRef } from "react";
import { searchTickers } from "../services/watchlistService";

const AddTickerForm = ({ onAdd }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchTickers(query.trim());
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([]);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (result) => {
    setError("");
    setSubmitting(true);
    setShowSuggestions(false);
    try {
      await onAdd(result.symbol, result.name);
      setQuery("");
      setSuggestions([]);
    } catch (err) {
      setError(err.response?.data?.message || "Could not add ticker");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-ticker-wrapper" ref={wrapperRef}>
      <div className="add-ticker-form">
        <input
          type="text"
          placeholder="Search company or ticker — e.g. HDFC Bank, Reliance, Apple"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((s) => (
            <div key={s.symbol} className="suggestion-item" onClick={() => handleSelect(s)}>
              <span className="suggestion-symbol">{s.symbol}</span>
              <span className="suggestion-name">{s.name}</span>
              <span className={`suggestion-exchange ${["NSI", "BSE"].includes(s.exchange) ? "exchange-in" : ""}`}>
                {s.exchange}
              </span>
            </div>
          ))}
        </div>
      )}

      {submitting && <p className="hint">Adding...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default AddTickerForm;