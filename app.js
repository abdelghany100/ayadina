const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
dotenv.config({ path: "config.env" });
const cors = require("cors");
const compression = require("compression");
const { errorHandler, notFound } = require("./middlewares/error");
const path = require("path");

const app = express();
// إعداد محرك القوالب EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // إعداد مجلد القوالب
const DB = process.env.DATABASE_URI.replace("<USER>", process.env.DATABASE_USER)
  .replace("<PASSWORD>", process.env.DATABASE_PASSWORD)
  .replace("<DATABASENAME>", process.env.DATABASE_NAME);

mongoose
  .connect(DB)
  .then(() => {
    console.log("Connection established");
  })
  .catch((err) => {
    console.log(err);
  });

  app.use("/images", express.static(path.join(__dirname, "images")));

   
app.use(cors());

// Add compression middleware
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // لإتاحة تحليل البيانات من نماذج HTML

// Routes
app.use("/api/v1/auth", require("./routes/authRoute"));
app.use("/api/v1/posts", require("./routes/postRoute"));
app.use("/api/v1/comments", require("./routes/commentRoute"));
app.use("/api/v1/user", require("./routes/userRoute"));
app.use("/api/v1/category", require("./routes/categoryRoute"))
app.use("/api/v1/location", require("./routes/locationRoute"))
app.use("/api/v1/dashboard", require("./routes/dashboardRoute"))

app.use(notFound);

app.use(errorHandler);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server has started on port 8000");
});
