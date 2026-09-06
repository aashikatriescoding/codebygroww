
// const express = require("express");
// const cors = require("cors");

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok" });
// });

// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/watchlists", require("./routes/watchlistsRoutes"));
// app.use("/api/watchlist", require("./routes/watchlistRoutes"));
// app.use("/api/market", require("./routes/marketRoutes"));
// app.use("/api/chat", require("./routes/chatRoutes"));
// app.use("/api/session", require("./routes/sessionRoutes"));

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
app.use("/api/watchlists", require("./routes/watchlistsRoutes"));
app.use("/api/watchlist", require("./routes/watchlistRoutes"));
app.use("/api/market", require("./routes/marketRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.use("/api/session", require("./routes/sessionRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));

module.exports = app;