// controllers/locationController.js
const { Location } = require("../models/Location");
const AppError = require("../utils/AppError");
const catchAsyncErrors = require("../utils/catchAsyncErrors");

/**-------------------------------------
 * @desc   Create new location
 * @router /api/v1/location
 * @method POST
 * @access private (only admin)
 -------------------------------------*/
module.exports.createNewLocation = catchAsyncErrors(async (req, res, next) => {
  const { city, district } = req.body;

  const newLocation = await Location.create({ city, district });

  res.status(201).json({
    status: "SUCCESS",
    message: "Location added successfully",
    data: { newLocation },
  });
});

/**-------------------------------------
 * @desc   Update location
 * @router /api/v1/location/:id
 * @method PATCH
 * @access private (only admin)
 -------------------------------------*/
module.exports.updateLocation = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const updatedLocation = await Location.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedLocation) {
    return next(new AppError("Location not found", 404));
  }

  res.status(200).json({
    status: "SUCCESS",
    message: "Location updated successfully",
    data: { updatedLocation },
  });
});

/**-------------------------------------
 * @desc   Delete location
 * @router /api/v1/location/:id
 * @method DELETE
 * @access private (only admin)
 -------------------------------------*/
module.exports.deleteLocation = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const deletedLocation = await Location.findByIdAndDelete(id);

  if (!deletedLocation) {
    return next(new AppError("Location not found", 404));
  }

  res.status(200).json({
    status: "SUCCESS",
    message: "Location deleted successfully",
  });
});

/**-------------------------------------
 * @desc   Get single location
 * @router /api/v1/location/:id
 * @method GET
 * @access public
 -------------------------------------*/
module.exports.getLocation = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const location = await Location.findById(id);

  if (!location) {
    return next(new AppError("Location not found", 404));
  }

  res.status(200).json({
    status: "SUCCESS",
    data: { location },
  });
});
/**-------------------------------------
 * @desc   Get all locations
 * @router /api/v1/location
 * @method GET
 * @access public
 -------------------------------------*/
 module.exports.getAllLocations = catchAsyncErrors(async (req, res, next) => {
  const locations = await Location.find();

  // Create arrays for cities and districts
  const cities = locations.map((location) => location.city);
  const districts = locations.map((location) => location.district);

  res.status(200).json({
    status: "SUCCESS",
    results: locations.length,
    data: { cities, districts },
  });
});
/**-------------------------------------
 * @desc   Get all locations for dashboard
 * @router /api/v1/location/dash
 * @method GET
 * @access public
 -------------------------------------*/
 module.exports.getLocationDash = catchAsyncErrors(async (req, res, next) => {
  const locations = await Location.find();


  res.status(200).json({
    status: "SUCCESS",
    results: locations.length,
    data: { locations },
  });
});
