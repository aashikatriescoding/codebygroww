// const WatchlistItem = require("../models/WatchlistItem");
// const PriceSnapshot = require("../models/PriceSnapshot");

// // For each of the user's watchlist items, find the most recent price recorded
// // BEFORE this new session started, and use it as the new comparison baseline.
// // This is what lets a user close the app for days and come back to an accurate
// // "here's what changed" — with zero manual clicking.
// const rolloverSessionBaselines = async (userId, sessionStartedAt) => {
//   const items = await WatchlistItem.find({ user: userId });

//   await Promise.all(
//     items.map(async (item) => {
//       try {
//         const priorSnapshot = await PriceSnapshot.findOne({
//           ticker: item.ticker,
//           fetchedAt: { $lt: sessionStartedAt },
//         }).sort({ fetchedAt: -1 });

//         if (priorSnapshot) {
//           item.lastSeenPrice = priorSnapshot.price;
//           item.lastSeenAt = priorSnapshot.fetchedAt;
//           await item.save();
//         }
//       } catch (err) {
//         console.error(`Session rollover failed for ${item.ticker}:`, err.message);
//       }
//     })
//   );
// };

// module.exports = { rolloverSessionBaselines };















const WatchlistItem = require("../models/WatchlistItem");
const PriceSnapshot = require("../models/PriceSnapshot");

// For each of the user's watchlist items, find the most recent price recorded
// BEFORE this new session started, and use it as the new comparison baseline.
const rolloverSessionBaselines = async (userId, sessionStartedAt) => {
  // Only process items that belong to an actual watchlist.
  // Older WatchlistItem documents may not have the watchlist field.
  const items = await WatchlistItem.find({
    user: userId,
    watchlist: { $exists: true, $ne: null },
  });

  await Promise.all(
    items.map(async (item) => {
      try {
        const priorSnapshot = await PriceSnapshot.findOne({
          ticker: item.ticker,
          fetchedAt: { $lt: sessionStartedAt },
        }).sort({ fetchedAt: -1 });

        if (priorSnapshot) {
          await WatchlistItem.updateOne(
            { _id: item._id },
            {
              $set: {
                lastSeenPrice: priorSnapshot.price,
                lastSeenAt: priorSnapshot.fetchedAt,
              },
            }
          );
        }
      } catch (err) {
        console.error(
          `Session rollover failed for ${item.ticker}:`,
          err.message
        );
      }
    })
  );
};

module.exports = { rolloverSessionBaselines };