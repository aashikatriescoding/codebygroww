// import { useState } from "react";

// const AddTickerForm = ({ onAdd }) => {
//   const [ticker, setTicker] = useState("");
//   const [sensitivity, setSensitivity] = useState("casual");
//   const [error, setError] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!ticker.trim()) return;

//     setError("");
//     setSubmitting(true);
//     try {
//       await onAdd(ticker.trim().toUpperCase(), sensitivity);
//       setTicker("");
//     } catch (err) {
//       setError(err.response?.data?.message || "Could not add ticker");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="add-ticker-form">
//       <input
//         type="text"
//         placeholder="e.g. RELIANCE.NS, TCS.NS, AAPL"
//         value={ticker}
//         onChange={(e) => setTicker(e.target.value)}
//       />
//       <select value={sensitivity} onChange={(e) => setSensitivity(e.target.value)}>
//         <option value="casual">Casual</option>
//         <option value="core">Core</option>
//       </select>
//       <button type="submit" disabled={submitting}>
//         {submitting ? "Adding..." : "Add"}
//       </button>
//       {error && <p className="error">{error}</p>}
//     </form>
//   );
// };

// export default AddTickerForm;










import { useState, useEffect, useRef } from "react";
import { searchTickers } from "../services/watchlistService";

const AddTickerForm = ({ onAdd }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sensitivity, setSensitivity] = useState("casual");
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

  const handleSelect = async (symbol) => {
    setError("");
    setSubmitting(true);
    setShowSuggestions(false);
    try {
      await onAdd(symbol, sensitivity);
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
        <select value={sensitivity} onChange={(e) => setSensitivity(e.target.value)}>
          <option value="casual">Casual</option>
          <option value="core">Core</option>
        </select>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((s) => (
            <div
              key={s.symbol}
              className="suggestion-item"
              onClick={() => handleSelect(s.symbol)}
            >
              <span className="suggestion-symbol">{s.symbol}</span>
              <span className="suggestion-name">{s.name}</span>
              <span className="suggestion-exchange">{s.exchange}</span>
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