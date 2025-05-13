import mongoose from "mongoose";
import User from "../models/user.model/user.model.js";

export const user_verification = async (req, res, next) => {
  const { user } = req.body;

  if (!user) {
    return res.status(500).json({ message: "UnAuthorized" });
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    return res.status(500).json({ message: "Request not valid" });
  }

  // Check if staff exist
  const staffExists = await User.findById(user);
  if (!staffExists) {
    return res.status(500).json({ message: "Request not valid" });
  }

  if (!staffExists.active) {
    return res.status(500).json({ message: "Request not valid" });
  }

  next();
};

export const admin_verification = async (req, res, next) => {
  const { user } = req.body;

  if (!user) {
    return res.status(500).json({ message: "UnAuthorized" });
  }

  if (!mongoose.Types.ObjectId.isValid(user)) {
    return res.status(500).json({ message: "User not valid" });
  }

  // Check if staff exist
  const staffExists = await User.findById(user);
  if (!staffExists) {
    return res.status(500).json({ message: "Staff does not exist" });
  }

  if (staffExists.role === "Admin" || staffExists.full_access) {
    req.body.isAllowed = true;
  }

  next();
};
