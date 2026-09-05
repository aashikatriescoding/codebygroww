const FLAG_LABELS = {
  moved_up: { text: "Moved Up", color: "#1a7f37" },
  moved_down: { text: "Moved Down", color: "#c9251c" },
  "52_week_high": { text: "52W High", color: "#8250df" },
  "52_week_low": { text: "52W Low", color: "#9a6700" },
  volume_spike: { text: "Volume Spike", color: "#0969da" },
};

const WatchlistCard = ({ item, onMarkSeen, onRemove, onSensitivityChange }) => {
  if (item.error) {
    return (
      <div className="watchlist-card error-card">
        <span className="ticker">{item.ticker}</span>
        <span className="error-text">{item.error}</span>
        <button onClick={() => onRemove(item.id)}>Remove</button>
      </div>
    );
  }

  const isMeaningful = item.isMeaningful;
  const changeSinceSeen = item.percentChangeSinceSeen;

  return (
    <div className={`watchlist-card ${isMeaningful ? "highlighted" : ""}`}>
      <div className="card-top">
        <span className="ticker">{item.ticker}</span>
        <span className={`sensitivity-badge ${item.sensitivity}`}>
          {item.sensitivity}
        </span>
      </div>

      <div className="price-row">
        <span className="current-price">₹{item.currentPrice?.toFixed(2)}</span>
        <span className={`day-change ${item.dayChangePercent >= 0 ? "up" : "down"}`}>
          {item.dayChangePercent >= 0 ? "+" : ""}
          {item.dayChangePercent?.toFixed(2)}% today
        </span>
      </div>

      {changeSinceSeen !== null && (
        <div className="since-seen">
          {changeSinceSeen >= 0 ? "+" : ""}
          {changeSinceSeen.toFixed(2)}% since you last checked
        </div>
      )}

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

      <div className="card-actions">
        <button onClick={() => onMarkSeen(item.id)}>Mark as seen</button>
        <select
          value={item.sensitivity}
          onChange={(e) => onSensitivityChange(item.id, e.target.value)}
        >
          <option value="core">Core</option>
          <option value="casual">Casual</option>
        </select>
        <button className="remove-btn" onClick={() => onRemove(item.id)}>
          Remove
        </button>
      </div>
    </div>
  );
};

export default WatchlistCard;