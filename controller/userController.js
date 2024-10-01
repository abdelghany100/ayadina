const { User } = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const fs = require("fs");
const path = require("path");
/**-------------------------------------
 * @desc   filter by city
 * @router /api/v1/user/filter-by-city
 * @method GET
 * @access privet (only login)
 -------------------------------------*/
module.exports.getDataForSearchCtr = catchAsyncErrors(
  async (req, res, next) => {
    // البحث عن المستخدمين الذين لديهم وظائف فقط
    const users = await User.find({ jobs: { $exists: true, $ne: [] } }).select(
      "location jobs city"
    );

    // إذا لم يتم العثور على أي مستخدمين
    if (!users || users.length === 0) {
      return next(new AppError("No users found with jobs", 404));
    }

    // استخراج المواقع، الوظائف والمدن بدون تكرار
    const locations = [...new Set(users.map((user) => user.location))];
    const jobs = [...new Set(users.map((user) => user.jobs).flat())]; // استخدم .flat() لتجميع جميع الوظائف من المصفوفة
    const cities = [...new Set(users.map((user) => user.city))];

    return res.status(200).json({
      status: "SUCCESS",
      message: "Data found",
      locations: locations,
      jobs: jobs,
      cities: cities,
    });
  }
);
/**-------------------------------------
 * @desc   Get All user
 * @router /api/v1/user
 * @method GET
 * @access privet (only login)
 -------------------------------------*/
module.exports.getAllUserByFilterCtr = catchAsyncErrors(
  async (req, res, next) => {
    const { city, location, job } = req.body; // استخراج القيم من req.body

    // إعداد كائن الفلترة بناءً على المدخلات
    let filter = {};

    if (city) {
      filter.city = city;
    }

    if (location) {
      filter.location = location;
    }

    if (job) {
      filter.jobs = { $in: [job] };
    }

    // البحث عن المستخدمين بناءً على الفلتر
    const users = await User.find(filter)
      .select("location job city")
      .populate("posts")
      .populate("jobs");

    // إذا لم يتم العثور على مستخدمين
    if (!users || users.length === 0) {
      return next(new AppError("No users found with the given criteria", 404));
    }

    // إرجاع النتيجة
    return res.status(200).json({
      status: "SUCCESS",
      message: "Users found",
      length: users.length, // عدد المستخدمين
      data: users, // إرجاع بيانات المستخدمين
    });
  }
);

/**-------------------------------------
 * @desc   update user profile
 * @router /api/v1/user
 * @method update
 * @access privet (only user himsylfe)
 -------------------------------------*/

module.exports.updateUserCtr = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id; // Assume user is already authenticated

  // Extract only the allowed fields
  const { phone, name, email, location, city } = req.body;

  const updates = { phone, name, email, location, city };

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select("-password -passwordConfirm");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "SUCCESS",
    message: "User updated successfully",
    data: { user },
  });
});

module.exports.updateProfileImageCtr = catchAsyncErrors(
  async (req, res, next) => {
    // 1. VALIDATION
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // 2. GET THE PATH TO THE IMAGE
    const imagePath = `/images/${req.file.filename}`;

    // 3. Upload to cloudinary (commented out for now)
    // const result = await cloudinaryUploadImage(imagePath);

    // 4. Get the user from DB
    const user = await User.findById(req.user.id);

    // 5. Delete the old profile photo if it exists
    if (user.profilePhoto) {
      const oldImagePath = path.join(__dirname, `..${user.profilePhoto}`);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      // Optionally, also remove from Cloudinary if necessary
      // await cloudinaryRemoveImage(user.profilePhoto.publicId);
    }

    // 6. Update user profile photo
    user.profilePhoto = imagePath;
    await user.save({ validateBeforeSave: false });

    // 7. Send response to client first
    res.status(200).json({
      message: "Your profile photo uploaded successfully",
      user,
    });
  }
);

module.exports.deleteUserCtr = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "SUCCESS",
    message: "User deleted successfully",
  });
});

module.exports.getSingleUserCtr = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id;

  const user = await User.findById(userId).select("-password -passwordConfirm");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "SUCCESS",
    message: "User fetched successfully",
    data: { user },
  });
});
