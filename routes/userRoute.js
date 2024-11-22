const {
  getDataForSearchCtr,
  getAllUserByFilterCtr,
  updateUserCtr,
  deleteUserCtr,
  getSingleUserCtr,
  updateProfileImageCtr,
  getAllUserCtr,
  removeJobCtr,
  blockUserCtr,
  unblockUserCtr,
  getBlockedUsersCtr,
  deleteUserِAdminCtr,
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
  .route("/")
  .get(verifyTokenAndAdmin, getAllUserCtr)
  .delete(verifyToken, deleteUserCtr);
router
  .route("/profile-photo")
  .post(verifyToken, photoUpload.single("image"), updateProfileImageCtr);

router.post("/block", verifyToken, blockUserCtr);
router.post("/unblock", verifyToken, unblockUserCtr);
router.get("/blocked-users", verifyToken, getBlockedUsersCtr);

router
  .route("/:id")
  .patch(verifyToken, updateUserCtr)
  .get(verifyToken, getSingleUserCtr)
  .delete(verifyToken, deleteUserِAdminCtr);
router.route("/removeJob/:id").delete(verifyToken, removeJobCtr);

module.exports = router;
