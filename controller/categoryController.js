const { Category } = require("../models/Category");
const AppError = require("../utils/AppError");
const catchAsyncErrors = require("../utils/catchAsyncErrors");

/**-------------------------------------
 * @desc   Create new category
 * @router /api/v1/category
 * @method POST
 * @access private (only admin)
 -------------------------------------*/
module.exports.createNewCategory = catchAsyncErrors(async (req, res, next) => {
  const category = req.body.category;

  const categoryExists = await Category.findOne({ name: category });
  if (categoryExists) {
    return next(new AppError("category already exists", 400));
  }

  const newCategory = await Category.create({ name: category });
  newCategory.__v = undefined;

  res.status(201).json({
    status: "SUCCESS",
    message: "category added successfully",
    data: { newCategory },
  });
});

/**-------------------------------------
 * @desc   Update category
 * @router /api/v1/category/:id
 * @method PUT
 * @access private (only admin)
 -------------------------------------*/
module.exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    { name: req.body.category },
    { new: true, runValidators: true }
  );

  if (!updatedCategory) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "SUCCESS",
    message: "category updated successfully",
    data: { updatedCategory },
  });
});

/**-------------------------------------
 * @desc   Delete category
 * @router /api/v1/category/:id
 * @method DELETE
 * @access private (only admin)
 -------------------------------------*/
module.exports.deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const deletedCategory = await Category.findByIdAndDelete(id);

  if (!deletedCategory) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "SUCCESS",
    message: "category deleted successfully",
  });
});

/**-------------------------------------
 * @desc   Get single category
 * @router /api/v1/category/:id
 * @method GET
 * @access public
 -------------------------------------*/
module.exports.getCategory = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    status: "SUCCESS",
    data: { category },
  });
});

/**-------------------------------------
 * @desc   Get all categories
 * @router /api/v1/category
 * @method GET
 * @access public
 -------------------------------------*/
module.exports.getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    status: "SUCCESS",
    results: categories.length,
    data: { categories },
  });
});
