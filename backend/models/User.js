const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// User
// - _id
// - name
// - email (unique, indexed)
// - password (hashed)
// - role ("ADMIN" | "USER")
// - isActive (boolean)
// - lastLoginAt
// - createdAt
// - updatedAt

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // password by default return na ho
    },
    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      default: "USER",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: Date,
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    // If password is not modified, skip hashing
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);

  // passwordChangedAt
  // ↳ sirf tab set karo jab password change ho
  // ↳ user creation ke time nahi
  if (!this.isNew) { // isNew - in-built mongoose function
    this.passwordChangedAt = Date.now() - 1000;
  }

});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Password change hone ke baad bhi purana jwt valid reh jata h, uska invalidation check h
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (!this.passwordChangedAt) return false;

  const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);

  return JWTTimestamp < changedTimestamp;
};

// So that we can hide password in responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
