// routes/locationRoute.js
const {
  createNewLocation,
  updateLocation,
  deleteLocation,
  getLocation,
  getAllLocations,
  getAlldistrict,
  getLocationDash,
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
  .get( getAllLocations); // Get all locations
router.route("/district").get(getAlldistrict); // Get all locations

router.route("/dash").get(verifyTokenAndAdmin, getLocationDash); //
router
  .route("/:id")
  .patch(verifyTokenAndAdmin, updateLocation) // Update a location
  .delete(verifyTokenAndAdmin, deleteLocation) // Delete a location
  .get(verifyToken, getLocation); 

module.exports = router;
