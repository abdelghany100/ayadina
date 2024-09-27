const { User } = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
/**-------------------------------------
 * @desc   filter by city
 * @router /api/v1/user/filter-by-city
 * @method GET
 * @access privet (only login)
 -------------------------------------*/
module.exports.getDataForSearchCtr = catchAsyncErrors(
 
    async (req, res, next) => {
      // البحث عن المستخدمين الذين لديهم وظائف فقط
      const users = await User.find({ jobs: { $exists: true, $ne: [] } }).select("location jobs city");
  
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
