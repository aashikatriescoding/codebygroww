// const FLAG_LABELS = {
//   moved_up: { text: "Moved Up", color: "#1a7f37" },
//   moved_down: { text: "Moved Down", color: "#c9251c" },
//   "52_week_high": { text: "52W High", color: "#8250df" },
//   "52_week_low": { text: "52W Low", color: "#9a6700" },
//   volume_spike: { text: "Volume Spike", color: "#0969da" },
// };

// const WatchlistCard = ({ item, onMarkSeen, onRemove, onSensitivityChange }) => {
//   if (item.error) {
//     return (
//       <div className="watchlist-card error-card">
//         <span className="ticker">{item.ticker}</span>
//         <span className="error-text">{item.error}</span>
//         <button onClick={() => onRemove(item.id)}>Remove</button>
//       </div>
//     );
//   }

//   const isMeaningful = item.isMeaningful;
//   const changeSinceSeen = item.percentChangeSinceSeen;

//   return (
//     <div className={`watchlist-card ${isMeaningful ? "highlighted" : ""}`}>
//       <div className="card-top">
//         <span className="ticker">{item.ticker}</span>
//         <span className={`sensitivity-badge ${item.sensitivity}`}>
//           {item.sensitivity}
//         </span>
//       </div>

//       <div className="price-row">
//         <span className="current-price">₹{item.currentPrice?.toFixed(2)}</span>
//         <span className={`day-change ${item.dayChangePercent >= 0 ? "up" : "down"}`}>
//           {item.dayChangePercent >= 0 ? "+" : ""}
//           {item.dayChangePercent?.toFixed(2)}% today
//         </span>
//       </div>

//       {changeSinceSeen !== null && (
//         <div className="since-seen">
//           {changeSinceSeen >= 0 ? "+" : ""}
//           {changeSinceSeen.toFixed(2)}% since you last checked
//         </div>
//       )}

//       {item.flags && item.flags.length > 0 && (
//         <div className="flags">
//           {item.flags.map((flag) => (
//             <span
//               key={flag}
//               className="flag-badge"
//               style={{ backgroundColor: FLAG_LABELS[flag]?.color || "#666" }}
//             >
//               {FLAG_LABELS[flag]?.text || flag}
//             </span>
//           ))}
//         </div>
//       )}

//       <div className="card-actions">
//         <button onClick={() => onMarkSeen(item.id)}>Mark as seen</button>
//         <select
//           value={item.sensitivity}
//           onChange={(e) => onSensitivityChange(item.id, e.target.value)}
//         >
//           <option value="core">Core</option>
//           <option value="casual">Casual</option>
//         </select>
//         <button className="remove-btn" onClick={() => onRemove(item.id)}>
//           Remove
//         </button>
//       </div>
//     </div>
//   );
// };

// export default WatchlistCard;










import { useState } from "react";

const FLAG_LABELS = {
  moved_up: { text: "Moved Up", color: "#1a7f37" },
  moved_down: { text: "Moved Down", color: "#c9251c" },
  "52_week_high": { text: "52W High", color: "#8250df" },
  "52_week_low": { text: "52W Low", color: "#9a6700" },
  volume_spike: { text: "Volume Spike", color: "#0969da" },
};

const timeAgo = (dateString) => {
  if (!dateString) return "unknown";
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const WatchlistCard = ({ item, onMarkSeen, onRemove, onSensitivityChange }) => {
  const [justSeen, setJustSeen] = useState(false);
  const [marking, setMarking] = useState(false);

  const handleMarkSeen = async () => {
    setMarking(true);
    try {
      await onMarkSeen(item.id);
      setJustSeen(true);
      setTimeout(() => setJustSeen(false), 2500);
    } finally {
      setMarking(false);
    }
  };

  if (item.error) {
    return (
      <div className="watchlist-row error-row">
        <div className="row-title">
          <span className="ticker">{item.companyName || item.ticker}</span>
          <span className="ticker-sub">{item.ticker}</span>
        </div>
        <span className="error-text">{item.error}</span>
        <button className="remove-btn" onClick={() => onRemove(item.id)}>Remove</button>
      </div>
    );
  }

  const isMeaningful = item.isMeaningful;
  const changeSinceSeen = item.percentChangeSinceSeen;

  return (
    <div className={`watchlist-row ${isMeaningful ? "highlighted" : ""}`}>
      <div className="row-title">
        <span className="ticker">{item.companyName || item.ticker}</span>
        <span className="ticker-sub">{item.ticker}</span>
        <span className={`sensitivity-badge ${item.sensitivity}`}>
          {item.sensitivity === "core" ? "Any move" : "Big moves"}
        </span>
      </div>

      <div className="row-price">
        <span className="current-price">₹{item.currentPrice?.toFixed(2)}</span>
        <span className={`day-change ${item.dayChangePercent >= 0 ? "up" : "down"}`}>
          {item.dayChangePercent >= 0 ? "+" : ""}
          {item.dayChangePercent?.toFixed(2)}% today
        </span>
      </div>

      <div className="row-meta">
        <div className={`freshness ${item.stale ? "stale" : "live"}`}>
          {item.stale ? `⚠ Stale — ${timeAgo(item.fetchedAt)}` : `● Live — ${timeAgo(item.fetchedAt)}`}
        </div>
        {changeSinceSeen !== null && (
          <div className="since-seen">
            {changeSinceSeen >= 0 ? "+" : ""}
            {changeSinceSeen.toFixed(2)}% since last checked
          </div>
        )}
        <div className="checked-count">Checked {item.timesChecked || 0}×</div>
      </div>

      <div className="row-signals">
        {item.flags && item.flags.length > 0 && (
          <div className="flags">
            {item.flags.map((flag) => (
              <span
                key={flag}
                className="flag-badge"
                style={{ backgroundColor: FLAG_LABELS[flag]?.color || "#666" }}
              >
                {FLAG_LABELS[flag]?.text || flag}
              </span>
            ))}
          </div>
        )}
        {item.aiSummary && <div className="ai-summary">✨ {item.aiSummary}</div>}
      </div>

      <div className="row-actions">
        <button className={`seen-btn ${justSeen ? "seen-confirmed" : ""}`} onClick={handleMarkSeen} disabled={marking}>
          {justSeen ? "✓ Marked" : marking ? "Marking..." : "Mark as seen"}
        </button>
        <select value={item.sensitivity} onChange={(e) => onSensitivityChange(item.id, e.target.value)}>
          <option value="core">Any move</option>
          <option value="casual">Big moves</option>
        </select>
        <button className="remove-btn" onClick={() => onRemove(item.id)}>Remove</button>
      </div>
    </div>
  );
};

export default WatchlistCard;