// // Thresholds: how big a move must be (in %) to count as "meaningful",
// // based on how closely the user wants to watch this ticker.
// const THRESHOLDS = {
//   core: 1,    // core holdings: flag even small moves
//   casual: 3,  // casual watches: only flag bigger moves
// };

// /**
//  * Compares a watchlist item's baseline (lastSeenPrice) against a live quote,
//  * and returns whether this counts as a "meaningful change" plus why.
//  */
// const computeSignificance = (item, quote) => {
//   const lastSeenPrice = item.lastSeenPrice;
//   const currentPrice = quote.price;
//   const threshold = THRESHOLDS[item.sensitivity] || THRESHOLDS.casual;

//   let percentChangeSinceSeen = null;
//   if (lastSeenPrice != null && lastSeenPrice > 0) {
//     percentChangeSinceSeen = ((currentPrice - lastSeenPrice) / lastSeenPrice) * 100;
//   }

//   const flags = [];

//   // 1. Moved beyond the user's sensitivity threshold since they last checked
//   if (percentChangeSinceSeen !== null && Math.abs(percentChangeSinceSeen) >= threshold) {
//     flags.push(percentChangeSinceSeen > 0 ? "moved_up" : "moved_down");
//   }

//   // 2. Crossed a 52-week high/low
//   if (quote.fiftyTwoWeekHigh != null && currentPrice >= quote.fiftyTwoWeekHigh) {
//     flags.push("52_week_high");
//   }
//   if (quote.fiftyTwoWeekLow != null && currentPrice <= quote.fiftyTwoWeekLow) {
//     flags.push("52_week_low");
//   }

//   // 3. Unusual volume vs its own 3-month average
//   if (quote.averageVolume > 0 && quote.volume >= quote.averageVolume * 1.5) {
//     flags.push("volume_spike");
//   }

//   const isMeaningful = flags.length > 0;

//   // Attention score: bigger moves + more flags = ranks higher in the feed
//   const attentionScore =
//     (percentChangeSinceSeen !== null ? Math.abs(percentChangeSinceSeen) : 0) + flags.length * 2;

//   return {
//     percentChangeSinceSeen,
//     flags,
//     isMeaningful,
//     attentionScore: Math.round(attentionScore * 100) / 100,
//   };
// };

// module.exports = { computeSignificance };












const { getTickerVolatility } = require("./volatilityService");

// A move counts as significant once it's this many multiples of the stock's
// own normal volatility — not a flat number the user has to guess.
const SIGNIFICANCE_MULTIPLIER = 2.5;

const computeSignificance = async (item, quote) => {
  const lastSeenPrice = item.lastSeenPrice;
  const currentPrice = quote.price;

  const normalVolatility = await getTickerVolatility(item.ticker);
  const threshold = normalVolatility * SIGNIFICANCE_MULTIPLIER;

  let percentChangeSinceSeen = null;
  if (lastSeenPrice != null && lastSeenPrice > 0) {
    percentChangeSinceSeen = ((currentPrice - lastSeenPrice) / lastSeenPrice) * 100;
  }

  const flags = [];

  if (percentChangeSinceSeen !== null && Math.abs(percentChangeSinceSeen) >= threshold) {
    flags.push(percentChangeSinceSeen > 0 ? "moved_up" : "moved_down");
  }

  if (quote.fiftyTwoWeekHigh != null && currentPrice >= quote.fiftyTwoWeekHigh) {
    flags.push("52_week_high");
  }
  if (quote.fiftyTwoWeekLow != null && currentPrice <= quote.fiftyTwoWeekLow) {
    flags.push("52_week_low");
  }

  if (quote.averageVolume > 0 && quote.volume >= quote.averageVolume * 1.5) {
    flags.push("volume_spike");
  }

  const isMeaningful = flags.length > 0;

  const attentionScore =
    (percentChangeSinceSeen !== null ? Math.abs(percentChangeSinceSeen) / threshold : 0) * 10 +
    flags.length * 2;

  return {
    percentChangeSinceSeen,
    flags,
    isMeaningful,
    attentionScore: Math.round(attentionScore * 100) / 100,
    normalVolatility: Math.round(normalVolatility * 100) / 100, // exposed for transparency
  };
};

module.exports = { computeSignificance };