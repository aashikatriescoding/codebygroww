
// import { useEffect, useState, useCallback, useMemo } from "react";
// import {
//   getFeed,
//   addTicker,
//   removeTicker,
// } from "../services/watchlistService";

// import {
//   getWatchlists,
//   createWatchlist,
//   renameWatchlist,
//   deleteWatchlist,
//   reorderWatchlists,
// } from "../services/watchlistsService";

// import WatchlistCard from "../components/WatchlistCard";
// import AddTickerForm from "../components/AddTickerForm";
// import Header from "../components/Header";
// import ChatWidget from "../components/ChatWidget";
// import PopularPicks from "../components/PopularPicks";
// import WatchlistTabs from "../components/WatchlistTabs";

// const SORT_OPTIONS = [
//   {
//     value: "attention",
//     label: "Most likely to need attention",
//   },
//   {
//     value: "gainers",
//     label: "Gainers (high to low)",
//   },
//   {
//     value: "losers",
//     label: "Losers (high to low)",
//   },
//   {
//     value: "alphabetical",
//     label: "Alphabetical",
//   },
//   {
//     value: "mostChecked",
//     label: "Most checked",
//   },
// ];

// const FILTER_OPTIONS = [
//   {
//     value: "all",
//     label: "All tickers",
//   },
//   {
//     value: "meaningful",
//     label: "Needs attention only",
//   },
//   {
//     value: "gainers",
//     label: "Positive today",
//   },
//   {
//     value: "losers",
//     label: "Negative today",
//   },
// ];

// const Dashboard = () => {
//   const [watchlists, setWatchlists] = useState([]);
//   const [activeId, setActiveId] = useState(null);

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

//   /* ---------------------------------------------
//      LOAD WATCHLISTS
//   --------------------------------------------- */

//   const loadWatchlists = useCallback(async () => {
//     try {
//       const lists = await getWatchlists();

//       setWatchlists(lists);

//       if (lists.length > 0) {
//         setActiveId((prev) => prev || lists[0]._id);
//       }
//     } catch (err) {
//       setError("Could not load your watchlists.");
//     }
//   }, []);

//   /* ---------------------------------------------
//      LOAD FEED
//   --------------------------------------------- */

//   const loadFeed = useCallback(
//     async (isRefresh = false, watchlistId) => {
//       if (!watchlistId) return;

//       if (isRefresh) {
//         setRefreshing(true);
//       }

//       setError("");

//       try {
//         const {
//           feed: data,
//           digest: aiDigest,
//         } = await getFeed(watchlistId);

//         setFeed(data || []);
//         setDigest(aiDigest || null);
//       } catch (err) {
//         setError("Could not load watchlist. Try refreshing.");
//       } finally {
//         setLoading(false);
//         setRefreshing(false);
//       }
//     },
//     []
//   );

//   /* ---------------------------------------------
//      INITIAL WATCHLIST LOAD
//   --------------------------------------------- */

//   useEffect(() => {
//     loadWatchlists();
//   }, [loadWatchlists]);

//   /* ---------------------------------------------
//      LOAD ACTIVE WATCHLIST
//   --------------------------------------------- */

//   useEffect(() => {
//     if (!activeId) return;

//     setLoading(true);

//     loadFeed(false, activeId);

//     const interval = setInterval(() => {
//       loadFeed(true, activeId);
//     }, 30000);

//     return () => clearInterval(interval);
//   }, [activeId, loadFeed]);

//   /* ---------------------------------------------
//      RECOMMENDATIONS
//   --------------------------------------------- */

//   const toggleRecos = () => {
//     setRecosHidden((prev) => {
//       const next = !prev;

//       localStorage.setItem(
//         "recosHidden",
//         String(next)
//       );

//       return next;
//     });
//   };

//   /* ---------------------------------------------
//      ADD TICKER
//   --------------------------------------------- */

//   const handleAdd = async (ticker, companyName) => {
//     await addTicker(
//       ticker,
//       companyName,
//       activeId
//     );

//     await loadFeed(false, activeId);
//   };

//   /* ---------------------------------------------
//      REMOVE TICKER
//   --------------------------------------------- */

//   const handleRemove = async (id) => {
//     await removeTicker(id);

//     setFeed((prev) =>
//       prev.filter((item) => item.id !== id)
//     );
//   };

//   /* ---------------------------------------------
//      WATCHLIST MANAGEMENT
//   --------------------------------------------- */

//   const handleCreateWatchlist = async (name) => {
//     const list = await createWatchlist(name);

//     setWatchlists((prev) => [
//       ...prev,
//       list,
//     ]);

//     setActiveId(list._id);
//   };

//   const handleRenameWatchlist = async (
//     id,
//     name
//   ) => {
//     await renameWatchlist(id, name);

//     setWatchlists((prev) =>
//       prev.map((watchlist) =>
//         watchlist._id === id
//           ? {
//               ...watchlist,
//               name,
//             }
//           : watchlist
//       )
//     );
//   };

//   const handleDeleteWatchlist = async (id) => {
//     await deleteWatchlist(id);

//     const remaining = watchlists.filter(
//       (watchlist) =>
//         watchlist._id !== id
//     );

//     setWatchlists(remaining);

//     if (
//       activeId === id &&
//       remaining.length > 0
//     ) {
//       setActiveId(remaining[0]._id);
//     }
//   };

//   const handleReorderWatchlists = async (
//     orderedIds
//   ) => {
//     setWatchlists((prev) =>
//       orderedIds
//         .map((id) =>
//           prev.find(
//             (watchlist) =>
//               watchlist._id === id
//           )
//         )
//         .filter(Boolean)
//     );

//     await reorderWatchlists(orderedIds);
//   };

//   /* ---------------------------------------------
//      FILTER
//   --------------------------------------------- */

//   const filteredFeed = useMemo(() => {
//     switch (filterBy) {
//       case "meaningful":
//         return feed.filter(
//           (item) => item.isMeaningful
//         );

//       case "gainers":
//         return feed.filter(
//           (item) =>
//             !item.error &&
//             item.dayChangePercent > 0
//         );

//       case "losers":
//         return feed.filter(
//           (item) =>
//             !item.error &&
//             item.dayChangePercent < 0
//         );

//       default:
//         return feed;
//     }
//   }, [feed, filterBy]);

//   /* ---------------------------------------------
//      SORT
//   --------------------------------------------- */

//   const sortedFeed = useMemo(() => {
//     const clean = filteredFeed.filter(
//       (item) => !item.error
//     );

//     const errors = filteredFeed.filter(
//       (item) => item.error
//     );

//     const sorted = [...clean];

//     switch (sortBy) {
//       case "gainers":
//         sorted.sort(
//           (a, b) =>
//             (b.dayChangePercent || 0) -
//             (a.dayChangePercent || 0)
//         );
//         break;

//       case "losers":
//         sorted.sort(
//           (a, b) =>
//             (a.dayChangePercent || 0) -
//             (b.dayChangePercent || 0)
//         );
//         break;

//       case "alphabetical":
//         sorted.sort((a, b) =>
//           (
//             a.companyName ||
//             a.ticker
//           ).localeCompare(
//             b.companyName ||
//               b.ticker
//           )
//         );
//         break;

//       case "mostChecked":
//         sorted.sort(
//           (a, b) =>
//             (b.timesChecked || 0) -
//             (a.timesChecked || 0)
//         );
//         break;

//       default:
//         sorted.sort(
//           (a, b) =>
//             (b.attentionScore || 0) -
//             (a.attentionScore || 0)
//         );
//     }

//     return [
//       ...sorted,
//       ...errors,
//     ];
//   }, [filteredFeed, sortBy]);

//   /* ---------------------------------------------
//      SMART WATCHLIST STATE
//   --------------------------------------------- */

//   const meaningfulItems = feed.filter(
//     (item) =>
//       !item.error &&
//       item.isMeaningful
//   );

//   const availableItems = feed.filter(
//     (item) => !item.error
//   );

//   const unavailableItems = feed.filter(
//     (item) => item.error
//   );

//   /*
//    * This is the important part.
//    *
//    * If we successfully checked stocks and
//    * none of them were meaningful, Shift can
//    * confidently tell the user that nothing
//    * important changed.
//    */
//   const nothingMeaningfulChanged =
//     feed.length > 0 &&
//     availableItems.length > 0 &&
//     meaningfulItems.length === 0;

//   const useGroupedView =
//     sortBy === "attention" &&
//     filterBy === "all";

//   const watchlistTickers = feed.map(
//     (item) => item.ticker
//   );

//   /* ---------------------------------------------
//      LAST CHECKED DISPLAY
//   --------------------------------------------- */

//   const lastCheckedAt = useMemo(() => {
//     const dates = availableItems
//       .map((item) => item.lastSeenAt)
//       .filter(Boolean)
//       .map((date) => new Date(date).getTime())
//       .filter((time) => !Number.isNaN(time));

//     if (dates.length === 0) {
//       return null;
//     }

//     /*
//      * We use the most recent baseline because
//      * different tickers can have slightly
//      * different snapshot timestamps.
//      */
//     return new Date(
//       Math.max(...dates)
//     );
//   }, [availableItems]);

//   const formatLastChecked = (date) => {
//     if (!date) {
//       return "your previous check";
//     }

//     return date.toLocaleTimeString([], {
//       hour: "numeric",
//       minute: "2-digit",
//     });
//   };

//   /* ---------------------------------------------
//      RENDER
//   --------------------------------------------- */

//   return (
//     <div className="app-shell">
//       <Header />

//       <div className="tabs-bar-wrapper">
//         <WatchlistTabs
//           watchlists={watchlists}
//           activeId={activeId}
//           onSelect={setActiveId}
//           onCreate={handleCreateWatchlist}
//           onRename={handleRenameWatchlist}
//           onDelete={handleDeleteWatchlist}
//           onReorder={handleReorderWatchlists}
//         />
//       </div>

//       <div className="dashboard-layout">
//         <main className="dashboard">

//           {/* ---------------------------------------
//               TOP CONTROLS
//           --------------------------------------- */}

//           <div className="dashboard-top">
//             <AddTickerForm
//               onAdd={handleAdd}
//             />

//             <select
//               className="sort-select"
//               value={filterBy}
//               onChange={(e) =>
//                 setFilterBy(e.target.value)
//               }
//             >
//               {FILTER_OPTIONS.map((opt) => (
//                 <option
//                   key={opt.value}
//                   value={opt.value}
//                 >
//                   {opt.label}
//                 </option>
//               ))}
//             </select>

//             <select
//               className="sort-select"
//               value={sortBy}
//               onChange={(e) =>
//                 setSortBy(e.target.value)
//               }
//             >
//               {SORT_OPTIONS.map((opt) => (
//                 <option
//                   key={opt.value}
//                   value={opt.value}
//                 >
//                   {opt.label}
//                 </option>
//               ))}
//             </select>

//             <button
//               className="refresh-btn"
//               onClick={() =>
//                 loadFeed(true, activeId)
//               }
//               disabled={refreshing}
//             >
//               {refreshing
//                 ? "Refreshing..."
//                 : "Refresh"}
//             </button>
//           </div>

//           {/* ---------------------------------------
//               NOTHING MEANINGFUL CHANGED
//           --------------------------------------- */}

//           {nothingMeaningfulChanged ? (
//             <section
//               className="quiet-market-state"
//               aria-label="Nothing meaningful changed"
//             >
//               <div className="quiet-state-icon">
//                 ✓
//               </div>

//               <div className="quiet-state-content">
//                 <h2>
//                   Nothing meaningful changed
//                 </h2>

//                 <p>
//                   Your watchlist was quiet while
//                   you were away. All checked stocks
//                   stayed within their normal range.
//                 </p>

//                 <div className="quiet-state-stats">

//                   <div className="quiet-stat">
//                     <strong>
//                       {availableItems.length}
//                     </strong>

//                     <span>
//                       stocks checked
//                     </span>
//                   </div>

//                   <div className="quiet-stat-divider" />

//                   <div className="quiet-stat">
//                     <strong>
//                       0
//                     </strong>

//                     <span>
//                       need your attention
//                     </span>
//                   </div>

//                   <div className="quiet-stat-divider" />

//                   <div className="quiet-stat">
//                     <strong>
//                       {formatLastChecked(
//                         lastCheckedAt
//                       )}
//                     </strong>

//                     <span>
//                       Last checked
//                     </span>
//                   </div>

//                 </div>

//                 <div className="quiet-state-footer">
//                   <span className="quiet-check">
//                     ✓
//                   </span>

//                   Compared with your last check

//                   {unavailableItems.length > 0 && (
//                     <span className="quiet-warning">
//                       · {unavailableItems.length}{" "}
//                       stock
//                       {unavailableItems.length === 1
//                         ? ""
//                         : "s"} unavailable
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </section>
//           ) : (
//             /* -------------------------------------
//                EXISTING ATTENTION DIGEST
//             ------------------------------------- */

//             feed.length > 0 && (
//               <div className="digest-strip">
//                 {digest
//                   ? digest
//                   : meaningfulItems.length > 0
//                   ? `${meaningfulItems.length} of ${feed.length} stocks moved meaningfully since you last checked.`
//                   : "Nothing meaningful has changed since you last checked."}
//               </div>
//             )
//           )}

//           {/* ---------------------------------------
//               ERROR
//           --------------------------------------- */}

//           {error && (
//             <p className="error">
//               {error}
//             </p>
//           )}

//           {/* ---------------------------------------
//               LOADING
//           --------------------------------------- */}

//           {loading ? (
//             <p className="loading-text">
//               Loading watchlist...
//             </p>
//           ) : feed.length === 0 ? (
//             <p className="empty-text">
//               This watchlist is empty — search
//               above or pick from the sidebar.
//             </p>
//           ) : sortedFeed.length === 0 ? (
//             <p className="empty-text">
//               No tickers match this filter.
//             </p>
//           ) : useGroupedView ? (
//             <>
//               {/* ---------------------------------
//                   ATTENTION SECTION
//               --------------------------------- */}

//               {meaningfulItems.length > 0 && (
//                 <section className="feed-section">
//                   <h2 className="section-title">
//                     Needs your attention
//                   </h2>

//                   <div className="feed-list-vertical">
//                     {meaningfulItems.map(
//                       (item) => (
//                         <WatchlistCard
//                           key={item.id}
//                           item={item}
//                           onRemove={
//                             handleRemove
//                           }
//                         />
//                       )
//                     )}
//                   </div>
//                 </section>
//               )}

//               {/* ---------------------------------
//                   EVERYTHING ELSE
//               --------------------------------- */}

//               <section className="feed-section">
//                 <h2 className="section-title">
//                   Everything else
//                 </h2>

//                 <div className="feed-list-vertical quiet-list">
//                   {feed
//                     .filter(
//                       (item) =>
//                         !item.isMeaningful
//                     )
//                     .map((item) => (
//                       <WatchlistCard
//                         key={item.id}
//                         item={item}
//                         onRemove={
//                           handleRemove
//                         }
//                       />
//                     ))}
//                 </div>
//               </section>
//             </>
//           ) : (
//             <div className="feed-list-vertical">
//               {sortedFeed.map((item) => (
//                 <WatchlistCard
//                   key={item.id}
//                   item={item}
//                   onRemove={handleRemove}
//                 />
//               ))}
//             </div>
//           )}
//         </main>

//         {/* -----------------------------------------
//             POPULAR PICKS
//         ----------------------------------------- */}

//         <PopularPicks
//           watchlistTickers={
//             watchlistTickers
//           }
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

import {
  getFeed,
  addTicker,
  removeTicker,
} from "../services/watchlistService";

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
  {
    value: "attention",
    label: "Most likely to need attention",
  },
  {
    value: "gainers",
    label: "Gainers (high to low)",
  },
  {
    value: "losers",
    label: "Losers (high to low)",
  },
  {
    value: "alphabetical",
    label: "Alphabetical",
  },
  {
    value: "mostChecked",
    label: "Most checked",
  },
];


const FILTER_OPTIONS = [
  {
    value: "all",
    label: "All tickers",
  },
  {
    value: "meaningful",
    label: "Needs attention only",
  },
  {
    value: "gainers",
    label: "Positive today",
  },
  {
    value: "losers",
    label: "Negative today",
  },
];


/* =========================================================
   CSV HELPERS
========================================================= */

const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  /*
   * CSV requires values containing commas, quotes or newlines
   * to be wrapped in quotes.
   */
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};


const formatCsvDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString();
};


const createCsvContent = (items) => {
  const headers = [
    "Company",
    "Ticker",
    "Current Price",
    "Today's Change %",
    "Change Since Last Checked %",
    "Normal Daily Volatility %",
    "Attention Score",
    "Flags",
    "Last Checked",
    "Data Status",
  ];

  const rows = items.map((item) => {
    const flags = Array.isArray(item.flags)
      ? item.flags.join("; ")
      : "";

    const status = item.error
      ? "Unavailable"
      : item.stale
      ? "Stale data"
      : "Live";

    return [
      item.companyName || "",
      item.ticker || "",
      item.currentPrice ?? "",
      item.dayChangePercent ?? "",
      item.percentChangeSinceSeen ?? "",
      item.normalVolatility ?? "",
      item.attentionScore ?? "",
      flags,
      formatCsvDate(item.lastSeenAt),
      status,
    ];
  });

  return [
    headers,
    ...rows,
  ]
    .map((row) =>
      row
        .map(escapeCsvValue)
        .join(",")
    )
    .join("\n");
};


const downloadCsv = (
  content,
  filename
) => {
  /*
   * BOM makes Excel correctly recognize UTF-8,
   * including the ₹ symbol.
   */
  const blob = new Blob(
    ["\uFEFF" + content],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
};


/* =========================================================
   DASHBOARD
========================================================= */

const Dashboard = () => {
  const [watchlists, setWatchlists] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [feed, setFeed] = useState([]);
  const [digest, setDigest] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [sortBy, setSortBy] =
    useState("attention");

  const [filterBy, setFilterBy] =
    useState("all");

  const [recosHidden, setRecosHidden] =
    useState(
      () =>
        localStorage.getItem(
          "recosHidden"
        ) === "true"
    );


  /* =======================================================
     LOAD WATCHLISTS
  ======================================================= */

  const loadWatchlists =
    useCallback(async () => {
      try {
        const lists =
          await getWatchlists();

        setWatchlists(lists);

        if (lists.length > 0) {
          setActiveId(
            (prev) =>
              prev || lists[0]._id
          );
        }
      } catch (err) {
        setError(
          "Could not load your watchlists."
        );
      }
    }, []);


  /* =======================================================
     LOAD FEED
  ======================================================= */

  const loadFeed = useCallback(
    async (
      isRefresh = false,
      watchlistId
    ) => {
      if (!watchlistId) {
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      }

      setError("");

      try {
        const {
          feed: data,
          digest: aiDigest,
        } = await getFeed(
          watchlistId
        );

        setFeed(data || []);
        setDigest(
          aiDigest || null
        );
      } catch (err) {
        setError(
          "Could not load watchlist. Try refreshing."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadWatchlists();
  }, [loadWatchlists]);


  /* =======================================================
     ACTIVE WATCHLIST
  ======================================================= */

  useEffect(() => {
    if (!activeId) {
      return;
    }

    setLoading(true);

    loadFeed(
      false,
      activeId
    );

    const interval =
      setInterval(() => {
        loadFeed(
          true,
          activeId
        );
      }, 30000);

    return () =>
      clearInterval(interval);
  }, [
    activeId,
    loadFeed,
  ]);


  /* =======================================================
     RECOMMENDATIONS
  ======================================================= */

  const toggleRecos = () => {
    setRecosHidden((prev) => {
      const next = !prev;

      localStorage.setItem(
        "recosHidden",
        String(next)
      );

      return next;
    });
  };


  /* =======================================================
     ADD TICKER
  ======================================================= */

  const handleAdd = async (
    ticker,
    companyName
  ) => {
    await addTicker(
      ticker,
      companyName,
      activeId
    );

    await loadFeed(
      false,
      activeId
    );
  };


  /* =======================================================
     REMOVE TICKER
  ======================================================= */

  const handleRemove = async (
    id
  ) => {
    await removeTicker(id);

    setFeed((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  };


  /* =======================================================
     CREATE WATCHLIST
  ======================================================= */

  const handleCreateWatchlist =
    async (name) => {
      const list =
        await createWatchlist(
          name
        );

      setWatchlists(
        (prev) => [
          ...prev,
          list,
        ]
      );

      setActiveId(
        list._id
      );
    };


  /* =======================================================
     RENAME WATCHLIST
  ======================================================= */

  const handleRenameWatchlist =
    async (
      id,
      name
    ) => {
      await renameWatchlist(
        id,
        name
      );

      setWatchlists(
        (prev) =>
          prev.map(
            (watchlist) =>
              watchlist._id === id
                ? {
                    ...watchlist,
                    name,
                  }
                : watchlist
          )
      );
    };


  /* =======================================================
     DELETE WATCHLIST
  ======================================================= */

  const handleDeleteWatchlist =
    async (id) => {
      await deleteWatchlist(
        id
      );

      const remaining =
        watchlists.filter(
          (watchlist) =>
            watchlist._id !== id
        );

      setWatchlists(
        remaining
      );

      if (
        activeId === id &&
        remaining.length > 0
      ) {
        setActiveId(
          remaining[0]._id
        );
      }
    };


  /* =======================================================
     REORDER WATCHLISTS
  ======================================================= */

  const handleReorderWatchlists =
    async (
      orderedIds
    ) => {
      setWatchlists(
        (prev) =>
          orderedIds
            .map((id) =>
              prev.find(
                (watchlist) =>
                  watchlist._id ===
                  id
              )
            )
            .filter(Boolean)
      );

      await reorderWatchlists(
        orderedIds
      );
    };


  /* =======================================================
     EXPORT WATCHLIST
  ======================================================= */

  const handleExport = () => {
    /*
     * Export the complete active watchlist,
     * not just the currently filtered/sorted
     * stocks.
     */
    if (feed.length === 0) {
      return;
    }

    const csv =
      createCsvContent(feed);

    const activeWatchlist =
      watchlists.find(
        (watchlist) =>
          watchlist._id ===
          activeId
      );

    const watchlistName =
      activeWatchlist?.name ||
      "watchlist";

    /*
     * Make the watchlist name safe
     * for a filename.
     */
    const safeName =
      watchlistName
        .replace(
          /[^a-z0-9]+/gi,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        )
        .toLowerCase() ||
      "watchlist";

    const date =
      new Date()
        .toISOString()
        .slice(0, 10);

    const filename =
      `Shift-${safeName}-${date}.csv`;

    downloadCsv(
      csv,
      filename
    );
  };


  /* =======================================================
     FILTER
  ======================================================= */

  const filteredFeed =
    useMemo(() => {
      switch (
        filterBy
      ) {
        case "meaningful":
          return feed.filter(
            (item) =>
              item.isMeaningful
          );

        case "gainers":
          return feed.filter(
            (item) =>
              !item.error &&
              item.dayChangePercent >
                0
          );

        case "losers":
          return feed.filter(
            (item) =>
              !item.error &&
              item.dayChangePercent <
                0
          );

        default:
          return feed;
      }
    }, [
      feed,
      filterBy,
    ]);


  /* =======================================================
     SORT
  ======================================================= */

  const sortedFeed =
    useMemo(() => {
      const clean =
        filteredFeed.filter(
          (item) =>
            !item.error
        );

      const errors =
        filteredFeed.filter(
          (item) =>
            item.error
        );

      const sorted = [
        ...clean,
      ];

      switch (
        sortBy
      ) {
        case "gainers":
          sorted.sort(
            (a, b) =>
              (b.dayChangePercent ||
                0) -
              (a.dayChangePercent ||
                0)
          );
          break;

        case "losers":
          sorted.sort(
            (a, b) =>
              (a.dayChangePercent ||
                0) -
              (b.dayChangePercent ||
                0)
          );
          break;

        case "alphabetical":
          sorted.sort(
            (a, b) =>
              (
                a.companyName ||
                a.ticker
              ).localeCompare(
                b.companyName ||
                  b.ticker
              )
          );
          break;

        case "mostChecked":
          sorted.sort(
            (a, b) =>
              (b.timesChecked ||
                0) -
              (a.timesChecked ||
                0)
          );
          break;

        default:
          sorted.sort(
            (a, b) =>
              (b.attentionScore ||
                0) -
              (a.attentionScore ||
                0)
          );
      }

      return [
        ...sorted,
        ...errors,
      ];
    }, [
      filteredFeed,
      sortBy,
    ]);


  /* =======================================================
     SMART WATCHLIST STATE
  ======================================================= */

  const meaningfulItems =
    feed.filter(
      (item) =>
        !item.error &&
        item.isMeaningful
    );

  const availableItems =
    feed.filter(
      (item) =>
        !item.error
    );

  const unavailableItems =
    feed.filter(
      (item) =>
        item.error
    );

  /*
   * Shift should reassure the user when
   * everything stayed within normal ranges.
   */
  const nothingMeaningfulChanged =
    feed.length > 0 &&
    availableItems.length > 0 &&
    meaningfulItems.length === 0;

  const useGroupedView =
    sortBy === "attention" &&
    filterBy === "all";

  const watchlistTickers =
    feed.map(
      (item) =>
        item.ticker
    );


  /* =======================================================
     LAST CHECKED
  ======================================================= */

  const lastCheckedAt =
    useMemo(() => {
      const dates =
        availableItems
          .map(
            (item) =>
              item.lastSeenAt
          )
          .filter(Boolean)
          .map(
            (date) =>
              new Date(
                date
              ).getTime()
          )
          .filter(
            (time) =>
              !Number.isNaN(
                time
              )
          );

      if (
        dates.length === 0
      ) {
        return null;
      }

      return new Date(
        Math.max(
          ...dates
        )
      );
    }, [
      availableItems,
    ]);


  const formatLastChecked =
    (date) => {
      if (!date) {
        return "your previous check";
      }

      return date.toLocaleTimeString(
        [],
        {
          hour: "numeric",
          minute: "2-digit",
        }
      );
    };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="app-shell">

      <Header />


      {/* =================================================
          WATCHLIST TABS
      ================================================= */}

      <div className="tabs-bar-wrapper">
        <WatchlistTabs
          watchlists={
            watchlists
          }
          activeId={
            activeId
          }
          onSelect={
            setActiveId
          }
          onCreate={
            handleCreateWatchlist
          }
          onRename={
            handleRenameWatchlist
          }
          onDelete={
            handleDeleteWatchlist
          }
          onReorder={
            handleReorderWatchlists
          }
        />
      </div>


      {/* =================================================
          MAIN LAYOUT
      ================================================= */}

      <div className="dashboard-layout">

        <main className="dashboard">


          {/* ===============================================
              TOP CONTROLS
          =============================================== */}

          <div className="dashboard-top">

            <AddTickerForm
              onAdd={
                handleAdd
              }
            />


            <select
              className="sort-select"
              value={
                filterBy
              }
              onChange={(e) =>
                setFilterBy(
                  e.target.value
                )
              }
            >
              {FILTER_OPTIONS.map(
                (opt) => (
                  <option
                    key={
                      opt.value
                    }
                    value={
                      opt.value
                    }
                  >
                    {
                      opt.label
                    }
                  </option>
                )
              )}
            </select>


            <select
              className="sort-select"
              value={
                sortBy
              }
              onChange={(e) =>
                setSortBy(
                  e.target.value
                )
              }
            >
              {SORT_OPTIONS.map(
                (opt) => (
                  <option
                    key={
                      opt.value
                    }
                    value={
                      opt.value
                    }
                  >
                    {
                      opt.label
                    }
                  </option>
                )
              )}
            </select>


            <button
              className="refresh-btn"
              onClick={() =>
                loadFeed(
                  true,
                  activeId
                )
              }
              disabled={
                refreshing
              }
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>


            {/* ===========================================
                EXPORT
            =========================================== */}

            <button
              className="refresh-btn"
              onClick={
                handleExport
              }
              disabled={
                loading ||
                feed.length === 0
              }
              title="Export this watchlist as CSV"
            >
              Export CSV
            </button>

          </div>


          {/* =================================================
              NOTHING MEANINGFUL CHANGED
          ================================================= */}

          {nothingMeaningfulChanged ? (

            <section
              className="quiet-market-state"
              aria-label="Nothing meaningful changed"
            >

              <div className="quiet-state-icon">
                ✓
              </div>


              <div className="quiet-state-content">

                <h2>
                  Nothing meaningful changed
                </h2>


                <p>
                  Your watchlist was quiet
                  while you were away.
                  All checked stocks stayed
                  within their normal range.
                </p>


                <div className="quiet-state-stats">

                  <div className="quiet-stat">

                    <strong>
                      {
                        availableItems.length
                      }
                    </strong>

                    <span>
                      stocks checked
                    </span>

                  </div>


                  <div className="quiet-stat-divider" />


                  <div className="quiet-stat">

                    <strong>
                      0
                    </strong>

                    <span>
                      need your attention
                    </span>

                  </div>


                  <div className="quiet-stat-divider" />


                  <div className="quiet-stat">

                    <strong>
                      {formatLastChecked(
                        lastCheckedAt
                      )}
                    </strong>

                    <span>
                      compared with
                    </span>

                  </div>

                </div>


                <div className="quiet-state-footer">

                  <span className="quiet-check">
                    ✓
                  </span>

                  Compared with your
                  last check


                  {unavailableItems.length >
                    0 && (
                    <span className="quiet-warning">
                      ·{" "}
                      {
                        unavailableItems.length
                      }{" "}
                      stock
                      {
                        unavailableItems.length ===
                        1
                          ? ""
                          : "s"
                      }{" "}
                      unavailable
                    </span>
                  )}

                </div>

              </div>

            </section>

          ) : (

            /* =================================================
               NORMAL ATTENTION DIGEST
            ================================================= */

            feed.length > 0 && (
              <div className="digest-strip">

                {digest
                  ? digest
                  : meaningfulItems.length >
                    0
                  ? `${meaningfulItems.length} of ${feed.length} stocks moved meaningfully since you last checked.`
                  : "Nothing meaningful has changed since you last checked."}

              </div>
            )

          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <p className="error">
              {error}
            </p>
          )}


          {/* =================================================
              FEED
          ================================================= */}

          {loading ? (

            <p className="loading-text">
              Loading watchlist...
            </p>

          ) : feed.length === 0 ? (

            <p className="empty-text">
              This watchlist is empty —
              search above or pick from
              the sidebar.
            </p>

          ) : sortedFeed.length === 0 ? (

            <p className="empty-text">
              No tickers match this filter.
            </p>

          ) : useGroupedView ? (

            <>

              {/* =============================================
                  NEEDS ATTENTION
              ============================================= */}

              {meaningfulItems.length >
                0 && (

                <section className="feed-section">

                  <h2 className="section-title">
                    Needs your attention
                  </h2>


                  <div className="feed-list-vertical">

                    {meaningfulItems.map(
                      (item) => (
                        <WatchlistCard
                          key={
                            item.id
                          }
                          item={
                            item
                          }
                          onRemove={
                            handleRemove
                          }
                        />
                      )
                    )}

                  </div>

                </section>

              )}


              {/* =============================================
                  EVERYTHING ELSE
              ============================================= */}

              <section className="feed-section">

                <h2 className="section-title">
                  Everything else
                </h2>


                <div className="feed-list-vertical quiet-list">

                  {feed
                    .filter(
                      (item) =>
                        !item.isMeaningful
                    )
                    .map(
                      (item) => (
                        <WatchlistCard
                          key={
                            item.id
                          }
                          item={
                            item
                          }
                          onRemove={
                            handleRemove
                          }
                        />
                      )
                    )}

                </div>

              </section>

            </>

          ) : (

            <div className="feed-list-vertical">

              {sortedFeed.map(
                (item) => (
                  <WatchlistCard
                    key={
                      item.id
                    }
                    item={
                      item
                    }
                    onRemove={
                      handleRemove
                    }
                  />
                )
              )}

            </div>

          )}

        </main>


        {/* =================================================
            POPULAR PICKS
        ================================================= */}

        <PopularPicks
          watchlistTickers={
            watchlistTickers
          }
          onAdd={
            handleAdd
          }
          hidden={
            recosHidden
          }
          onToggleHidden={
            toggleRecos
          }
        />

      </div>


      {/* =================================================
          CHAT
      ================================================= */}

      <ChatWidget />

    </div>
  );
};


export default Dashboard;