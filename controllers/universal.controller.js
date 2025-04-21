import Patient from "../models/clinic.model/patient.model.js";
import Health from "../models/universal.model/health.model.js";
import { io } from "../socket/socket.js";
import mongoose from "mongoose";

//? GETTERS

// get health data by patient id
export const get_health_by_patient_id = async (req, res) => {
  const { patient } = req.body;

  if (!patient) {
    return res.status(500).json({ message: "Patient ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(patient)) {
    return res.status(500).json({ message: "Patient ID not valid" });
  }

  // Check if patient exists
  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    return res.status(500).json({ message: "Patient not found" });
  }

  // fetch health data
  const healthData = await Health.find({ patient })
    .populate("patient")
    .populate("doctor")
    .populate("user");
  if (!healthData) {
    return res.status(500).json({ message: "Health data not found" });
  }

  res.json({ message: "Health Data Fetched Successfully", healthData });
};

//? SETTERS

// add / update health data by patient id
export const add_update_health = async (req, res) => {
  const { id, patient, doctor, user } = req.body;

  const {
    height,
    weight,
    ideal_weight,
    fat_rate,
    weight_gap,
    weight_target,
    waist,
    arm,
    chest,
    thighs,
    hips,
    pulse_rate,
    blood_pressure,

    chl_ov,
    chl_nv,
    chl_rm,
    hdl_ov,
    hdl_nv,
    hdl_rm,
    ldl_ov,
    ldl_nv,
    ldl_rm,
    trg_ov,
    trg_nv,
    trg_rm,
    blood_sugar,
    eh_finding,
    eh_recommend,
    sh_finding,
    sh_recommend,
    ah_finding,
    ah_recommend,
    other_finding,
    other_recommend,
    ft_obj_1,
    ft_obj_2,
    ft_obj_3,
    ft_obj_4,
    ft_obj_5,

    data_type,
    date,
    done,
    note,
    doctor_note,
  } = req.body;

  if (!patient) {
    return res.status(500).json({ message: "Patient ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(patient)) {
    return res.status(500).json({ message: "Patient ID not valid" });
  }

  // Check if patient exists
  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    return res.status(500).json({ message: "Patient not found" });
  }

  try {
    // check if health data exists
    const healthExists = await Health.findById(id);
    if (healthExists) {
      // update health data
      const updatedHealth = await Health.findByIdAndUpdate(
        id,
        {
          height,
          weight,
          ideal_weight,
          fat_rate,
          weight_gap,
          weight_target,
          waist,
          arm,
          chest,
          thighs,
          hips,
          pulse_rate,
          blood_pressure,

          chl_ov,
          chl_nv,
          chl_rm,
          hdl_ov,
          hdl_nv,
          hdl_rm,
          ldl_ov,
          ldl_nv,
          ldl_rm,
          trg_ov,
          trg_nv,
          trg_rm,
          blood_sugar,
          eh_finding,
          eh_recommend,
          sh_finding,
          sh_recommend,
          ah_finding,
          ah_recommend,
          other_finding,
          other_recommend,
          ft_obj_1,
          ft_obj_2,
          ft_obj_3,
          ft_obj_4,
          ft_obj_5,

          data_type,
          date,
          done,
          note,
          doctor_note,
        },
        {
          new: true,
        }
      );
      res.json({ message: "Health Data Updated Successfully", updatedHealth });

      //? emit event to socket
      io.emit("health_data", {
        action: "update",
        data: { updatedHealth },
      });
    } else {
      // create new health data
      const newHealth = await Health.create({
        height,
        weight,
        ideal_weight,
        fat_rate,
        weight_gap,
        weight_target,
        waist,
        arm,
        chest,
        thighs,
        hips,
        pulse_rate,
        blood_pressure,

        chl_ov,
        chl_nv,
        chl_rm,
        hdl_ov,
        hdl_nv,
        hdl_rm,
        ldl_ov,
        ldl_nv,
        ldl_rm,
        trg_ov,
        trg_nv,
        trg_rm,
        blood_sugar,
        eh_finding,
        eh_recommend,
        sh_finding,
        sh_recommend,
        ah_finding,
        ah_recommend,
        other_finding,
        other_recommend,
        ft_obj_1,
        ft_obj_2,
        ft_obj_3,
        ft_obj_4,
        ft_obj_5,

        data_type,
        date,
        done,
        note,
        doctor_note,
        patient,
        doctor,
        user,
      });
      res.json({ message: "Health Data Created Successfully", newHealth });

      //? emit event to socket
      io.emit("health_data", {
        action: "add",
        data: { newHealth },
      });
    }
  } catch (error) {
    console.log("Error in add_update_health: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// finish health data by patient id
export const finish_health = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Health ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Health ID not valid" });
  }

  // Check if health data exists
  const healthExists = await Health.findById(id);
  if (!healthExists) {
    return res.status(500).json({ message: "Health data not found" });
  }

  try {
    // update health data
    const updatedHealth = await Health.findByIdAndUpdate(
      id,
      {
        done: true,
      },
      {
        new: true,
      }
    );
    res.json({ message: "Health Data Finished Successfully", updatedHealth });

    //? emit event to socket
    io.emit("health_data", {
      action: "finish",
      data: { updatedHealth },
    });
  } catch (error) {
    console.log("Error in finish_health: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//? REMOVALS

// delete health data by id
export const delete_health_data = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Health ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Health ID not valid" });
  }

  // Check if health data exists
  const healthExists = await Health.findById(id);
  if (!healthExists) {
    return res.status(500).json({ message: "Health data not found" });
  }

  try {
    await Health.findByIdAndDelete(id);

    //? emit event to socket
    io.emit("health_data", {
      action: "delete",
      data: { id },
    });

    res.json({ message: "Health Data Deleted Successfully" });
  } catch (error) {
    console.log("Error in delete_health_data: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// delete all health data by patient id
export const delete_all_health_data = async (req, res) => {
  const { patient } = req.params;

  if (!patient) {
    return res.status(500).json({ message: "Patient ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(patient)) {
    return res.status(500).json({ message: "Patient ID not valid" });
  }

  // Check if patient exists
  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    return res.status(500).json({ message: "Patient not found" });
  }

  try {
    await Health.deleteMany({ patient });

    //? emit event to socket
    io.emit("health_data", {
      action: "delete_all",
      data: { patient },
    });

    res.json({ message: "All Health Data Deleted Successfully" });
  } catch (error) {
    console.log("Error in delete_all_health_data: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};
