const {
  Comment,
  validateCreateComment,
  validateUpdateComment,
} = require("../models/Comment");
const { User } = require("../models/User");
const { Post } = require("../models/Post");
const catchAsyncErrors = require("../utils/catchAsyncErrors");
const AppError = require("../utils/AppError");

/**-------------------------------------
 * @desc   Create  new comment
 * @router /api/v1/comments
 * @method POST
 * @access private (only logged in user)
 -------------------------------------*/
module.exports.createCommentCtrl = catchAsyncErrors(async (req, res, next) => {
  const { error } = validateCreateComment(req.body);
  if (error) {
    return next(new AppError(`${error.details[0].message}`, 400));
  }

  const post = await Post.findById(req.body.postId);
  if (!post) {
    return next(new AppError("post not found", 404));
  }

  const profile = await User.findById(req.user.id);

  const comment = await Comment.create({
    postId: req.body.postId,
    text: req.body.text,
    user: req.user.id,
    username: profile.firstName + profile.lastName,
  });
  res.status(201).json({
    status: "SUCCESS",
    message: "comment created successfully",
    length: comment.length,
    data: { comment },
  });
});

/**-------------------------------------
 * @desc   GeT All Comments
 * @router /api//v1/comments
 * @method GET
 * @access private (only admin)
 -------------------------------------*/
module.exports.GetAllCommentsCtrl = catchAsyncErrors(async (req, res, next) => {
  const comments = await Comment.find().populate("user", ["-password"]);

  res.status(200).json({
    status: "SUCCESS",
    message: "",
    length: comments.length,
    data: { comments },
  });
});

/**-------------------------------------
 * @desc   delete Comment
 * @router /api/v1/comments/:id
 * @method Delete
 * @access private (only admin or owner of the comment)
 -------------------------------------*/
module.exports.deleteCommentCtrl = catchAsyncErrors(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new AppError("comment not found", 404));
  }

  const isAdmin = req.user.isAdmin;
  if (isAdmin || req.user.id === comment.user._id.toString()) {
    await Comment.findByIdAndDelete(req.params.id);
    return res.status(201).json({
      status: "SUCCESS",
      message: "comment has been deleted",
      length: comment.length,
      data: {},
    });
  } else {
    return res.status(403).json({ message: "access denied, not allowed" });
  }
});

/**-------------------------------------
 * @desc   update Comment
 * @router /api/v1/comments/:id
 * @method Put
 * @access private (only  owner of the comment)
 -------------------------------------*/
module.exports.updateCommentCtrl = catchAsyncErrors(async (req, res, next) => {
  const { error } = validateUpdateComment(req.body);
  if (error) {
    return next(new AppError(`${error.details[0].message}`, 400));
  }
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return next(new AppError("comment not found", 400));
  }

  if (req.user.id !== comment.user._id.toString()) {
    return next(
      new AppError(
        "access denied, only user himself can edit this comment",
        400
      )
    );
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    req.params.id,
    {
      $set: { text: req.body.text },
    },
    { new: true }
  );
  return res.status(201).json({
    status: "SUCCESS",
    message: "comment updated successfully",
    length: updatedComment.length,
    data: { updatedComment },
  });
});
