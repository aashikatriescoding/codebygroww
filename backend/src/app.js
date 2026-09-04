const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// routes will be mounted here as we build them
// app.use('/api/watchlist', require('./routes/watchlistRoutes'));

module.exports = app;