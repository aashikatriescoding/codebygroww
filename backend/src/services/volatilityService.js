// const PriceSnapshot = require("../models/PriceSnapshot");

// const LOOKBACK_LIMIT = 30; // recent snapshots to estimate normal behavior from
// const DEFAULT_VOLATILITY_PERCENT = 1.5; // used when there's not enough history yet
// const MIN_SNAPSHOTS_NEEDED = 5;

// // Estimates how much a ticker "normally" moves, based on its own recent price
// // snapshots — this is what makes the threshold per-stock instead of one-size-fits-all.
// const getTickerVolatility = async (ticker) => {
//   const snapshots = await PriceSnapshot.find({ ticker: ticker.toUpperCase() })
//     .sort({ fetchedAt: -1 })
//     .limit(LOOKBACK_LIMIT);

//   if (snapshots.length < MIN_SNAPSHOTS_NEEDED) {
//     return DEFAULT_VOLATILITY_PERCENT; // not enough data yet — safe fallback
//   }

//   // % change between each consecutive pair of snapshots
//   const changes = [];
//   for (let i = 0; i < snapshots.length - 1; i++) {
//     const newer = snapshots[i].price;
//     const older = snapshots[i + 1].price;
//     if (older > 0) {
//       changes.push(Math.abs((newer - older) / older) * 100);
//     }
//   }

//   if (changes.length === 0) return DEFAULT_VOLATILITY_PERCENT;

//   const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;

//   // Floor it so extremely quiet stocks don't get a near-zero threshold that
//   // flags every tiny tick as "meaningful"
//   return Math.max(avgChange, 0.5);
// };

// module.exports = { getTickerVolatility };   














const { getHistory } = require("./marketDataService");

const DEFAULT_VOLATILITY_PERCENT = 1.5;
const MIN_POINTS_NEEDED = 3;

// Estimates how much a ticker "normally" moves day-to-day, using its real
// 7-day closing price history (already fetched for the sparkline) — available
// immediately, no cold-start wait like a live-snapshot-only approach would need.
const getTickerVolatility = async (ticker) => {
  const closes = await getHistory(ticker);

  if (!closes || closes.length < MIN_POINTS_NEEDED) {
    return DEFAULT_VOLATILITY_PERCENT;
  }

  const changes = [];
  for (let i = 1; i < closes.length; i++) {
    const prev = closes[i - 1];
    const curr = closes[i];
    if (prev > 0) {
      changes.push(Math.abs((curr - prev) / prev) * 100);
    }
  }

  if (changes.length === 0) return DEFAULT_VOLATILITY_PERCENT;

  const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;

  return Math.max(avgChange, 0.3);
};

module.exports = { getTickerVolatility };