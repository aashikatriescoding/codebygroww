import { useEffect, useState } from "react";
import { getIndices, getMovers } from "../services/marketService";
import { addTicker, searchTickers } from "../services/watchlistService";
import { getWatchlists } from "../services/watchlistsService";
import Header from "../components/Header";
import Sparkline from "../components/Sparkline";

const Markets = () => {
  const [indices, setIndices] = useState([]);
  const [movers, setMovers] = useState([]);
  const [moverType, setMoverType] = useState("gainers");
  const [loading, setLoading] = useState(true);
  const [watchlists, setWatchlists] = useState([]);
  const [addedTickers, setAddedTickers] = useState(new Set());
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    getIndices().then(setIndices).catch(() => setIndices([]));
    getWatchlists().then(setWatchlists).catch(() => setWatchlists([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    getMovers(moverType)
      .then(setMovers)
      .catch(() => setMovers([]))
      .finally(() => setLoading(false));
  }, [moverType]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      searchTickers(query.trim())
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleQuickAdd = async (ticker, companyName) => {
    if (watchlists.length === 0) return;
    try {
      await addTicker(ticker, companyName, watchlists[0]._id);
      setAddedTickers((prev) => new Set(prev).add(ticker));
    } catch (err) {
      // likely already in that watchlist — treat as a no-op
      setAddedTickers((prev) => new Set(prev).add(ticker));
    }
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="markets-page">
        <h1 className="markets-title">Markets</h1>

        <section className="markets-section">
          <h2 className="section-title">Index Heatmap</h2>
          <div className="index-heatmap">
            {indices.map((idx) => (
              <div
                key={idx.ticker}
                className={`heatmap-tile ${idx.dayChangePercent >= 0 ? "tile-up" : "tile-down"}`}
              >
                <span className="tile-name">{idx.name}</span>
                <span className="tile-price">{idx.price?.toFixed(2)}</span>
                <span className="tile-change">
                  {idx.dayChangePercent >= 0 ? "+" : ""}
                  {idx.dayChangePercent?.toFixed(2)}%
                </span>
              </div>
            ))}
            {indices.length === 0 && <p className="hint">Index data unavailable right now.</p>}
          </div>
        </section>

        <section className="markets-section">
          <div className="movers-header">
            <h2 className="section-title">Top Movers</h2>
            <div className="movers-toggle">
              <button
                className={moverType === "gainers" ? "active" : ""}
                onClick={() => setMoverType("gainers")}
              >
                Gainers
              </button>
              <button
                className={moverType === "losers" ? "active" : ""}
                onClick={() => setMoverType("losers")}
              >
                Losers
              </button>
            </div>
          </div>

          {loading ? (
            <p className="hint">Loading...</p>
          ) : (
            <div className="movers-list">
              {movers.map((m) => (
                <div key={m.ticker} className="mover-row">
                  <div className="row-title">
                    <span className="ticker">{m.companyName}</span>
                    <span className="ticker-sub">{m.ticker}</span>
                  </div>
                  <Sparkline ticker={m.ticker} />
                  <div className="row-price">
                    <span className="current-price">₹{m.currentPrice?.toFixed(2)}</span>
                    <span className={`day-change ${m.dayChangePercent >= 0 ? "up" : "down"}`}>
                      {m.dayChangePercent >= 0 ? "+" : ""}
                      {m.dayChangePercent?.toFixed(2)}%
                    </span>
                  </div>
                  <button
                    className="quick-add-btn"
                    disabled={addedTickers.has(m.ticker)}
                    onClick={() => handleQuickAdd(m.ticker, m.companyName)}
                  >
                    {addedTickers.has(m.ticker) ? "Added" : "+ Add"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="markets-section">
          <h2 className="section-title">Browse Stocks</h2>
          <input
            className="markets-search"
            placeholder="Search any company or ticker..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className="movers-list">
              {searchResults.map((s) => (
                <div key={s.symbol} className="mover-row">
                  <div className="row-title">
                    <span className="ticker">{s.name}</span>
                    <span className="ticker-sub">{s.symbol} · {s.exchange}</span>
                  </div>
                  <button
                    className="quick-add-btn"
                    disabled={addedTickers.has(s.symbol)}
                    onClick={() => handleQuickAdd(s.symbol, s.name)}
                  >
                    {addedTickers.has(s.symbol) ? "Added" : "+ Add"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Markets;