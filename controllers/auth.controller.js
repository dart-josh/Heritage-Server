import bcrypt from "bcryptjs";
import { get_connected_users } from "../socket/socket.js";
import User from "../models/user.model/user.model.js";

// get online users
export const get_online_users = async (req, res) => {
  const onlineUsers = get_connected_users();

  try {
    // find online users from database
    const onlineUsersDb = await User.find({
      staffId: { $in: onlineUsers },
    }).select("user_id f_name, l_name");
    res.json({ onlineUsersDb });
  } catch (error) {
    console.log("Error in get_online_users controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? login
export const login = async (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res.status(500).json({ message: "Enter all required fields" });
  }

  // password must be at least 6 characters
  if (password.length < 6) {
    return res
      .status(500)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const userExists = await User.findOne({ user_id });
    if (!userExists) {
      return res.status(500).json({ message: "Invalid User ID" });
    }

    // if password does not exist create a new one
    if (!userExists.password) {
      const salt = await bcrypt.genSalt(10);
      userExists.password = await bcrypt.hash(password, salt);
      await userExists.save();

      // remove password
      userExists.password = undefined;

      return res.status(200).json({
        message: "Password created successfully",
        login: true,
        user: userExists,
      });
    }

    const isMatch = await bcrypt.compare(password, userExists.password);
    if (!isMatch) {
      return res.status(500).json({ message: "Incorrect password" });
    }

    // remove password
    userExists.password = undefined;

    // login
    return res.status(200).json({
      message: "Login Successful",
      userExists,
      login: true,
      user: userExists,
    });
  } catch (error) {
    console.log("Error in login controller: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// check staff id
export const check_staff_id = async (req, res) => {
  const { user_id } = req.body;

  if (!staffId) {
    return res.status(500).json({ message: "Enter User ID" });
  }

  try {
    const staffExists = await Staff.findOne({ staffId });
    // invalid id
    if (!staffExists) {
      return res.status(500).json({ message: "Invalid Staff ID" });
    }

    // active account
    if (!staffExists.active) {
      return res.status(500).json({ message: "Inactive account" });
    }

    // if password does not exist
    if (!staffExists.password) {
      return res.status(200).json({ message: "Create password", mode: 1 });
    }

    // remove password
    staffExists.password = undefined;
    staffExists.pin = undefined;

    // good
    return res.status(200).json({ message: "Staff ID Valid", mode: 0 });
  } catch (error) {
    console.log("Error in check_staff_id: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// check password
export const check_password = async (req, res) => {
  const { staffId, password } = req.body;

  if (!staffId || !password) {
    return res.status(500).json({ message: "Enter all required fields" });
  }

  try {
    const staffExists = await Staff.findOne({ staffId });
    if (!staffExists) {
      return res.status(500).json({ message: "Invalid Staff ID" });
    }

    // active account
    if (!staffExists.active) {
      return res.status(500).json({ message: "Inactive account" });
    }

    // if password does not exist
    if (!staffExists.password) {
      return res.status(200).json({ message: "Create password", mode: 1 });
    }

    const isMatch = await bcrypt.compare(password, staffExists.password);
    if (!isMatch) {
      return res.status(500).json({ message: "Incorrect password" });
    }

    // remove password
    staffExists.password = undefined;

    // login
    return res
      .status(200)
      .json({ message: "Login Valid", mode: 0, role: staffExists.role });
  } catch (error) {
    console.log("Error in check_password: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// check pin
export const check_pin = async (req, res) => {
  const { staffId, pin } = req.body;

  if (!staffId || !pin) {
    return res.status(500).json({ message: "Invalid details" });
  }

  try {
    const staffExists = await Staff.findOne({ staffId });
    if (!staffExists) {
      return res.status(500).json({ message: "Invalid Staff ID" });
    }

    // active account
    if (!staffExists.active) {
      return res.status(500).json({ message: "Inactive account" });
    }

    // if pin does not exist
    if (!staffExists.pin) {
      return res.status(200).json({ message: "Create pin", mode: 1 });
    }

    const isMatch = pin == staffExists.pin;
    if (!isMatch) {
      return res.status(500).json({ message: "Incorrect pin" });
    }

    // remove password
    staffExists.password = undefined;
    staffExists.pin = undefined;

    // login
    return res.status(200).json({ message: "Login Valid", mode: 0 });
  } catch (error) {
    console.log("Error in check_pin: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// create password
export const create_password = async (req, res) => {
  const { staffId, password } = req.body;

  if (!staffId || !password) {
    return res.status(500).json({ message: "Enter all required fields" });
  }

  // password must be at least 6 characters
  if (password.length < 6) {
    return res
      .status(500)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const staffExists = await Staff.findOne({ staffId });
    if (!staffExists) {
      return res.status(500).json({ message: "Invalid Staff ID" });
    }

    const salt = await bcrypt.genSalt(10);
    staffExists.password = await bcrypt.hash(password, salt);
    staffExists.pin = undefined;
    await staffExists.save();
    return res.status(200).json({
      message: "Password created successfully",
      mode: 0,
      role: staffExists.role,
    });
  } catch (error) {
    console.log("Error in create_password: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// create pin
export const create_pin = async (req, res) => {
  const { staffId, pin } = req.body;

  if (!staffId || !pin) {
    return res.status(500).json({ message: "Enter all required fields" });
  }

  // pin must be at least 6 characters
  if (pin.length < 4) {
    return res.status(500).json({ message: "Pin must be at least 4 digits" });
  }

  try {
    const staffExists = await Staff.findOne({ staffId });
    if (!staffExists) {
      return res.status(500).json({ message: "Invalid Staff ID" });
    }

    staffExists.pin = pin;
    await staffExists.save();
    return res
      .status(200)
      .json({ message: "Pin created successfully", mode: 0 });
  } catch (error) {
    console.log("Error in create_pin: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// reset password
export const reset_password = async (req, res) => {
  const { id: staffId } = req.params;

  if (!staffId) {
    return res.status(500).json({ message: "Staff ID is required" });
  }

  try {
    const staffExists = await Staff.findOne({ staffId });
    if (!staffExists) {
      return res.status(500).json({ message: "Invalid Staff ID" });
    }

    // delete password from database
    await Staff.updateOne({ staffId }, { password: null, pin: null });

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log("Error in reset_password: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// reset pin
export const reset_pin = async (req, res) => {
  const { id: staffId } = req.params;

  if (!staffId) {
    return res.status(500).json({ message: "Staff ID is required" });
  }

  try {
    const staffExists = await Staff.findOne({ staffId });
    if (!staffExists) {
      return res.status(500).json({ message: "Invalid Staff ID" });
    }

    // delete pin from database
    await Staff.updateOne({ staffId }, { pin: null });

    return res.status(200).json({ message: "Pin reset successfully" });
  } catch (error) {
    console.log("Error in reset_pin: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// get active staff
export const get_active_staff = async (req, res) => {
  const { id: staffId } = req.params;

  if (!staffId) {
    return res.status(500).json({ message: "Staff ID is required" });
  }

  try {
    const staffExists = await Staff.findOne({ staffId });
    if (!staffExists) {
      return res.status(500).json({ message: "Invalid Staff ID" });
    }

    staffExists.password = undefined;
    staffExists.pin = undefined;

    return res.status(200).json({ staff: staffExists, success: true });
  } catch (error) {
    console.log("Error in get_active_staff: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};
