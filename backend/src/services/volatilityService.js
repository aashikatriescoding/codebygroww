const PriceSnapshot = require("../models/PriceSnapshot");

const LOOKBACK_LIMIT = 30; // recent snapshots to estimate normal behavior from
const DEFAULT_VOLATILITY_PERCENT = 1.5; // used when there's not enough history yet
const MIN_SNAPSHOTS_NEEDED = 5;

// Estimates how much a ticker "normally" moves, based on its own recent price
// snapshots — this is what makes the threshold per-stock instead of one-size-fits-all.
const getTickerVolatility = async (ticker) => {
  const snapshots = await PriceSnapshot.find({ ticker: ticker.toUpperCase() })
    .sort({ fetchedAt: -1 })
    .limit(LOOKBACK_LIMIT);

  if (snapshots.length < MIN_SNAPSHOTS_NEEDED) {
    return DEFAULT_VOLATILITY_PERCENT; // not enough data yet — safe fallback
  }

  // % change between each consecutive pair of snapshots
  const changes = [];
  for (let i = 0; i < snapshots.length - 1; i++) {
    const newer = snapshots[i].price;
    const older = snapshots[i + 1].price;
    if (older > 0) {
      changes.push(Math.abs((newer - older) / older) * 100);
    }
  }

  if (changes.length === 0) return DEFAULT_VOLATILITY_PERCENT;

  const avgChange = changes.reduce((sum, c) => sum + c, 0) / changes.length;

  // Floor it so extremely quiet stocks don't get a near-zero threshold that
  // flags every tiny tick as "meaningful"
  return Math.max(avgChange, 0.5);
};

module.exports = { getTickerVolatility };   