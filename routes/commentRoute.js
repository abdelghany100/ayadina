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
    .get(verifyTokenAndAdmin, GetAllCommentsCtrl);
  
  // /api/comments/:id
  router
    .route("/:id")
    .delete(validateObjectid, verifyToken, deleteCommentCtrl)
    .patch(validateObjectid, verifyToken, updateCommentCtrl);
  
  module.exports = router;
  