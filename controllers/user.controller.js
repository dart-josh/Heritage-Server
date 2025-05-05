import { io } from "../socket/socket.js";
import Customer from "../models/user.model/customer.model.js";
import Doctor from "../models/user.model/doctor.model.js";
import User from "../models/user.model/user.model.js";
import { generate_customer_id } from "../utils/utils.js";
import mongoose from "mongoose";

//? GETTERS

// get all customers
export const get_all_customers = async (req, res) => {
  try {
    const customers = await Customer.find({}).populate("orders");
    res.json({ customers });
  } catch (error) {
    console.log("Error in get_all_customers controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get all doctors
export const get_doctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({})
      .populate("user")
      .populate("my_patients.patient")
      .populate("ong_patients")
      .populate("pen_patients");
    res.json({ doctors });
  } catch (error) {
    console.log("Error in get_all_doctors controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get doctor by id
export const get_doctor_by_id = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await Doctor.findOne({ user: id })
      .populate("user")
      .populate("my_patients.patient")
      .populate("ong_patients")
      .populate("pen_patients");
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ doctor });
  } catch (error) {
    console.log("Error in get_doctor_by_id controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get all users
export const get_all_users = async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ users });
  } catch (error) {
    console.log("Error in get_all_users controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// ? STREAMSETS

//? SETTERS

// add/update customer
export const add_update_customer = async (req, res) => {
  const { id, f_name, l_name, email, phone, address } = req.body;

  // verify fields
  if ((!user_id || !f_name)) {
    return res.status(500).json({ message: "Enter all required fields" });
  }

  const customer_id = generate_customer_id();

  try {
    // if id is undefined CREATE
    if (!id) {
      const customerExists = await Customer.findOne({ customer_id });

      // if id already exist return error
      if (customerExists) {
        return res.status(500).json({ message: "Customer already exist" });
      }

      const customer = await Customer.create({
        customer_id,
        f_name,
        l_name,
        email,
        phone,
        address,
      });

      res.json({ message: "Customer Created Successfully", customer });
    }

    // else UPDATE
    else {
      // check if _id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if customer exist
      const customerExists = await Customer.findById(id);
      if (!customerExists) {
        return res.status(500).json({ message: "Customer does not exist" });
      }

      const customer = await Customer.findByIdAndUpdate(
        id,
        {
          f_name,
          l_name,
          email,
          phone,
          address,
        },
        { new: true }
      );

      res.json({ message: "Customer Updated Successfully", customer });
    }

    //? emit
    io.emit("Customer", customer_id);
  } catch (error) {
    console.log("Error in add_update_customer controller: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// add/update doctor
export const add_update_doctor = async (req, res) => {
  const { id, user, is_available, title } = req.body;

  // verify fields
  if (!user) {
    return res.status(500).json({ message: "Select a user" });
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const doctorExists = await Doctor.findOne({ user });

      // if id already exist return error
      if (doctorExists) {
        return res.status(500).json({ message: "Doctor already exist" });
      }

      const doctor = await Doctor.create({
        user,
        is_available,
        title,
      });

      const populatedDoctor = await doctor.populate([
        { path: "user" },
        { path: "my_patients.patient" },
        { path: "ong_patients" },
        { path: "pen_patients" },
      ]);

      res.json({ message: "Doctor Created Successfully", populatedDoctor });

      //? emit
      io.emit("Doctor", populatedDoctor);
    }

    // else UPDATE
    else {
      // check if _id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if user exist
      const userExists = await Doctor.findById(id);
      if (!userExists) {
        return res.status(500).json({ message: "Doctor does not exist" });
      }

      const doctor = await Doctor.findByIdAndUpdate(
        id,
        {
          is_available,
          title,
        },
        { new: true }
      );

      const populatedDoctor = await doctor.populate([
        { path: "user" },
        { path: "my_patients.patient" },
        { path: "ong_patients" },
        { path: "pen_patients" },
      ]);

      res.json({ message: "Doctor Updated", doctor: populatedDoctor });

      //? emit
      io.emit("Doctor", populatedDoctor);
    }
  } catch (error) {
    console.log("Error in add_update_doctor controller: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// update pen_patients
export const update_pen_patients = async (req, res) => {
  const { doctor, patient } = req.body;

  // verify fields
  if (!doctor) {
    return res.status(500).json({ message: "Select a doctor" });
  }

  try {
    // check if _id is valid
    if (!mongoose.Types.ObjectId.isValid(doctor)) {
      return res.status(500).json({ message: "ID not valid" });
    }

    // Check if user exist
    const userExists = await Doctor.findById(doctor);
    if (!userExists) {
      return res.status(500).json({ message: "Doctor does not exist" });
    }
    // check if patient.patient exist in pen patients array
    const patientExists = userExists.pen_patients.some(
      (p) => p.toString() === patient
    );
    if (patientExists) {
      return res.json({ message: "Patient already exist", doctor: "doc" });
    }

    const _doctor = await Doctor.findByIdAndUpdate(
      doctor,
      {
        $push: { pen_patients: patient },
      },
      { new: true }
    );

    const populatedDoctor = await _doctor.populate([
      { path: "user" },
      { path: "my_patients.patient" },
      { path: "ong_patients" },
      { path: "pen_patients" },
    ]);

    //? emit
    io.emit("Doctor", populatedDoctor);

    res.json({
      message: patientExists
        ? "Treatment duration Updated"
        : "Pending patients updated",
      doctor: populatedDoctor,
    });
  } catch (error) {
    console.log("Error in update_pen_patients controller: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// update ong_patients
export const update_ong_patients = async (req, res) => {
  const { doctor, patient } = req.body;
  // verify fields
  if (!doctor) {
    return res.status(500).json({ message: "Select a doctor" });
  }

  try {
    // check if _id is valid
    if (!mongoose.Types.ObjectId.isValid(doctor)) {
      return res.status(500).json({ message: "ID not valid" });
    }

    // Check if user exist
    const userExists = await Doctor.findById(doctor);
    if (!userExists) {
      return res.status(500).json({ message: "Doctor does not exist" });
    }
    // check if patient.patient exist in pen patients array
    const patientExists = userExists.ong_patients.some((p) => p === patient);
    if (patientExists) {
      return res.status(500).json({ message: "Patient already exist" });
    }

    const _doctor = await Doctor.findByIdAndUpdate(
      doctor,
      {
        $push: { ong_patients: patient },
      },
      { new: true }
    );

    const populatedDoctor = await _doctor.populate([
      { path: "user" },
      { path: "my_patients.patient" },
      { path: "ong_patients" },
      { path: "pen_patients" },
    ]);

    //? emit
    io.emit("Doctor", populatedDoctor);

    res.json({ message: "Ongoing patients updated", doctor: populatedDoctor });
  } catch (error) {
    console.log("Error in update_ong_patients controller: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// update my_patients
export const update_my_patients = async (req, res) => {
  const { doctor, patient } = req.body;
  // verify fields
  if (!doctor) {
    return res.status(500).json({ message: "Select a doctor" });
  }

  try {
    // check if _id is valid
    if (!mongoose.Types.ObjectId.isValid(doctor)) {
      return res.status(500).json({ message: "ID not valid" });
    }

    // Check if doctor exist
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(500).json({ message: "Doctor does not exist" });
    }

    // check if patient.patient exist in my patients array
    const patientExists = doctorExists.my_patients.some(
      (p) => p.patient.toString() === patient.patient.toString()
    );

    if (patientExists) {
      // increase patient session count
      const _doctor = await Doctor.findByIdAndUpdate(
        doctor,
        {
          $inc: { "my_patients.$[elem].session_count": 1 },
        },
        { new: true, arrayFilters: [{ "elem.patient": patient.patient }] }
      );

      const populatedDoctor = await _doctor.populate([
        { path: "user" },
        { path: "my_patients.patient" },
        { path: "ong_patients" },
        { path: "pen_patients" },
      ]);

      //? emit
      io.emit("Doctor", populatedDoctor);
      res.json({ message: "My patients updated", doctor: populatedDoctor });
    } else {
      const _doctor = await Doctor.findByIdAndUpdate(
        doctor,
        {
          $push: { my_patients: patient },
        },
        { new: true }
      );

      const populatedDoctor = await _doctor.populate([
        { path: "user" },
        { path: "my_patients.patient" },
        { path: "ong_patients" },
        { path: "pen_patients" },
      ]);

      //? emit
      io.emit("Doctor", populatedDoctor);
      res.json({ message: "My patients updated", doctor: populatedDoctor });
    }
  } catch (error) {
    console.log("Error in update_my_patients controller: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// remove patient from pen_patients
export const remove_pen_patients = async (req, res) => {
  const { doctor, patient } = req.body;

  // verify fields
  if (!doctor) {
    return res.status(500).json({ message: "Select a doctor" });
  }
  if (!patient) {
    return res.status(500).json({ message: "Select a patient" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(doctor)) {
    return res.status(500).json({ message: "ID not valid" });
  }
  // check if patient is valid
  if (!mongoose.Types.ObjectId.isValid(patient)) {
    return res.status(500).json({ message: "Patient ID not valid" });
  }

  try {
    // Check if user exist
    const userExists = await Doctor.findById(doctor);
    if (!userExists) {
      return res.status(500).json({ message: "Doctor does not exist" });
    }

    // remove patient from pen_patients
    const _doctor = await Doctor.findByIdAndUpdate(
      doctor,
      {
        $pull: { pen_patients: patient },
      },
      { new: true }
    );

    const populatedDoctor = await _doctor.populate([
      { path: "user" },
      { path: "my_patients.patient" },
      { path: "ong_patients" },
      { path: "pen_patients" },
    ]);

    //? emit
    io.emit("Doctor", populatedDoctor);

    res.json({ message: "Pending patients updated", doctor: populatedDoctor });
  } catch (error) {
    console.log("Error in remove_pen_patients: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// remove patient from ong_patients
export const remove_ong_patients = async (req, res) => {
  const { doctor, patient } = req.body;

  // verify fields
  if (!doctor) {
    return res.status(500).json({ message: "Select a doctor" });
  }
  if (!patient) {
    return res.status(500).json({ message: "Select a patient" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(doctor)) {
    return res.status(500).json({ message: "ID not valid" });
  }
  // check if patient is valid
  if (!mongoose.Types.ObjectId.isValid(patient)) {
    return res.status(500).json({ message: "Patient ID not valid" });
  }

  try {
    // Check if user exist
    const userExists = await Doctor.findById(doctor);
    if (!userExists) {
      return res.status(500).json({ message: "Doctor does not exist" });
    }

    // remove patient from pen_patients
    const _doctor = await Doctor.findByIdAndUpdate(
      doctor,
      {
        $pull: { ong_patients: patient },
      },
      { new: true }
    );

    const populatedDoctor = await _doctor.populate([
      { path: "user" },
      { path: "my_patients.patient" },
      { path: "ong_patients" },
      { path: "pen_patients" },
    ]);

    //? emit
    io.emit("Doctor", populatedDoctor);

    res.json({ message: "Ongoing patients updated", doctor: populatedDoctor });
  } catch (error) {
    console.log("Error in remove_ong_patients: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// add/update user
export const add_update_user = async (req, res) => {
  const {
    id,
    user_id,
    f_name,
    l_name,
    m_name,
    user_image,
    user_status,
    user_role,
    section,
    full_access,
    app_role,
    can_sign_in,
  } = req.body;

  // verify fields
  if (!user_id || !f_name || !l_name || !user_role || !section || !app_role) {
    return res.status(500).json({ message: "Enter all required fields" });
  }

  // verify app role
  if (
    app_role !== "Admin" &&
    app_role !== "CSU" &&
    app_role !== "Doctor" &&
    app_role !== "Management" &&
    app_role !== "Marketer" &&
    app_role !== "ICT" &&
    app_role !== "None"
  ) {
    return res.status(500).json({ message: "Invalid role" });
  }

  // verify section
  if (
    section !== "General Staff" &&
    section !== "Heritage Physiotherapy clinic" &&
    section !== "Heritage Fitness" &&
    section !== "Delightsome Juice & Smoothies"
  ) {
    return res.status(500).json({ message: "Invalid section" });
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const userExists = await User.findOne({ user_id });

      // if id already exist return error
      if (userExists) {
        return res.status(500).json({ message: "User ID not available" });
      }

      const user = await User.create({
        user_id,
        f_name,
        l_name,
        m_name,
        user_image,
        user_status,
        user_role,
        section,
        full_access,
        app_role,
        can_sign_in,
      });

      res.json({ message: "User Created Successfully", user });

      //? emit
      io.emit("User", user);
    }

    // else UPDATE
    else {
      // check if _id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if user exist
      const userExists = await User.findById(id);
      if (!userExists) {
        return res.status(500).json({ message: "User does not exist" });
      }

      const user = await User.findByIdAndUpdate(
        id,
        {
          user_id,
          f_name,
          l_name,
          m_name,
          user_image,
          user_status,
          user_role,
          section,
          full_access,
          app_role,
          can_sign_in,
        },
        { new: true }
      );

      user.password = undefined;

      res.json({ message: "User Updated Successfully", user });

      //? emit
      io.emit("User", user);
    }
  } catch (error) {
    console.log("Error in add_update_user controller: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? REMOVALS

// delete customer
export const delete_customer = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Customer ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Customer ID not valid" });
  }

  // Check if customer exist
  const customerExists = await Customer.findById(id);
  if (!customerExists) {
    return res.status(500).json({ message: "Customer does not exist" });
  }

  try {
    await Customer.findByIdAndDelete(id);

    //? emit
    io.emit("CustomerD");

    res.json({ message: "Customer deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_customer: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// delete doctor
export const delete_doctor = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Doctor ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Doctor ID not valid" });
  }

  // Check if doctor exist
  const doctorExists = await Doctor.findById(id);
  if (!doctorExists) {
    return res.status(500).json({ message: "Doctor does not exist" });
  }

  try {
    await Doctor.findByIdAndDelete(id);

    //? emit
    io.emit("DoctorD", id);

    res.json({ message: "Doctor deleted Sucessfully", id });
  } catch (error) {
    console.log("Error in delete_doctor: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// delete user
export const delete_user = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "User ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "User ID not valid" });
  }

  // Check if user exist
  const userExists = await User.findById(id);
  if (!userExists) {
    return res.status(500).json({ message: "User does not exist" });
  }

  try {
    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted Sucessfully", id });

    //? emit
    io.emit("UserD", id);
  } catch (error) {
    console.log("Error in delete_user: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? UTILS
// generate patient_id
export const generate_user_id = async (req, res) => {
  var all_ids = [];

  try {
    const users = await User.find({});

    for (let index = 0; index < users.length; index++) {
      const element = users[index];

      var id = parseInt(element.user_id.split("-")[1]);
      all_ids.push(id);
    }
  } catch (error) {
    console.log("Error in generate_user_id", error);
    return res.status(500).json({ message: "Failed to generate ID" });
  }

  var last_id = Math.max(...all_ids);
  last_id++;
  return res.json({ message: "ID Generated", user_id: last_id });
};
