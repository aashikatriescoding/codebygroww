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