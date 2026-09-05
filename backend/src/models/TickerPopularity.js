const mongoose = require("mongoose");

const tickerPopularitySchema = new mongoose.Schema(
  {
    ticker: { type: String, required: true, unique: true, uppercase: true },
    companyName: { type: String, default: "" },
    addCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TickerPopularity", tickerPopularitySchema);