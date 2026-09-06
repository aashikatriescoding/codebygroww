    const User = require("../models/User");
const { rolloverSessionBaselines } = require("../services/sessionService");

const SESSION_GAP_MS = 10 * 60 * 1000; // 10 min of inactivity = a new session

// @route  POST /api/session/start
// @desc   Called once when the app opens. If enough time passed since the
//         user's last visit, rolls every watchlist item's baseline forward
//         automatically — no per-stock manual action needed.
const startSession = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();
    const previousLoginAt = user.lastLoginAt;
    const isNewSession = !previousLoginAt || now - previousLoginAt > SESSION_GAP_MS;

    user.lastLoginAt = now;
    await user.save();

    if (isNewSession) {
      await rolloverSessionBaselines(req.userId, now);
    }

    res.status(200).json({ isNewSession });
  } catch (err) {
    console.error("Start session error:", err.message);
    res.status(500).json({ message: "Server error starting session" });
  }
};

module.exports = { startSession };