const mongoose = require("mongoose");

const priceSnapshotSchema = new mongoose.Schema({
  ticker: { type: String, required: true, uppercase: true, index: true },
  price: { type: Number, required: true },
  volume: { type: Number },
  fetchedAt: { type: Date, default: Date.now },
  source: { type: String, default: "unknown" }, // which API/feed it came from
});

module.exports = mongoose.model("PriceSnapshot", priceSnapshotSchema);