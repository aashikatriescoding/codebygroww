



// const express = require("express");
// const cors = require("cors");

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok" });
// });

// app.use("/api/auth", require("./routes/authRoutes"));
// // app.use('/api/watchlist', require('./routes/watchlistRoutes')); // next step

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

module.exports = app;