const {
  createNewCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
  insertCategories,
} = require("../controller/categoryController");
const {
  verifyTokenAndAdmin,
  verifyToken,
} = require("../middlewares/verifyToken");

const router = require("express").Router();

router
  .route("/")
  .post(verifyTokenAndAdmin, createNewCategory)
  .get(verifyToken, getAllCategories);
router
  .route("/:id")
  .patch(verifyTokenAndAdmin, updateCategory)
  .delete(verifyTokenAndAdmin, deleteCategory)
  .get(verifyToken, getCategory);

router.post("/bulk", verifyTokenAndAdmin, insertCategories);

module.exports = router;
