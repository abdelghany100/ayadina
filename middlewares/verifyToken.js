const { json } = require("express");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

// Verify Token
function verifyToken(req, res, next) {
  const authToken = req.headers.authorization;
  if (authToken) {
    const token = authToken.split(" ")[1];
    try {
      const decodedPayload = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decodedPayload;
      next();
    } catch (err) {
      return next(new AppError("Invalid token,access denied", 401));

    }
  } else {
    return next(new AppError("no token provided, access denied", 401));

  }
}

// Verify Token & Admin
function verifyTokenAndAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return next(new AppError("not allowed, only admin", 403));

    }
  });
}
// module.exports = {verifyToken , verifyTokenAndAdmin};

// Verify Token & Only User Himself
function verifyTokenAndOnlyUser(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id ) {
      next();
    } else {
      return next(new AppError("not allowed, only user himself", 403));
    }
  });
}
// Verify Token & Only User Himself

function verifyTokenAndAdminOrUser(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return next(new AppError("not allowed, only user himself or Admin", 403));

    }
  });
}
module.exports = {verifyToken , verifyTokenAndAdmin , verifyTokenAndOnlyUser , verifyTokenAndAdminOrUser};
