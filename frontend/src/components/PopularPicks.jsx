
import { useEffect, useState, useCallback } from "react";
import { getPopularPicks } from "../services/watchlistService";

const DISPLAY_COUNT = 6;

const PopularPicks = ({ watchlistTickers, onAdd, hidden, onToggleHidden }) => {
  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingTicker, setAddingTicker] = useState(null);

  const loadPool = useCallback(async () => {
    try {
      const picks = await getPopularPicks();
      setPool(picks);
    } catch (err) {
      setPool([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPool();
  }, [loadPool]);

  // Filtering already-added tickers out of the pool naturally "backfills" the
  // next candidate into the visible slots — no extra bookkeeping needed.
  const visiblePicks = pool
    .filter((p) => !watchlistTickers.includes(p.ticker))
    .slice(0, DISPLAY_COUNT);

  const handleAdd = async (pick) => {
    setAddingTicker(pick.ticker);
    try {
      await onAdd(pick.ticker, pick.companyName);
    } finally {
      setAddingTicker(null);
    }
  };

  if (hidden) {
    return (
      <button className="show-recos-btn" onClick={onToggleHidden}>
        Show recommendations
      </button>
    );
  }

  return (
    <aside className="popular-sidebar">
      <div className="popular-sidebar-header">
        <h3 className="popular-title">Popular picks</h3>
        <button className="hide-recos-btn" onClick={onToggleHidden}>Hide</button>
      </div>

      {loading ? (
        <p className="hint">Loading...</p>
      ) : visiblePicks.length === 0 ? (
        <p className="hint">You've added all our top picks!</p>
      ) : (
        <div className="popular-list">
          {visiblePicks.map((pick) => (
            <button
              key={pick.ticker}
              className="popular-row"
              onClick={() => handleAdd(pick)}
              disabled={addingTicker === pick.ticker}
            >
              <div className="popular-row-info">
                <span className="popular-name">{pick.companyName}</span>
                <span className="popular-symbol">{pick.ticker}</span>
              </div>
              <div className="popular-row-price">
                <span className="current-price-sm">₹{pick.currentPrice?.toFixed(2)}</span>
                <span className={`popular-change ${pick.dayChangePercent >= 0 ? "up" : "down"}`}>
                  {pick.dayChangePercent >= 0 ? "+" : ""}
                  {pick.dayChangePercent?.toFixed(2)}%
                </span>
              </div>
              <span className="popular-plus">{addingTicker === pick.ticker ? "…" : "+"}</span>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
};

export default PopularPicks;