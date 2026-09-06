

// import { useEffect, useState, useCallback, useMemo } from "react";
// import {
//   getFeed,
//   addTicker,
//   removeTicker,
//   markAsSeen,
//   updateSensitivity,
// } from "../services/watchlistService";
// import WatchlistCard from "../components/WatchlistCard";
// import AddTickerForm from "../components/AddTickerForm";
// import Header from "../components/Header";
// import ChatWidget from "../components/ChatWidget";
// import PopularPicks from "../components/PopularPicks";

// const SORT_OPTIONS = [
//   { value: "attention", label: "Most likely to need attention" },
//   { value: "gainers", label: "Gainers (high to low)" },
//   { value: "losers", label: "Losers (high to low)" },
//   { value: "alphabetical", label: "Alphabetical" },
//   { value: "mostChecked", label: "Most checked" },
// ];

// const FILTER_OPTIONS = [
//   { value: "all", label: "All tickers" },
//   { value: "meaningful", label: "Needs attention only" },
//   { value: "core", label: "Core (alerts on any move)" },
//   { value: "casual", label: "Casual (alerts on big moves)" },
//   { value: "gainers", label: "Positive today" },
//   { value: "losers", label: "Negative today" },
// ];

// const Dashboard = () => {
//   const [feed, setFeed] = useState([]);
//   const [digest, setDigest] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState("");
//   const [sortBy, setSortBy] = useState("attention");
//   const [filterBy, setFilterBy] = useState("all");
//   const [recosHidden, setRecosHidden] = useState(
//     () => localStorage.getItem("recosHidden") === "true"
//   );

//   const loadFeed = useCallback(async (isRefresh = false) => {
//     if (isRefresh) setRefreshing(true);
//     setError("");
//     try {
//       const { feed: data, digest: aiDigest } = await getFeed();
//       setFeed(data);
//       setDigest(aiDigest);
//     } catch (err) {
//       setError("Could not load watchlist. Try refreshing.");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadFeed();
//     const interval = setInterval(() => loadFeed(true), 30000);
//     return () => clearInterval(interval);
//   }, [loadFeed]);

//   const toggleRecos = () => {
//     setRecosHidden((prev) => {
//       const next = !prev;
//       localStorage.setItem("recosHidden", String(next));
//       return next;
//     });
//   };

//   const handleAdd = async (ticker, sensitivity, companyName) => {
//     await addTicker(ticker, sensitivity, companyName);
//     await loadFeed();
//   };

//   const handleRemove = async (id) => {
//     await removeTicker(id);
//     setFeed((prev) => prev.filter((item) => item.id !== id));
//   };

//   const handleMarkSeen = async (id) => {
//     await markAsSeen(id);
//     await loadFeed();
//   };

//   const handleSensitivityChange = async (id, sensitivity) => {
//     await updateSensitivity(id, sensitivity);
//     await loadFeed();
//   };

//   const filteredFeed = useMemo(() => {
//     switch (filterBy) {
//       case "meaningful":
//         return feed.filter((item) => item.isMeaningful);
//       case "core":
//         return feed.filter((item) => item.sensitivity === "core");
//       case "casual":
//         return feed.filter((item) => item.sensitivity === "casual");
//       case "gainers":
//         return feed.filter((item) => !item.error && item.dayChangePercent > 0);
//       case "losers":
//         return feed.filter((item) => !item.error && item.dayChangePercent < 0);
//       default:
//         return feed;
//     }
//   }, [feed, filterBy]);

//   const sortedFeed = useMemo(() => {
//     const clean = filteredFeed.filter((item) => !item.error);
//     const errors = filteredFeed.filter((item) => item.error);
//     const sorted = [...clean];

//     switch (sortBy) {
//       case "gainers":
//         sorted.sort((a, b) => (b.dayChangePercent || 0) - (a.dayChangePercent || 0));
//         break;
//       case "losers":
//         sorted.sort((a, b) => (a.dayChangePercent || 0) - (b.dayChangePercent || 0));
//         break;
//       case "alphabetical":
//         sorted.sort((a, b) => (a.companyName || a.ticker).localeCompare(b.companyName || b.ticker));
//         break;
//       case "mostChecked":
//         sorted.sort((a, b) => (b.timesChecked || 0) - (a.timesChecked || 0));
//         break;
//       default:
//         sorted.sort((a, b) => (b.attentionScore || 0) - (a.attentionScore || 0));
//     }

//     return [...sorted, ...errors];
//   }, [filteredFeed, sortBy]);

//   const meaningfulItems = feed.filter((item) => item.isMeaningful);
//   const useGroupedView = sortBy === "attention" && filterBy === "all";
//   const watchlistTickers = feed.map((item) => item.ticker);

//   return (
//     <div className="app-shell">
//       <Header />

//       <div className="dashboard-layout">
//         <main className="dashboard">
//           <div className="dashboard-top">
//             <AddTickerForm onAdd={handleAdd} />
//             <select className="sort-select" value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
//               {FILTER_OPTIONS.map((opt) => (
//                 <option key={opt.value} value={opt.value}>{opt.label}</option>
//               ))}
//             </select>
//             <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
//               {SORT_OPTIONS.map((opt) => (
//                 <option key={opt.value} value={opt.value}>{opt.label}</option>
//               ))}
//             </select>
//             <button className="refresh-btn" onClick={() => loadFeed(true)} disabled={refreshing}>
//               {refreshing ? "Refreshing..." : "Refresh"}
//             </button>
//           </div>

//           {feed.length > 0 && (
//             <div className="digest-strip">
//               {digest
//                 ? digest
//                 : meaningfulItems.length > 0
//                 ? `${meaningfulItems.length} of ${feed.length} stocks moved meaningfully since you last checked.`
//                 : "Nothing meaningful has changed since you last checked."}
//             </div>
//           )}

//           {error && <p className="error">{error}</p>}

//           {loading ? (
//             <p className="loading-text">Loading watchlist...</p>
//           ) : feed.length === 0 ? (
//             <p className="empty-text">Your watchlist is empty — search above or pick from the sidebar.</p>
//           ) : sortedFeed.length === 0 ? (
//             <p className="empty-text">No tickers match this filter.</p>
//           ) : useGroupedView ? (
//             <>
//               {meaningfulItems.length > 0 && (
//                 <section className="feed-section">
//                   <h2 className="section-title">Needs your attention</h2>
//                   <div className="feed-list-vertical">
//                     {meaningfulItems.map((item) => (
//                       <WatchlistCard
//                         key={item.id}
//                         item={item}
//                         onMarkSeen={handleMarkSeen}
//                         onRemove={handleRemove}
//                         onSensitivityChange={handleSensitivityChange}
//                       />
//                     ))}
//                   </div>
//                 </section>
//               )}
//               <section className="feed-section">
//                 <h2 className="section-title">Everything else</h2>
//                 <div className="feed-list-vertical quiet-list">
//                   {feed.filter((i) => !i.isMeaningful).map((item) => (
//                     <WatchlistCard
//                       key={item.id}
//                       item={item}
//                       onMarkSeen={handleMarkSeen}
//                       onRemove={handleRemove}
//                       onSensitivityChange={handleSensitivityChange}
//                     />
//                   ))}
//                 </div>
//               </section>
//             </>
//           ) : (
//             <div className="feed-list-vertical">
//               {sortedFeed.map((item) => (
//                 <WatchlistCard
//                   key={item.id}
//                   item={item}
//                   onMarkSeen={handleMarkSeen}
//                   onRemove={handleRemove}
//                   onSensitivityChange={handleSensitivityChange}
//                 />
//               ))}
//             </div>
//           )}
//         </main>

//         <PopularPicks
//           watchlistTickers={watchlistTickers}
//           onAdd={handleAdd}
//           hidden={recosHidden}
//           onToggleHidden={toggleRecos}
//         />
//       </div>

//       <ChatWidget />
//     </div>
//   );
// };

// export default Dashboard;










import { useEffect, useState, useCallback, useMemo } from "react";
import { getFeed, addTicker, removeTicker } from "../services/watchlistService";
import WatchlistCard from "../components/WatchlistCard";
import AddTickerForm from "../components/AddTickerForm";
import Header from "../components/Header";
import ChatWidget from "../components/ChatWidget";
import PopularPicks from "../components/PopularPicks";

const SORT_OPTIONS = [
  { value: "attention", label: "Most likely to need attention" },
  { value: "gainers", label: "Gainers (high to low)" },
  { value: "losers", label: "Losers (high to low)" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "mostChecked", label: "Most checked" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All tickers" },
  { value: "meaningful", label: "Needs attention only" },
  { value: "gainers", label: "Positive today" },
  { value: "losers", label: "Negative today" },
];

const Dashboard = () => {
  const [feed, setFeed] = useState([]);
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("attention");
  const [filterBy, setFilterBy] = useState("all");
  const [recosHidden, setRecosHidden] = useState(
    () => localStorage.getItem("recosHidden") === "true"
  );

  const loadFeed = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setError("");
    try {
      const { feed: data, digest: aiDigest } = await getFeed();
      setFeed(data);
      setDigest(aiDigest);
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

  const toggleRecos = () => {
    setRecosHidden((prev) => {
      const next = !prev;
      localStorage.setItem("recosHidden", String(next));
      return next;
    });
  };

  const handleAdd = async (ticker, companyName) => {
    await addTicker(ticker, companyName);
    await loadFeed();
  };

  const handleRemove = async (id) => {
    await removeTicker(id);
    setFeed((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredFeed = useMemo(() => {
    switch (filterBy) {
      case "meaningful":
        return feed.filter((item) => item.isMeaningful);
      case "gainers":
        return feed.filter((item) => !item.error && item.dayChangePercent > 0);
      case "losers":
        return feed.filter((item) => !item.error && item.dayChangePercent < 0);
      default:
        return feed;
    }
  }, [feed, filterBy]);

  const sortedFeed = useMemo(() => {
    const clean = filteredFeed.filter((item) => !item.error);
    const errors = filteredFeed.filter((item) => item.error);
    const sorted = [...clean];

    switch (sortBy) {
      case "gainers":
        sorted.sort((a, b) => (b.dayChangePercent || 0) - (a.dayChangePercent || 0));
        break;
      case "losers":
        sorted.sort((a, b) => (a.dayChangePercent || 0) - (b.dayChangePercent || 0));
        break;
      case "alphabetical":
        sorted.sort((a, b) => (a.companyName || a.ticker).localeCompare(b.companyName || b.ticker));
        break;
      case "mostChecked":
        sorted.sort((a, b) => (b.timesChecked || 0) - (a.timesChecked || 0));
        break;
      default:
        sorted.sort((a, b) => (b.attentionScore || 0) - (a.attentionScore || 0));
    }

    return [...sorted, ...errors];
  }, [filteredFeed, sortBy]);

  const meaningfulItems = feed.filter((item) => item.isMeaningful);
  const useGroupedView = sortBy === "attention" && filterBy === "all";
  const watchlistTickers = feed.map((item) => item.ticker);

  return (
    <div className="app-shell">
      <Header />

      <div className="dashboard-layout">
        <main className="dashboard">
          <div className="dashboard-top">
            <AddTickerForm onAdd={handleAdd} />
            <select className="sort-select" value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button className="refresh-btn" onClick={() => loadFeed(true)} disabled={refreshing}>
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {feed.length > 0 && (
            <div className="digest-strip">
              {digest
                ? digest
                : meaningfulItems.length > 0
                ? `${meaningfulItems.length} of ${feed.length} stocks moved meaningfully since you last checked.`
                : "Nothing meaningful has changed since you last checked."}
            </div>
          )}

          {error && <p className="error">{error}</p>}

          {loading ? (
            <p className="loading-text">Loading watchlist...</p>
          ) : feed.length === 0 ? (
            <p className="empty-text">Your watchlist is empty — search above or pick from the sidebar.</p>
          ) : sortedFeed.length === 0 ? (
            <p className="empty-text">No tickers match this filter.</p>
          ) : useGroupedView ? (
            <>
              {meaningfulItems.length > 0 && (
                <section className="feed-section">
                  <h2 className="section-title">Needs your attention</h2>
                  <div className="feed-list-vertical">
                    {meaningfulItems.map((item) => (
                      <WatchlistCard key={item.id} item={item} onRemove={handleRemove} />
                    ))}
                  </div>
                </section>
              )}
              <section className="feed-section">
                <h2 className="section-title">Everything else</h2>
                <div className="feed-list-vertical quiet-list">
                  {feed.filter((i) => !i.isMeaningful).map((item) => (
                    <WatchlistCard key={item.id} item={item} onRemove={handleRemove} />
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="feed-list-vertical">
              {sortedFeed.map((item) => (
                <WatchlistCard key={item.id} item={item} onRemove={handleRemove} />
              ))}
            </div>
          )}
        </main>

        <PopularPicks
          watchlistTickers={watchlistTickers}
          onAdd={handleAdd}
          hidden={recosHidden}
          onToggleHidden={toggleRecos}
        />
      </div>

      <ChatWidget />
    </div>
  );
};

export default Dashboard;