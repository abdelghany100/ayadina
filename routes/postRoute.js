const router = require("express").Router();

const {
  getAllPostCtrl,
  createPostCtrl,
  getSinglePostsCtrl,
  deletePostCtrl,
  updatePostCtr,
  updatePostImageCtr,
  toggleLikeCtrl,
} = require("../controller/postController");
const photoUpload = require("../middlewares/photoUpload");
const validateObjectid = require("../middlewares/validateObjectid");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");

// /api/posts
router
  .route("/")
  .post(verifyToken, photoUpload.single("image"), createPostCtrl)
  .get(verifyToken, getAllPostCtrl);

router
  .route("/:id")
  .get(validateObjectid, verifyToken, getSinglePostsCtrl)
  .delete(validateObjectid, verifyToken, deletePostCtrl)
  .patch(validateObjectid, verifyToken, updatePostCtr);

router
  .route("/update-image/:id")
  .patch(verifyToken, photoUpload.single("image"), updatePostImageCtr);

router.route("/like/:id").put(validateObjectid, verifyToken, toggleLikeCtrl);

module.exports = router;
