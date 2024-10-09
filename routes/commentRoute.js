const {
  createCommentCtrl,
  deleteCommentCtrl,
  GetAllCommentsCtrl,
  updateCommentCtrl,
  // GetAllCommentsCtrl,
  // deleteCommentCtrl,
  // updateCommentCtrl,
} = require("../controller/commentController");
const validateObjectid = require("../middlewares/validateObjectid");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");

const router = require("express").Router();

// /api/comments
router
  .route("/")
  .post(verifyToken, createCommentCtrl)

// /api/comments/:id
router
  .route("/:id")
  .get(verifyToken, GetAllCommentsCtrl)

  .delete(validateObjectid, verifyToken, deleteCommentCtrl)
  .patch(validateObjectid, verifyToken, updateCommentCtrl);

module.exports = router;
