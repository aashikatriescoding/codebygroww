


// const express = require("express");
// const cors = require("cors");

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok" });
// });

// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/watchlist", require("./routes/watchlistRoutes"));
// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/watchlist", require("./routes/watchlistRoutes"));
// app.use("/api/market", require("./routes/marketRoutes"));

// module.exports = app;





const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/watchlist", require("./routes/watchlistRoutes"));
app.use("/api/market", require("./routes/marketRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

module.exports = app;