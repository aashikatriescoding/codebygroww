const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // hashed before save
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);