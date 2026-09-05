import { useEffect, useState, useCallback } from "react";
import {
  getFeed,
  addTicker,
  removeTicker,
  markAsSeen,
  updateSensitivity,
} from "../services/watchlistService";
import WatchlistCard from "../components/WatchlistCard";
import AddTickerForm from "../components/AddTickerForm";
import Header from "../components/Header";

const Dashboard = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadFeed = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError("");
    try {
      const data = await getFeed();
      setFeed(data);
    } catch (err) {
      setError("Could not load watchlist. Try refreshing.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
    const interval = setInterval(() => loadFeed(true), 30000);
    return () => clearInterval(interval);
  }, [loadFeed]);

  const handleAdd = async (ticker, sensitivity) => {
    await addTicker(ticker, sensitivity);
    await loadFeed();
  };

  const handleRemove = async (id) => {
    await removeTicker(id);
    setFeed((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMarkSeen = async (id) => {
    await markAsSeen(id);
    await loadFeed();
  };

  const handleSensitivityChange = async (id, sensitivity) => {
    await updateSensitivity(id, sensitivity);
    await loadFeed();
  };

  const meaningfulItems = feed.filter((item) => item.isMeaningful);
  const quietItems = feed.filter((item) => !item.isMeaningful && !item.error);
  const errorItems = feed.filter((item) => item.error);

  return (
    <div className="app-shell">
      <Header />

      <main className="dashboard">
        <div className="dashboard-top">
          <AddTickerForm onAdd={handleAdd} />
          <button className="refresh-btn" onClick={() => loadFeed(true)} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="digest-strip">
          {meaningfulItems.length > 0
            ? `${meaningfulItems.length} of ${feed.length} stocks moved meaningfully since you last checked.`
            : feed.length > 0
            ? "Nothing meaningful has changed since you last checked."
            : "Add a ticker to start tracking."}
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="loading-text">Loading watchlist...</p>
        ) : (
          <>
            {meaningfulItems.length > 0 && (
              <section className="feed-section">
                <h2 className="section-title">Needs your attention</h2>
                <div className="feed-list">
                  {meaningfulItems.map((item) => (
                    <WatchlistCard
                      key={item.id}
                      item={item}
                      onMarkSeen={handleMarkSeen}
                      onRemove={handleRemove}
                      onSensitivityChange={handleSensitivityChange}
                    />
                  ))}
                </div>
              </section>
            )}

            {quietItems.length > 0 && (
              <section className="feed-section quiet-section">
                <h2 className="section-title">Everything else</h2>
                <div className="feed-list quiet-list">
                  {quietItems.map((item) => (
                    <WatchlistCard
                      key={item.id}
                      item={item}
                      onMarkSeen={handleMarkSeen}
                      onRemove={handleRemove}
                      onSensitivityChange={handleSensitivityChange}
                    />
                  ))}
                </div>
              </section>
            )}

            {errorItems.length > 0 && (
              <section className="feed-section">
                <h2 className="section-title">Needs attention (data issue)</h2>
                <div className="feed-list">
                  {errorItems.map((item) => (
                    <WatchlistCard
                      key={item.id}
                      item={item}
                      onMarkSeen={handleMarkSeen}
                      onRemove={handleRemove}
                      onSensitivityChange={handleSensitivityChange}
                    />
                  ))}
                </div>
              </section>
            )}

            {feed.length === 0 && (
              <p className="empty-text">Your watchlist is empty — search above to add a ticker.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;