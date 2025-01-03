const { Post } = require("../models/Post");
const { Comment } = require("../models/Comment");
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
    const { location, job, city } = req.query;
    const currentUserId = req.user.id; // معرف المستخدم الحالي
    let notfoundUsers = false;

    // جلب المستخدم الحالي وقائمة المستخدمين المحظورين
    const currentUser = await User.findById(currentUserId).select(
      "blockedUsers"
    );
    const blockedUsers = currentUser.blockedUsers || [];

    // بناء الفلتر بناءً على القيم المرسلة في الـ query
    const filter = {
      _id: { $nin: blockedUsers }, // استثناء المستخدمين المحظورين
      jobs: { $exists: true, $ne: [] }, // جلب المستخدمين الذين لديهم وظائف فقط
    };

    if (location) {
      filter.location = location;
    }

    if (job) {
      filter.jobs = job; // تحقق من وجود الوظيفة المحددة في الفلتر
    }

    if (city) {
      filter.city = city;
    }

    // البحث عن المستخدمين بناءً على الفلاتر
    let users = await User.find(filter)
      .select("location jobs city profilePhoto name")
      .populate({
        path: "posts",
        match: job ? { job: job } : {}, // تصفية البوستات بناءً على الوظيفة إذا كانت محددة
        select: "image job", // جلب الصور والوظيفة فقط من البوستات
      });

    // إذا لم يتم العثور على أي مستخدمين، جلب جميع المستخدمين مع صور بوستاتهم
    if (!users || users.length === 0) {
      users = await User.find({ _id: { $nin: blockedUsers } })
        .select("location jobs city profilePhoto name")
        .populate({
          path: "posts",
          select: "image job", // جلب الصور والوظيفة فقط من البوستات
        });
         notfoundUsers = true;
    }

    // دمج الصور من البوستات
    const usersWithImages = users.map((user) => {
      const images = user.posts.flatMap((post) =>
        post.image.map((img) => img.url)
      ); // جلب الروابط للصور

      return {
        ...user.toObject(),
        images,
      };
    });

    // التحقق من وجود صور للمستخدمين
    const usersWithImagesResult = usersWithImages.filter(
      (user) => user.images.length > 0
    );

    // إذا لم يكن هناك مستخدمين مع صور، إرجاع رسالة خطأ
    if (usersWithImagesResult.length === 0) {
      return next(new AppError("No users found with matching posts", 404));
    }

    // إرجاع النتيجة
    return res.status(200).json({
      status: "SUCCESS",
      message: notfoundUsers ? "لا يوجود مستخدمين بهذه الخصائص اليك كل المستخدمين" :  "Users found successfully",
      length: usersWithImagesResult.length,
      data: usersWithImagesResult,
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
  const userId = req.user.id;
  console.log(`Delete user ${userId}`);
  await Post.deleteMany({ userId });

  await Comment.deleteMany({ user: userId });
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "SUCCESS",
    message: "User deleted successfully",
  });
});
module.exports.deleteUserِAdminCtr = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id;
  console.log(`Delete user ${userId}`);
  await Post.deleteMany({ userId });

  await Comment.deleteMany({ user: userId });
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

  const user = await User.findById(userId)
    .populate("posts")
    .select("-password -passwordConfirm");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "SUCCESS",
    message: "User fetched successfully",
    data: { user },
  });
});
module.exports.getAllUserCtr = catchAsyncErrors(async (req, res, next) => {
  // const userId = req.params.id;

  const users = await User.find()
    .populate("posts")
    .select("-password -passwordConfirm");

  res.status(200).json({
    status: "SUCCESS",
    message: "User fetched successfully",
    data: { users },
  });
});

module.exports.removeJobCtr = catchAsyncErrors(async (req, res, next) => {
  const userId = req.params.id; // Assume user is authenticated
  const { jobName } = req.body; // Expect job name in the request body

  // Find the user by ID
  const user = await User.findById(userId).select("-password -passwordConfirm");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if the job exists in the user's jobs array
  if (!user.jobs.includes(jobName)) {
    return next(new AppError("Job not found in user's jobs list", 400));
  }

  // Remove the job from the jobs array
  user.jobs = user.jobs.filter((job) => job !== jobName);

  // Save the updated user document
  // user.password= undefined,
  (user.passwordResetToken = undefined),
    (user.passwordResetTokenExpire = undefined);
  await user.save({ validateModifiedOnly: true }); // هذه الطريقة تتأكد من حفظ التحديثات فقط

  res.status(200).json({
    status: "SUCCESS",
    message: "Job removed successfully",
    data: {
      user,
    },
  });
});

module.exports.blockUserCtr = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { blockedUserId } = req.body;
  console.log(blockedUserId);

  const blockedUser = await User.findById(blockedUserId);
  if (!blockedUser) {
    return next(new AppError("User to be blocked not found", 404));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { blockedUsers: blockedUserId } },
    { new: true }
  );

  res.status(200).json({
    status: "SUCCESS",
    message: "User blocked successfully",
    data: { user },
  });
});

module.exports.unblockUserCtr = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;
  const { blockedUserId } = req.body;

  const blockedUser = await User.findById(blockedUserId);
  if (!blockedUser) {
    return next(new AppError("User to be unblocked not found", 404));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { blockedUsers: blockedUserId } },
    { new: true }
  );

  res.status(200).json({
    status: "SUCCESS",
    message: "User unblocked successfully",
    data: { user },
  });
});

module.exports.getBlockedUsersCtr = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).populate("blockedUsers", "name email profilePhoto");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "SUCCESS",
    message: "Blocked users retrieved successfully",
    data: user.blockedUsers,
  });
});