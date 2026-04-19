import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.models.js";
import { signSchema, signupSchema } from "../validators/auth.validator.js";

const generateToken = async (req, res) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "[express-auth-kit] JWT_SECRET is not set in environment variables",
    );
    return jwt.sign({ userId }, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }
};

export const signUp = async (req, res) => {
  try {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { name, email, password } = result.data;
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
    res.status(201).json({
      message: "User Created",
      token,
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const signin = async (req, res) => {
  try {
    const result = signSchema.safeParse(req.body);
    if (!result.success)
      return res.status(400).json({
        success: false,
        errors: result.error.flatten().fieldErrors,
      });

    const { email, password } = result.data;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    return res.json({
      success: true,
      message: "Signed in successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
