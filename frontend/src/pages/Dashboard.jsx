

// import { useEffect, useState, useCallback, useMemo } from "react";
// import { getFeed, addTicker, removeTicker } from "../services/watchlistService";
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

//   const handleAdd = async (ticker, companyName) => {
//     await addTicker(ticker, companyName);
//     await loadFeed();
//   };

//   const handleRemove = async (id) => {
//     await removeTicker(id);
//     setFeed((prev) => prev.filter((item) => item.id !== id));
//   };

//   const filteredFeed = useMemo(() => {
//     switch (filterBy) {
//       case "meaningful":
//         return feed.filter((item) => item.isMeaningful);
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
//                       <WatchlistCard key={item.id} item={item} onRemove={handleRemove} />
//                     ))}
//                   </div>
//                 </section>
//               )}
//               <section className="feed-section">
//                 <h2 className="section-title">Everything else</h2>
//                 <div className="feed-list-vertical quiet-list">
//                   {feed.filter((i) => !i.isMeaningful).map((item) => (
//                     <WatchlistCard key={item.id} item={item} onRemove={handleRemove} />
//                   ))}
//                 </div>
//               </section>
//             </>
//           ) : (
//             <div className="feed-list-vertical">
//               {sortedFeed.map((item) => (
//                 <WatchlistCard key={item.id} item={item} onRemove={handleRemove} />
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
import {
  getWatchlists,
  createWatchlist,
  renameWatchlist,
  deleteWatchlist,
  reorderWatchlists,
} from "../services/watchlistsService";
import WatchlistCard from "../components/WatchlistCard";
import AddTickerForm from "../components/AddTickerForm";
import Header from "../components/Header";
import ChatWidget from "../components/ChatWidget";
import PopularPicks from "../components/PopularPicks";
import WatchlistTabs from "../components/WatchlistTabs";

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
  const [watchlists, setWatchlists] = useState([]);
  const [activeId, setActiveId] = useState(null);
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

  const loadWatchlists = useCallback(async () => {
    const lists = await getWatchlists();
    setWatchlists(lists);
    if (lists.length > 0) {
      setActiveId((prev) => prev || lists[0]._id);
    }
  }, []);

  const loadFeed = useCallback(async (isRefresh = false, watchlistId) => {
    if (isRefresh) setRefreshing(true);
    setError("");
    try {
      const { feed: data, digest: aiDigest } = await getFeed(watchlistId);
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
    loadWatchlists();
  }, [loadWatchlists]);

  useEffect(() => {
    if (!activeId) return;
    setLoading(true);
    loadFeed(false, activeId);
    const interval = setInterval(() => loadFeed(true, activeId), 30000);
    return () => clearInterval(interval);
  }, [activeId, loadFeed]);

  const toggleRecos = () => {
    setRecosHidden((prev) => {
      const next = !prev;
      localStorage.setItem("recosHidden", String(next));
      return next;
    });
  };

  const handleAdd = async (ticker, companyName) => {
    await addTicker(ticker, companyName, activeId);
    await loadFeed(false, activeId);
  };

  const handleRemove = async (id) => {
    await removeTicker(id);
    setFeed((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCreateWatchlist = async (name) => {
    const list = await createWatchlist(name);
    setWatchlists((prev) => [...prev, list]);
    setActiveId(list._id);
  };

  const handleRenameWatchlist = async (id, name) => {
    await renameWatchlist(id, name);
    setWatchlists((prev) => prev.map((w) => (w._id === id ? { ...w, name } : w)));
  };

  const handleDeleteWatchlist = async (id) => {
    await deleteWatchlist(id);
    const remaining = watchlists.filter((w) => w._id !== id);
    setWatchlists(remaining);
    if (activeId === id && remaining.length > 0) {
      setActiveId(remaining[0]._id);
    }
  };

  const handleReorderWatchlists = async (orderedIds) => {
    setWatchlists((prev) => orderedIds.map((id) => prev.find((w) => w._id === id)));
    await reorderWatchlists(orderedIds);
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

      <div className="tabs-bar-wrapper">
        <WatchlistTabs
          watchlists={watchlists}
          activeId={activeId}
          onSelect={setActiveId}
          onCreate={handleCreateWatchlist}
          onRename={handleRenameWatchlist}
          onDelete={handleDeleteWatchlist}
          onReorder={handleReorderWatchlists}
        />
      </div>

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
            <button className="refresh-btn" onClick={() => loadFeed(true, activeId)} disabled={refreshing}>
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
            <p className="empty-text">This watchlist is empty — search above or pick from the sidebar.</p>
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