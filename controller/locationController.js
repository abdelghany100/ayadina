// controllers/locationController.js
const { Location } = require("../models/Location");
const { User } = require("../models/User");
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

// module.exports.getAlldistrict = catchAsyncErrors(async (req, res, next) => {
//   const { city } = req.body;

//   if (!city) {
//     return res.status(400).json({ message: "City is required" });
//   }

//   const districts = await Location.find({ city })
//     .select("district -_id") // للحصول على الحقل district فقط بدون الـ _id
//     .lean() // لتحسين الأداء بإرجاع بيانات خفيفة بدون وظائف مرفقة

//   if (!districts.length) {
//     return res.status(404).json({ message: "No districts found for this city" });
//   }

//   res.status(200).json(districts);
// })
module.exports.getAlldistrict = catchAsyncErrors(async (req, res, next) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ message: "City is required" });
  }

  const users = await User.find({ city, jobs: { $exists: true, $ne: [] } })
    .select("location -_id") // للحصول على الحقل district فقط بدون الـ _id
    .lean(); // لتحسين الأداء بإرجاع بيانات خفيفة بدون وظائف مرفقة

  if (!users.length) {
    return res
      .status(404)
      .json({ message: "No districts found for this city" });
  }
  const uniqueLocations = [
    ...new Map(
      users.map((user) => [user.location, { district: user.location }])
    ).values(),
  ];
  res.status(200).json(uniqueLocations);
});
