




import Sparkline from "./Sparkline";

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

const WatchlistCard = ({ item, onRemove }) => {
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
  const showSinceSeen = changeSinceSeen !== null && Math.abs(changeSinceSeen) >= 0.01;

  return (
    <div className={`watchlist-row ${isMeaningful ? "highlighted" : ""}`}>
      <div className="row-title">
        <span className="ticker">{item.companyName || item.ticker}</span>
        <span className="ticker-sub">{item.ticker}</span>
      </div>

      <div className="row-price">
        <span className="current-price">₹{item.currentPrice?.toFixed(2)}</span>
        <span className={`day-change ${item.dayChangePercent >= 0 ? "up" : "down"}`}>
          {item.dayChangePercent >= 0 ? "+" : ""}
          {item.dayChangePercent?.toFixed(2)}% today
        </span>
      </div>

      <div className="row-chart">
        <Sparkline ticker={item.ticker} />
      </div>

      <div className="row-meta">
        <div className={`freshness ${item.stale ? "stale" : "live"}`}>
          {item.stale ? `⚠ Stale — ${timeAgo(item.fetchedAt)}` : `● Live — ${timeAgo(item.fetchedAt)}`}
        </div>
        {showSinceSeen && (
          <div className="since-seen">
            {changeSinceSeen >= 0 ? "+" : ""}
            {changeSinceSeen.toFixed(2)}% since last checked
          </div>
        )}
        {item.normalVolatility != null && (
          <div className="volatility-note">Normally moves ~{item.normalVolatility}%/day</div>
        )}
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
        <button className="remove-btn" onClick={() => onRemove(item.id)}>Remove</button>
      </div>
    </div>
  );
};

export default WatchlistCard;