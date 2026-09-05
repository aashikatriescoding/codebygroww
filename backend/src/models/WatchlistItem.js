// const mongoose = require("mongoose");

// const watchlistItemSchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     ticker: { type: String, required: true, uppercase: true },
//     sensitivity: { type: String, enum: ["core", "casual"], default: "casual" },
//     lastSeenAt: { type: Date, default: Date.now }, // when user last viewed this ticker
//     lastSeenPrice: { type: Number }, // baseline price at last view — powers "what changed since you checked"
//   },
//   { timestamps: true }
// );

// watchlistItemSchema.index({ user: 1, ticker: 1 }, { unique: true }); // no duplicate tickers per user

// module.exports = mongoose.model("WatchlistItem", watchlistItemSchema);











const mongoose = require("mongoose");

const watchlistItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ticker: { type: String, required: true, uppercase: true },
    companyName: { type: String, default: "" },
    sensitivity: { type: String, enum: ["core", "casual"], default: "casual" },
    lastSeenAt: { type: Date, default: Date.now },
    lastSeenPrice: { type: Number },
    timesChecked: { type: Number, default: 0 },
  },
  { timestamps: true }
);

watchlistItemSchema.index({ user: 1, ticker: 1 }, { unique: true });

module.exports = mongoose.model("WatchlistItem", watchlistItemSchema);