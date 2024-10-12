const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");

const router = require("express").Router();

router.get("/category", (req, res) => {
  res.render("categories"); // عرض ملف categories.ejs
});
router.get("/login", (req, res) => {
  res.render("login"); // عرض ملف categories.ejs
});
router.get("/users", (req, res) => {
  res.render("users"); // عرض ملف categories.ejs
});
router.get("/", (req, res) => {
  res.render("home"); // عرض ملف categories.ejs
});

module.exports = router;
