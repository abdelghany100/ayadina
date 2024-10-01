const {
  getDataForSearchCtr,
  getAllUserByFilterCtr,
  updateUserCtr,
  deleteUserCtr,
  getSingleUserCtr,
  updateProfileImageCtr,
} = require("../controller/userController");
const photoUpload = require("../middlewares/photoUpload");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");

const router = require("express").Router();

router.route("/get-data-search").get(verifyToken, getDataForSearchCtr);
router.route("/filter-data-search").get(verifyToken, getAllUserByFilterCtr); 

router
  .route("/:id")
  .patch(verifyToken, updateUserCtr)
  .delete(verifyTokenAndAdmin, deleteUserCtr)
  .get(verifyToken, getSingleUserCtr);

  router
  .route("/profile-photo")
  .post(verifyToken, photoUpload.single("image"), updateProfileImageCtr);

module.exports = router;
 