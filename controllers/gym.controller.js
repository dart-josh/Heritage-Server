import mongoose from "mongoose";
import GymClient from "../models/gym.model/client.model.js";
import { io } from "../socket/socket.js";
import GymHMO from "../models/gym.model/hmo.model.js";
import GymIncome from "../models/gym.model/gym_income.model.js";

// ? GETTERS

// get clients
export const get_all_clients = async (req, res) => {
  try {
    const clients = await GymClient.find({});

    res.json({ clients });
  } catch (error) {
    console.log("Error in get_all_clients controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get_hmo
export const get_hmo = async (req, res) => {
  try {
    const hmo = await GymHMO.find({});

    res.json({ hmo });
  } catch (error) {
    console.log("Error in get_hmo controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get_hmo
export const get_gym_income = async (req, res) => {
  const {month} = req.params;
  const { start, end } = getMonthRange(month);

  try {
    const gym_income = await GymIncome.find({
      sub_date: {
        $gte: start,
        $lt: end,
      },
    });

    res.json({ gym_income });
  } catch (error) {
    console.log("Error in get_gym_income controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// ? SETTERS

// register_client
export const register_client = async (req, res) => {
  const { client_id, client_details } = req.body;

  // verify fields
  if (!client_id || !client_details) {
    return res.status(500).json({ message: "Invalid data" });
  }

  const client_id_exists = await GymClient.findOne({ client_id });

  try {
    if (client_id_exists) {
      return res.status(500).json({ message: "Client ID Exists" });
    }

    const client = await GymClient.create({
      ...client_details,
    });

    res.json({
      message: "Client Created Successfully",
      client,
    });

    //? emit
    io.emit("GymClient", client);
  } catch (error) {
    console.log("Error in register_client: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// update_client
export const update_client = async (req, res) => {
  const { client_key, client_details, data_type } = req.body;

  // verify fields
  if (!client_key || !client_details || !data_type) {
    return res.status(500).json({ message: "Invalid data" });
  }

  try {
    // check if _id is valid
    if (!mongoose.Types.ObjectId.isValid(client_key)) {
      return res.status(500).json({ message: "ID not valid" });
    }

    // Check if client exist
    const clientExists = await GymClient.findById(client_key);
    if (!clientExists) {
      return res.status(500).json({ message: "Client does not exist" });
    }

    const updates = pickDefined(client_details);

    const client = await GymClient.findByIdAndUpdate(
      client_key,
      { $set: updates },
      { new: true }
    );

    res.json({
      message: "Client Updated Successfully",
      client,
    });

    //? emit
    io.emit("GymClient", client);
  } catch (error) {
    console.log("Error in update_client: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// add_to_sub_history
export const add_to_sub_history = async (req, res) => {
  const { client_key, sub_details } = req.body;

  // verify fields
  if (!client_key || !sub_details) {
    return res.status(500).json({ message: "Invalid data" });
  }

  try {
    // check if _id is valid
    if (!mongoose.Types.ObjectId.isValid(client_key)) {
      return res.status(500).json({ message: "ID not valid" });
    }

    // Check if client exist
    const clientExists = await GymClient.findById(client_key);
    if (!clientExists) {
      return res.status(500).json({ message: "Client does not exist" });
    }

    const client = await GymClient.findByIdAndUpdate(
      client_key,
      {
        $push: {
          sub_history: { ...sub_details },
        },
      },
      { new: true }
    );

    add_gym_income({ ...sub_details, client_key });

    res.json({
      message: "History Added",
      client,
    });

    //? emit
    io.emit("GymClient", client);
  } catch (error) {
    console.log("Error in add_to_sub_history: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// add_update_hmo
export const add_update_hmo = async (req, res) => {
  const { key, hmo_name, days_week, hmo_amount } = req.body;

  try {
    if (!hmo_name) {
      return res.status(400).json({ message: "HMO name is required" });
    }

    // 🔍 Check for duplicate name
    const nameExists = await GymHMO.findOne({
      hmo_name,
      ...(key ? { _id: { $ne: key } } : {}),
    });

    if (nameExists) {
      return res.status(409).json({
        message: "HMO name already exists",
      });
    }

    let hmo;

    // ➕ CREATE
    if (!key) {
      hmo = await GymHMO.create({
        hmo_name,
        days_week,
        hmo_amount,
      });

      //? emit
      io.emit("GymHmo", hmo);
      return res.status(200).json({ message: "HMO added", hmo });
    }

    // ✏️ UPDATE
    hmo = await GymHMO.findByIdAndUpdate(
      key,
      {
        $set: {
          hmo_name,
          days_week,
          hmo_amount,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!hmo) {
      return res.status(404).json({ message: "HMO not found" });
    }

    //? emit
    io.emit("GymHmo", hmo);

    return res.status(200).json({ message: "HMO updated", hmo });
  } catch (error) {
    console.log("Error in add_update_hmo", error);
    return res.status(500).json({ message: "Failed to update HMO" });
  }
};

// register physio

//?

//? REMOVALS

// delete_client
export const delete_client = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Client ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Client ID not valid" });
  }

  // Check if client exist
  const clientExists = await GymClient.findById(id);
  if (!clientExists) {
    return res.status(500).json({ message: "Client does not exist" });
  }

  try {
    await GymClient.findByIdAndDelete(id);
    res.status(200).json({ message: "Client deleted Successfully", id });

    //? emit
    io.emit("GymClientD", id);
  } catch (error) {
    console.log("Error in delete_client: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// delete_hmo
export const delete_hmo = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await GymHMO.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(500).json({ message: "HMO not Found" });
    }

    res.status(200).json({ message: "HMO deleted Successfully", id });

    //? emit
    io.emit("GymHmoD", id);
    return deleted;
  } catch (error) {
    console.log("Error in delete_hmo: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? UTILS

// generate client_id
export const generate_client_id = async (req, res) => {
  var all_ids = [];

  try {
    const clients = await GymClient.find({});

    for (let index = 0; index < clients.length; index++) {
      const element = clients[index];

      var id = parseInt(element.client_id.split("-")[1]);
      all_ids.push(id);
    }
  } catch (error) {
    console.log("Error in generate_client_id", error);
    return res.status(500).json({ message: "Failed to generate ID" });
  }

  var new_id = 0;

  if (all_ids.length > 0) {
    new_id = Math.max(...all_ids);
  }

  new_id++;
  return res.json({
    message: "ID Generated",
    client_id: new_id,
  });
};

export const add_gym_income = async (hist_data) => {
  try {
    const {
      client_key,
      hist_type,
      amount,
      extras_amount,
      sub_amount_b4_discount,
      sub_plan,
      sub_type,
      sub_date,
      exp_date,
      boxing,
      pt_status,
    } = hist_data;

    // 🔍 Required fields validation
    if (
      !client_key ||
      !hist_type ||
      !sub_date
    ) {
      return {
        message: "Missing required fields",
      };
    }

    const isoSubDate = parseDDMMYYYYToISO(sub_date);
    const isoExpDate = parseDDMMYYYYToISO(exp_date);

    // ➕ Create income record
    const income = await GymIncome.create({
      client_key,
      hist_type,
      amount,
      extras_amount,
      sub_amount_b4_discount,
      sub_plan,
      sub_type,
      sub_date: isoSubDate,
      exp_date: isoExpDate,
      boxing,
      pt_status,
    });

    return {
      message: "Gym income added successfully",
      data: income,
    };
  } catch (error) {
    console.log("Error in add_gym_income: ", error);
    return {
      message: "Error adding gym income",
      error: error.message,
    };
  }
};

const pickDefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));

/**
 * Converts "DD/MM/YYYY" to a JavaScript Date (ISO-compatible)
 */
export const parseDDMMYYYYToISO = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null;

  const [day, month, year] = dateStr.split("/").map(Number);

  if (!day || !month || !year) return null;

  // Month is 0-based in JS Date
  return new Date(Date.UTC(year, month - 1, day));
};

export const getMonthRange = (month) => {
  // month format: "YYYY-MM"
  const [year, monthIndex] = month.split("-").map(Number);

  const start = new Date(Date.UTC(year, monthIndex - 1, 1));
  const end = new Date(Date.UTC(year, monthIndex, 1)); // next month

  return { start, end };
};
