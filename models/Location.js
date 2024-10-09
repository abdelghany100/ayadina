const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema([
  {
    city: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
  },
]);

const Location = mongoose.model("Location", locationSchema);
module.exports = {
  Location,
};
