const User = require("../models/User");
const { signToken } = require("./../utils/jwt");

const signUpUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (!email || !password) {
      return res
      .status(400)
      .json({ message: "Email and password are required" });
    }
    
    const user = await User.findOne({ email }).select("+password");
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false})

    const token = signToken(user._id);
    
    res.status(200).json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  signUpUser,
  loginUser,
};
