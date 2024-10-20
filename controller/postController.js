const fs = require("fs");
const path = require("path");
const {
  Post,
  validateCreatePost,
  validateUpdatePost,
} = require("../models/Post");
const { Comment } = require("../models/Comment");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");
const { User } = require("../models/User");
const { console } = require("inspector");

/**-------------------------------------
 * @desc   Create new post
 * @router /api/v1/posts
 * @method POST
 * @access private(only admin)
 -------------------------------------*/

module.exports.createPostCtrl = catchAsyncErrors(async (req, res, next) => {
  // 1. validation for image
  console.log(1)
  // console.log(req);
  if (!req.files) {
    return next(new AppError("no image provided", 400));
  }

  // 2. validation for data
  const { error } = validateCreatePost(req.body);
  if (error) {
    return next(new AppError(`${error.details[0].message} `, 400));
  }

  // 3. Upload photo
  const images = req.files.map((file) => ({
    url: `/images/${file.filename}`,
  })); //   const result = await cloudinaryUploadImage(imagePath);
  // 4. Create new post and save to DB
  const post = await Post.create({
    title: req.body.title,
    description: req.body.description,
    tags: req.body.tags || [],
    user: req.user.id,
    image: images,
    job: req.body.job,
  });
  const user = await User.findById(req.user.id);
  if (user) {
    // Check if the job already exists in the user's jobs array
    if (!user.jobs.includes(req.body.job)) {
      // If the job does not exist, push it to the jobs array
      user.jobs.push(req.body.job);
      await user.save({ validateBeforeSave: false });
    }
    // If the job exists, do nothing (do not add it again)
  }

  res.status(201).json({
    status: "SUCCESS",
    message: "post created  successfully",
    length: post.length,
    data: { post },
  });
});

/**-------------------------------------
 * @desc   Get All posts
 * @router /api/v1/posts
 * @method GET
 * @access public
 -------------------------------------*/

module.exports.getAllPostCtrl = catchAsyncErrors(async (req, res, next) => {
  const POST_PER_PAGE = 2;
  const { pageNumber, category } = req.query;
  let posts;
  if (pageNumber) {
    posts = await Post.find({ user: req.user.id })
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(PLOG_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("comments");
  } else if (category) {
    posts = await Post.find({ user: req.user.id, category })
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("comments");
  } else {
    posts = await Post.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("comments");
  }

  res.status(200).json({
    status: "SUCCESS",
    message: "",
    length: posts.length,
    data: { posts },
  });
});

/**-------------------------------------
 * @desc   Get single post
 * @router /api/v1/posts/:id
 * @method GET
 * @access public
 -------------------------------------*/

module.exports.getSinglePostsCtrl = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("comments");
  if (!post) {
    return next(new AppError("post not found", 404));
  }
  res.status(200).json({
    status: "SUCCESS",
    message: "",
    length: post.length,
    data: { post },
  });
});

/**-------------------------------------
 * @desc   Delete post
 * @router /api/posts/:id
 * @method Delete
 * @access private (only admin or owner of the post)
 -------------------------------------*/

module.exports.deletePostCtrl = catchAsyncErrors(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError("post not found", 404));
  }

  if (req.user.isAdmin || req.user.id === post.user._id.toString()) {
    post.image.forEach((img) => {
      if (img.url) {
        const imagePath = path.join(__dirname, "..", img.url);
        
        try {
          // Check if the file exists before deleting
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          } else {
            console.log("Image file does not exist.");
          }
        } catch (error) {
          console.error("Error deleting image file:", error);
          return next(new AppError("Error deleting image file", 500));
        }
      }
    });
    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ postId: post._id });

    res.status(200).json({
      status: "SUCCESS",
      message: "Post deleted successfully",
      length: post.length,
      data: {},
    });
  } else {
    return next(new AppError("access denied , forbidden", 403));
  }
});

/**-------------------------------------
 * @desc   Update post
 * @router /api/v1/posts/:id
 * @method patch
 * @access private (only  owner of the post)
 -------------------------------------*/

module.exports.updatePostCtr = catchAsyncErrors(async (req, res, next) => {
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return next(new AppError(`${error.details[0].message} `, 400));
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError("Post Not Found", 404));
  }

  if (req.user.id !== post.user._id.toString()) {
    return next(new AppError("access denied , forbidden", 403));
  }

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
      },
    },
    { new: true }
  ).populate("user", ["-password"]);

  res.status(200).json({
    status: "SUCCESS",
    message: "Post updated successfully",
    length: updatedPost.length,
    data: { updatedPost },
  });
});

/**-------------------------------------
 * @desc   Update post image
 * @router /api/posts/upload-image/:id
 * @method PUT
 * @access private (only  owner of the post)
 -------------------------------------*/

module.exports.updatePostImageCtr = catchAsyncErrors(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("no image provided", 400));
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError("Post Not Found", 404));
  }

  if (req.user.id !== post.user._id.toString()) {
    return next(new AppError("access denied , forbidden", 403));
  }
  const imagePathOld = path.join(__dirname, "..", post.image.url);
  fs.unlinkSync(imagePathOld);
  const newImagePath = `/images/${req.file.filename}`;

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: newImagePath,
        },
      },
    },
    { new: true }
  );
  res.status(200).json({
    status: "SUCCESS",
    message: "image updated successfully",
    length: updatedPost.length,
    data: { updatedPost },
  });
});

/**-------------------------------------
 * @desc   Toggle like
 * @router /api/posts/like/:id
 * @method PUT
 * @access private (only logged in user)
 -------------------------------------*/
module.exports.toggleLikeCtrl = catchAsyncErrors(async (req, res, next) => {
  const loggedInUser = req.user.id;
  const { id: postId } = req.params;
  let post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("Post Not Found", 404));
  }

  const isPostAlreadyLiked = post.likes.find(
    (user) => user.toString() === loggedInUser
  );
  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loggedInUser },
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loggedInUser },
      },
      { new: true }
    );
  }
  res.status(200).json(post);
});
