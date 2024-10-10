// routes/locationRoute.js
const {
  createNewLocation,
  updateLocation,
  deleteLocation,
  getLocation,
  getAllLocations,
} = require("../controller/locationController");
const {
  verifyTokenAndAdmin,
  verifyToken,
} = require("../middlewares/verifyToken");

const router = require("express").Router();

// Define routes
router
  .route("/")
  .post(verifyTokenAndAdmin, createNewLocation) // Create a new location
  .get(verifyToken, getAllLocations); // Get all locations

router
  .route("/:id")
  .patch(verifyTokenAndAdmin, updateLocation) // Update a location
  .delete(verifyTokenAndAdmin, deleteLocation) // Delete a location
  .get(verifyToken, getLocation); // Get a single location

module.exports = router;
