import mongoose from "mongoose";
import AccessoryRequest from "../models/physio.model/accessory_request.model.js";
import CaseFile from "../models/physio.model/case_file.model.js";
import Equipement from "../models/physio.model/equipment.model.js";
import PhysioPatient from "../models/physio.model/physio_patient.model.js";
import Accessory from "../models/sales.model/accessory.model.js";
import { generate_nano_id } from "../utils/utils.js";
import { io } from "../socket/socket.js";

// ? GETTERS

// get accessory requests
export const get_all_accessory_requests = async (req, res) => {
  try {
    const accessoryRequests = await AccessoryRequest.find({})
      .populate("patient")
      .populate("doctor")
      .populate("accessories.acccossory");
    res.json({ accessoryRequests });
  } catch (error) {
    console.log(
      "Error in get_all_accessory_requests controller:",
      error.message
    );
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get all case files
export const get_all_case_files = async (req, res) => {
  try {
    const caseFiles = await CaseFile.find({})
      .populate("patient")
      .populate("doctor");
    res.json({ caseFiles });
  } catch (error) {
    console.log("Error in get_all_case_files controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get case file by patient
export const get_case_file_by_patient = async (req, res) => {
  const { patient } = req.body;
  try {
    const caseFiles = await CaseFile.find({ patient })
      .populate("patient")
      .populate("doctor");
    res.json({ caseFiles });
  } catch (error) {
    console.log("Error in get_case_file_by_patient controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get case file by id
export const get_case_file_by_id = async (req, res) => {
  const { id } = req.body;
  try {
    const caseFiles = await CaseFile.findById(id)
      .populate("patient")
      .populate("doctor");
    res.json({ caseFiles });
  } catch (error) {
    console.log("Error in get_case_file_by_patient controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get equipements
export const get_all_equipements = async (req, res) => {
  try {
    const equipements = await Equipement.find({});
    res.json({ equipements });
  } catch (error) {
    console.log("Error in get_all_equipements controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get physio_patients
export const get_all_physio_patients = async (req, res) => {
  try {
    const physio_patients = await PhysioPatient.find({})
      .populate("current_doctor")
      .populate("last_doctor")
      .populate("assessment_info.equipment");
    res.json({ physio_patients });
  } catch (error) {
    console.log("Error in get_all_physio_patients controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get physio patient by id
export const get_physio_patient_by_id = async (req, res) => {
  const { patient_id } = req.body;

  try {
    const physio_patients = await PhysioPatient.find({ patient_id })
      .populate("current_doctor")
      .populate("last_doctor")
      .populate("assessment_info.equipment");
    res.json({ physio_patients });
  } catch (error) {
    console.log("Error in get_physio_patient_by_id controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// ? STREAMSETS

// ? SETTERS

// add/update accessory request
export const add_update_accessory_request = async (req, res) => {
  const { id, patient, doctor, accessories } = req.body;

  // verify fields
  if (!accessories || accessories.length < 1) {
    return res.status(500).json({ message: "No accessory added" });
  }

  // verify accessory
  for (let i = 0; i < accessories.length; i++) {
    if (!accessories[i].accessory || !accessories[i].qty) {
      return res.status(500).json({ message: "Invalid Accessory Entry" });
    }

    // check if id is valid
    if (!mongoose.Types.ObjectId.isValid(accessories[i].accessory)) {
      return res.status(500).json({ message: "Invalid Accessory found" });
    }

    // Check if accessory exist
    const accessoryExists = await Accessory.findById(accessories[i].accessory);
    if (!accessoryExists) {
      return res.status(500).json({ message: "Invalid Accessory Entry" });
    }
  }

  const request_id = generate_nano_id();

  try {
    // if id is undefined CREATE
    if (!id) {
      const request = await AccessoryRequest.create({
        request_id,
        patient,
        doctor,
        accessories,
      });

      res.json({ message: "Accessory Request Sent", request });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if request exist
      const requestExists = await AccessoryRequest.findById(id);
      if (!requestExists) {
        return res.status(500).json({ message: "Request does not exist" });
      }

      const request = await AccessoryRequest.findByIdAndUpdate(
        id,
        {
          patient,
          doctor,
          accessories,
        },
        { new: true }
      );

      res.json({ message: "Request Updated", request });
    }

    //? emit
    io.emit("AccessoryRequest");
  } catch (error) {
    console.log("Error in add_update_accessory_request: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// add/update case file
export const add_update_case_file = async (req, res) => {
  const {
    id,
    patient,
    doctor,
    bp_reading,
    note,
    remarks,
    case_type,
    treatment_date,
    start_time,
    end_time,
    treatment_decision,
    refered_decision,
    other_decision,
  } = req.body;

  // verify fields
  if (!patient || !doctor || !treatment_date || !case_type) {
    return res.status(500).json({ message: "Invalid File Entry" });
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const caseFile = await CaseFile.create({
        patient,
        doctor,
        bp_reading,
        note,
        remarks,
        case_type,
        treatment_date,
        start_time,
        end_time,
        treatment_decision,
        refered_decision,
        other_decision,
      });

      res.json({ message: "Case File Opened", caseFile });
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if caseFile exist
      const caseFileExists = await CaseFile.findById(id);
      if (!caseFileExists) {
        return res.status(500).json({ message: "Case does not exist" });
      }

      const caseFile = await CaseFile.findByIdAndUpdate(
        id,
        {
          bp_reading,
          note,
          remarks,
          case_type,
          start_time,
          end_time,
          treatment_decision,
          refered_decision,
          other_decision,
        },
        { new: true }
      );

      io.emit("CaseFileID", id);
      res.json({ message: "Case File updated", caseFile });
    }

    //? emit
    io.emit("CaseFile");
    io.emit("CaseFilePatient", patient);
  } catch (error) {
    console.log("Error in add_update_case_file: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// add/update equipment

// add/update physio patient

// ? REMOVALS

// ? UTILS
