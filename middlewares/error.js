const AppError = require("../utils/AppError");

const notFound = (req, res, next) => {
    next(new AppError('this route is not found', 404));
  };
  const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  
    res.status(statusCode).json({
      status: err.status ,
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  };
  
  module.exports = {
    errorHandler,
    notFound,
  };
  