const mongoose = require("mongoose");
const joi = require("joi");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// User Schema
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    jobs: [String],
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: "password and passwordConfirm are not the same",
      },
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    profilePhoto: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png ",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpire: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
UserSchema.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id",
});

// Generate Auth Token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      isAdmin: this.isAdmin,
    },
    process.env.JWT_SECRET_KEY
  );
};

UserSchema.pre("save", async function (next) {
  // Hash the password if the password field is modified
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

UserSchema.methods.generateRandomToken = function () {
  const token = crypto.randomInt(1000, 10000).toString();
  // const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetToken = token;
  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;
  return token;
};

//  Validate Register User
function validateRegisterUser(obj) {
  const Schema = joi.object({
    name: joi.string().trim().required(),
    email: joi.string().trim().required().email(),
    password: joi.string().trim().required(),
    confirmPassword: joi.string().required(),
    phone: joi.string().trim().required(),
    location: joi.string().trim().required(),
    city: joi.string().trim().required(),
    // job: joi.string().trim().required(),
  });
  return Schema.validate(obj);
}

function validateLoginUser(obj) {
  const Schema = joi.object({
    email: joi.string().trim().required().email(),
    password: joi.string().trim().required(),
  });
  return Schema.validate(obj);
}

const User = mongoose.model("User", UserSchema);

module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
};
