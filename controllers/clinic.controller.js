import mongoose from "mongoose";
import AccessoryRequest from "../models/clinic.model/accessory_request.model.js";
import CaseFile from "../models/clinic.model/case_file.model.js";
import Equipement from "../models/clinic.model/equipment.model.js";
import Patient from "../models/clinic.model/patient.model.js";
import Accessory from "../models/sales.model/accessory.model.js";
import { generate_nano_id, getTimezoneOffset } from "../utils/utils.js";
import { io } from "../socket/socket.js";
import Equipment from "../models/clinic.model/equipment.model.js";
import Doctor from "../models/user.model/doctor.model.js";

// ? GETTERS

// get accessory requests
export const get_all_accessory_requests = async (req, res) => {
  try {
    const accessoryRequests = await AccessoryRequest.find({})
      .populate("patient")
      .populate("doctor")
      .populate("accessories.accessory");
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

// get case file by date
export const get_case_file_by_date = async (req, res) => {
  const { patient, treatment_date } = req.body;
  try {
    const caseFiles = await CaseFile.find({ patient, treatment_date })
      .populate("patient")
      .populate("doctor");
    res.json({ caseFiles });
  } catch (error) {
    console.log("Error in get_case_file_by_date controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get case file by id
export const get_case_file_by_id = async (req, res) => {
  const { patient, case_id } = req.body;
  // check patient
  if (!patient) {
    return res.status(500).json({ message: "No Patient" });
  }

  // check id
  if (!case_id) {
    return res.status(500).json({ message: "No Case ID" });
  }

  // check if patient is valid
  if (!mongoose.Types.ObjectId.isValid(patient)) {
    return res.status(500).json({ message: "Patient ID not valid" });
  }

  // check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(case_id)) {
    return res.status(500).json({ message: "Case ID not valid" });
  }

  try {
    const caseFile = await CaseFile.findById(case_id)
      .populate("patient")
      .populate("doctor");

    if (!caseFile) {
      return res.status(500).json({ message: "Case file not found" });
    }

    if (caseFile.patient._id.toString() != patient) {
      return res.status(500).json({ message: "Invalid Patient Verification" });
    }

    res.json({ caseFile });
  } catch (error) {
    console.log("Error in get_case_file_by_id controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get equipments
export const get_all_equipments = async (req, res) => {
  try {
    const equipments = await Equipement.find({});
    res.json({ equipments });
  } catch (error) {
    console.log("Error in get_all_equipments controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

//? get patients
export const get_all_patients = async (req, res) => {
  try {
    const patients = await Patient.find({})
      .populate("current_doctor")
      .populate("last_doctor")
      // .populate("current_doctor.user")
      .populate("assessment_info.equipment");

    // const patients = await patients_x. populate([
    //   { path: "current_doctor.user" },
    //   { path: "last_doctor.user" },
    // ]);

    res.json({ patients });
  } catch (error) {
    console.log("Error in get_all_patients controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get patient by id
export const get_patient_by_id = async (req, res) => {
  const { patient_key } = req.body;

  try {
    const patient = await Patient.findById(patient_key)
      .populate("current_doctor")
      .populate("last_doctor")
      .populate("assessment_info.equipment");
    res.json({ patient });
  } catch (error) {
    console.log("Error in get_patient_by_id controller:", error.message);
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

  try {
    // if id is undefined CREATE
    if (!id) {
      const request_id = generate_nano_id();

      const request = await AccessoryRequest.create({
        request_id,
        patient,
        doctor,
        accessories,
      });

      const populated_request = await request.populate([
        { path: "patient" },
        { path: "doctor" },
        { path: "accessories.accessory" },
      ]);

      res.json({
        message: "Accessory Request Sent",
        request: populated_request,
      });

      //? emit
      io.emit("AccessoryRequest", populated_request);
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

      const populated_request = await request.populate([
        { path: "patient" },
        { path: "doctor" },
        { path: "accessories.accessory" },
      ]);

      res.json({ message: "Request Updated", request: populated_request });

      //? emit
      io.emit("AccessoryRequest", populated_request);
    }
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
        treatment_date: getTimezoneOffset(treatment_date),
        start_time: getTimezoneOffset(start_time),
        // end_time: getTimezoneOffset(end_time),
        treatment_decision,
        refered_decision,
        other_decision,
      });

      // save casefile id to patient
      const patient_new = await Patient.findByIdAndUpdate(
        patient,
        {
          current_case_id: caseFile._id,
        },
        { new: true }
      );

      const populated_caseFile = await caseFile.populate([
        { path: "patient" },
        { path: "doctor" },
      ]);

      const populated_patient = await patient_new.populate([
        { path: "current_doctor" },
        { path: "last_doctor" },
        { path: "assessment_info.equipment" },
      ]);

      res.json({ message: "Case File Opened", caseFile: populated_caseFile });

      //? emit
      io.emit("CaseFile", populated_caseFile);
      io.emit("Patient", populated_patient);
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
          // case_type,
          // start_time: getTimezoneOffset(start_time),
          end_time: getTimezoneOffset(end_time),
          treatment_decision,
          refered_decision,
          other_decision,
        },
        { new: true }
      );

      // save casefile id to patient
      const patient_data = await Patient.findByIdAndUpdate(
        patient,
        {
          current_case_id: end_time ? null : caseFile._id,
        },
        { new: true }
      );

      const populated_caseFile = await caseFile.populate([
        { path: "patient" },
        { path: "doctor" },
      ]);

      const populated_patient = await patient_data.populate([
        { path: "current_doctor" },
        { path: "last_doctor" },
        { path: "assessment_info.equipment" },
      ]);

      res.json({ message: "Case File updated", caseFile: populated_caseFile });

      //? emit
      io.emit("CaseFile", populated_caseFile);
      io.emit("Patient", populated_patient);
    }
  } catch (error) {
    console.log("Error in add_update_case_file: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// add/update equipment
export const add_update_equipment = async (req, res) => {
  // get values from body
  const { id, equipmentName, category, costing, status } = req.body;

  // verify fields
  if (!equipmentName || !category) {
    return res.status(500).json({ message: "Invalid Entry" });
  }

  try {
    // if id is undefined CREATE
    if (!id) {
      const itemExists = await Equipment.findOne({ equipmentName });

      // if name already exist return error
      if (itemExists) {
        return res.status(500).json({ message: "Equipment already exist" });
      }

      const equipmentId = generate_nano_id();

      const equipment = await Equipment.create({
        equipmentName,
        equipmentId,
        category,
        costing,
        status,
      });

      res.json({ message: "Equipment Created Successfully", equipment });

      //? emit
      io.emit("Equipment", equipment);
    }

    // else UPDATE
    else {
      // check if id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if item exist
      const itemExists = await Equipment.findById(id);
      if (!itemExists) {
        return res.status(500).json({ message: "Equipment does not exist" });
      }

      const nameExists = await Equipment.findOne({ equipmentName });

      // if name already exist return error
      if (nameExists && nameExists._id != id) {
        return res.status(500).json({ message: "Equipment already exist" });
      }

      const equipment = await Equipment.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            equipmentName,
            category,
            costing,
            status,
          },
        },
        { new: true }
      );
      res.json({ message: "Equipment Updated Successfully", equipment });

      //? emit
      io.emit("Equipment", equipment);
    }
  } catch (error) {
    console.log("Error in add_update_equipment: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// add/update patient
export const add_update_patient = async (req, res) => {
  const {
    id,
    patient_id,
    reg_date,
    user_status,
    f_name,
    m_name,
    l_name,
    user_image,
    phone_1,
    phone_2,
    email,
    address,
    gender,
    dob,
    age,
    occupation,
    nature_of_work,
    hykau,
    hykau_others,
    hmo,
    hmo_id,
    sponsors,
    refferal_code,
  } = req.body;

  // verify fields
  if (!f_name || !gender || !patient_id) {
    return res.status(500).json({ message: "Enter all required fields" });
  }

  const patient_id_exists = await Patient.findOne({ patient_id });

  try {
    // if id is undefined CREATE
    if (!id) {
      if (patient_id_exists) {
        return res.status(500).json({ message: "Patient ID Exists" });
      }

      const patient = await Patient.create({
        patient_id,
        reg_date,
        user_status,
        f_name,
        m_name,
        l_name,
        user_image,
        phone_1,
        phone_2,
        email,
        address,
        gender,
        dob,
        age,
        occupation,
        nature_of_work,
        hykau,
        hykau_others,
        hmo,
        hmo_id,
        sponsors,
        refferal_code,
      });

      const populated_patient = await patient.populate([
        { path: "current_doctor" },
        { path: "last_doctor" },
        { path: "assessment_info.equipment" },
      ]);

      res.json({
        message: "Patient Created Successfully",
        patient: populated_patient,
      });

      //? emit
      io.emit("Patient", populated_patient);
    }

    // else UPDATE
    else {
      // check if _id is valid
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(500).json({ message: "ID not valid" });
      }

      // Check if patient exist
      const patientExists = await Patient.findById(id);
      if (!patientExists) {
        return res.status(500).json({ message: "Patient does not exist" });
      }

      if (patient_id_exists && patient_id != patient_id_exists.patient_id) {
        return res.status(500).json({ message: "Patient ID Exists" });
      }

      const patient = await Patient.findByIdAndUpdate(
        id,
        {
          patient_id,
          reg_date,
          user_status,
          f_name,
          m_name,
          l_name,
          user_image,
          phone_1,
          phone_2,
          email,
          address,
          gender,
          dob,
          age,
          occupation,
          nature_of_work,
          hykau,
          hykau_others,
          hmo,
          hmo_id,
          sponsors,
          refferal_code,
        },
        { new: true }
      );

      const populated_patient = await patient.populate([
        { path: "current_doctor" },
        { path: "last_doctor" },
        { path: "assessment_info.equipment" },
      ]);

      res.json({
        message: "Patient Updated Successfully",
        patient: populated_patient,
      });

      //? emit
      io.emit("Patient", populated_patient);
    }
  } catch (error) {
    console.log("Error in add_update_patient: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// complete base_line
export const complete_base_line = async (req, res) => {
  try {
    const { patient } = req.body;

    // check if _id is valid
    if (!mongoose.Types.ObjectId.isValid(patient)) {
      return res.status(500).json({ message: "ID not valid" });
    }

    // Check if patient exist
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(500).json({ message: "Patient does not exist" });
    }

    const patient_data = await Patient.findByIdAndUpdate(patient, {
      baseline_done: true,
    });

    const populated_patient = await patient_data.populate([
      { path: "current_doctor" },
      { path: "last_doctor" },
      { path: "assessment_info.equipment" },
    ]);

    res.json({
      message: "Baseline Completed Successfully",
      patient_data: populated_patient,
    });

    //? emit
    io.emit("Patient", populated_patient);
  } catch (error) {
    console.log("Error in complete_base_line: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// assign current doctor
export const assign_current_doctor = async (req, res) => {
  const { patient, doctor, sett } = req.body;

  // check patient
  if (!patient) {
    return res.status(500).json({ message: "Patient not found" });
  }

  // check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(patient)) {
    return res.status(500).json({ message: "Patient ID not valid" });
  }

  // Check if patient exist
  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    return res.status(500).json({ message: "Patient does not exist" });
  }

  // check doctor
  if (!doctor) {
    return res.status(500).json({ message: "Doctor not found" });
  }

  // check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(doctor)) {
    return res.status(500).json({ message: "Doctor ID not valid" });
  }

  // Check if doctor exist
  const doctorExists = await Doctor.findById(doctor);
  if (!doctorExists) {
    return res.status(500).json({ message: "Doctor does not exist" });
  }

  try {
    const patient_data = await Patient.findByIdAndUpdate(
      patient,
      {
        current_doctor: sett ? doctor : null,
        last_doctor: sett
          ? patientExists.last_doctor
          : patientExists.current_doctor,
      },
      { new: true }
    );
    if (!patient_data) {
      return res.status(500).json({ message: "Patient not found" });
    }

    const populated_patient = await patient_data.populate([
      { path: "current_doctor" },
      { path: "last_doctor" },
      { path: "assessment_info.equipment" },
    ]);

    res.json({
      message: "Current Doctor Assigned Successfully",
      patient_data: populated_patient,
    });

    //? emit
    io.emit("Patient", populated_patient);
  } catch (error) {
    console.log("Error in assign_current_doctor: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// update treatment_info
export const update_treatment_info = async (req, res) => {
  try {
    const { patient, treatment_info, update } = req.body;

    // check if _id is valid
    if (!mongoose.Types.ObjectId.isValid(patient)) {
      return res.status(500).json({ message: "Patient ID not valid" });
    }

    // Check if patient exist
    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(500).json({ message: "Patient does not exist" });
    }

    // verify treatment_info
    if (!treatment_info) {
      return res.status(500).json({ message: "Invalid Entry" });
    }

    if (update) {
      treatment_info.last_bp_p = patientExists.treatment_info?.last_bp ?? "";
      treatment_info.last_treatment_date_p =
        patientExists.treatment_info?.last_treatment_date;
    }

    treatment_info.last_treatment_date = getTimezoneOffset(
      treatment_info.last_treatment_date
    );

    // treatment_info.last_treatment_date_p = getTimezoneOffset(
    //   treatment_info.last_treatment_date_p
    // );

    treatment_info.assessment_date = getTimezoneOffset(
      treatment_info.assessment_date
    );

    const patient_data = await Patient.findByIdAndUpdate(
      patient,
      {
        treatment_info,
      },
      {
        new: true,
      }
    );

    const populated_patient = await patient_data.populate([
      { path: "current_doctor" },
      { path: "last_doctor" },
      { path: "assessment_info.equipment" },
    ]);

    res.json({
      message: "Treatment Info Updated Successfully",
      patient_data: populated_patient,
    });

    //? emit
    io.emit("Patient", populated_patient);
  } catch (error) {
    console.log("Error in update_treatment_info: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// update assessment_info
export const update_assessment_info = async (req, res) => {
  const {
    patient,
    case_select,
    case_select_others,
    case_description,
    diagnosis,
    case_type,
    treatment_type,
    assessment_date,
    equipment,
  } = req.body;

  if (!case_select) {
    return res.status(500).json({ message: "Select Case" });
  }

  // check patient
  if (!patient) {
    return res.status(500).json({ message: "Patient not found" });
  }

  // check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(patient)) {
    return res.status(500).json({ message: "Patient ID not valid" });
  }

  // Check if patient exist
  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    return res.status(500).json({ message: "Patient does not exist" });
  }

  const assessment_info = {
    case_select,
    case_select_others,
    case_description,
    diagnosis,
    case_type,
    treatment_type,
    assessment_date: getTimezoneOffset(assessment_date),
    // equipment,
  };

  try {
    const patient_data = await Patient.findByIdAndUpdate(
      patient,
      {
        $push: { assessment_info },
      },
      { new: true }
    );

    const populated_patient = await patient_data.populate([
      { path: "current_doctor" },
      { path: "last_doctor" },
      { path: "assessment_info.equipment" },
    ]);

    res.json({
      message: "Assessment Info Updated Successfully",
      patient_data: populated_patient,
    });
    //? emit
    io.emit("Patient", populated_patient);
  } catch (error) {
    console.log("Error in update_assessment_info: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// update clinic info
export const update_clinic_info = async (req, res) => {
  const {
    patient,
    total_session,
    frequency,
    completed_session,
    paid_session,
    cost_per_session,
    amount_paid,
    floating_amount,
  } = req.body;

  if (!patient) {
    return res.status(500).json({ message: "Patient not found" });
  }

  // check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(patient)) {
    return res.status(500).json({ message: "Patient ID not valid" });
  }

  // Check if patient exist
  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    return res.status(500).json({ message: "Patient does not exist" });
  }

  const clinic_info = {
    total_session,
    frequency,
    completed_session,
    paid_session,
    cost_per_session,
    amount_paid,
    floating_amount,
  };

  try {
    const patient_data = await Patient.findByIdAndUpdate(
      patient,
      {
        clinic_info,
      },
      { new: true }
    );

    const populated_patient = await patient_data.populate([
      { path: "current_doctor" },
      { path: "last_doctor" },
      { path: "assessment_info.equipment" },
    ]);

    res.json({
      message: "Clinic Info Updated Successfully",
      patient_data: populated_patient,
    });

    //? emit
    io.emit("Patient", populated_patient);
  } catch (error) {
    console.log("Error in update_clinic_info: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// update clinic variables
export const update_clinic_variables = async (req, res) => {
  const { patient, treatment_duration, start_time, case_type } = req.body;

  if (!patient) {
    return res.status(500).json({ message: "Patient not found" });
  }

  // check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(patient)) {
    return res.status(500).json({ message: "Patient ID not valid" });
  }

  // Check if patient exist
  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    return res.status(500).json({ message: "Patient does not exist" });
  }

  // clinic variables
  const clinic_variables = {
    treatment_duration,
    start_time: getTimezoneOffset(start_time),
    case_type,
  };

  try {
    const patient_data = await Patient.findByIdAndUpdate(
      patient,
      {
        clinic_variables,
      },
      { new: true }
    );

    const populated_patient = await patient_data.populate([
      { path: "current_doctor" },
      { path: "last_doctor" },
      { path: "assessment_info.equipment" },
    ]);

    res.json({
      message: "Clinic Variables Updated Successfully",
      patient_data: populated_patient,
    });

    //? emit
    io.emit("Patient", populated_patient);
  } catch (error) {
    console.log("Error in update_clinic_variables: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// update clinic history
export const update_clinic_history = async (req, res) => {
  const { patient, clinic_history } = req.body;
  if (!patient) {
    return res.status(500).json({ message: "Patient not found" });
  }

  // check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(patient)) {
    return res.status(500).json({ message: "Patient ID not valid" });
  }

  // Check if patient exist
  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    return res.status(500).json({ message: "Patient does not exist" });
  }

  clinic_history.date = getTimezoneOffset(clinic_history.date);

  try {
    const patient_data = await Patient.findByIdAndUpdate(
      patient,
      {
        $push: { clinic_history },
        $inc: {
          total_amount_paid:
            clinic_history.hist_type != "Session setup" &&
            clinic_history.hist_type != "Session added"
              ? clinic_history.amount
              : 0,
        },
      },
      { new: true }
    );

    const populated_patient = await patient_data.populate([
      { path: "current_doctor" },
      { path: "last_doctor" },
      { path: "assessment_info.equipment" },
    ]);

    res.json({
      message: "Clinic History Updated Successfully",
      patient_data: populated_patient,
    });

    //? emit
    io.emit("Patient", populated_patient);
  } catch (error) {
    console.log("Error in update_clinic_history: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// update clinic invoice
export const update_clinic_invoice = async (req, res) => {
  const { patient, clinic_invoice } = req.body;

  if (!patient) {
    return res.status(500).json({ message: "Patient not found" });
  }

  // check if _id is valid
  if (!mongoose.Types.ObjectId.isValid(patient)) {
    return res.status(500).json({ message: "Patient ID not valid" });
  }

  // Check if patient exist
  const patientExists = await Patient.findById(patient);
  if (!patientExists) {
    return res.status(500).json({ message: "Patient does not exist" });
  }

  clinic_invoice.date = getTimezoneOffset(clinic_invoice.date);

  try {
    const patient_data = await Patient.findByIdAndUpdate(
      patient,
      {
        $push: { clinic_invoice },
      },
      { new: true }
    );

    const populated_patient = await patient_data.populate([
      { path: "current_doctor" },
      { path: "last_doctor" },
      { path: "assessment_info.equipment" },
    ]);

    res.json({
      message: "Clinic Invoice Updated Successfully",
      patient_data: populated_patient,
    });

    //? emit
    io.emit("Patient", populated_patient);
  } catch (error) {
    console.log("Error in update_clinic_invoice: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

//

// ? REMOVALS

// delete accessory request
export const delete_accessory_request = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Request ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Request ID not valid" });
  }

  // Check if request exist
  const requestExists = await AccessoryRequest.findById(id);
  if (!requestExists) {
    return res.status(500).json({ message: "Request does not exist" });
  }

  try {
    await AccessoryRequest.findByIdAndDelete(id);

    //? emit
    io.emit("AccessoryRequestD", id);

    res.json({ message: "Request deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_accessory_request: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// clear all accessory request
export const delete_all_accessory_request = async (req, res) => {
  try {
    await AccessoryRequest.deleteMany({});

    //? emit
    io.emit("AccessoryRequestDA");

    res.json({ message: "Request list cleared" });
  } catch (error) {
    console.log("Error in delete_all_accessory_request: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// delete case file
export const delete_case_file = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Case ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Case ID not valid" });
  }

  // Check if case exist
  const caseExists = await CaseFile.findById(id);
  if (!caseExists) {
    return res.status(500).json({ message: "Case does not exist" });
  }

  try {
    await CaseFile.findByIdAndDelete(id);

    //? emit
    io.emit("CaseFile");

    res.json({ message: "Case deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_case_file: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// delete equipment
export const delete_equipment = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Equipment ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Equipment ID not valid" });
  }

  // Check if equipment exist
  const equipmentExists = await Equipement.findById(id);
  if (!equipmentExists) {
    return res.status(500).json({ message: "Equipment does not exist" });
  }

  try {
    await Equipement.findByIdAndDelete(id);

    //? emit
    io.emit("EquipmentD", id);

    res.json({ message: "Equipment deleted Sucessfully" });
  } catch (error) {
    console.log("Error in delete_equipment: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// delete patient
export const delete_patient = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(500).json({ message: "Patient ID required" });
  }

  // check if id is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(500).json({ message: "Patient ID not valid" });
  }

  // Check if patient exist
  const patientExists = await Patient.findById(id);
  if (!patientExists) {
    return res.status(500).json({ message: "Patient does not exist" });
  }

  try {
    await Patient.findByIdAndDelete(id);
    res.status(200).json({ message: "Patient deleted Sucessfully", id });

    //? emit
    io.emit("PatientD", id);
  } catch (error) {
    console.log("Error in delete_patient: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// ? UTILS

// generate patient_id
export const generate_patient_id = async (req, res) => {
  var all_ids = [];

  try {
    const patients = await Patient.find({});

    for (let index = 0; index < patients.length; index++) {
      const element = patients[index];

      var id = parseInt(element.patient_id.split("-")[1]);
      all_ids.push(id);
    }
  } catch (error) {
    console.log("Error in generate_patient_id", error);
    return res.status(500).json({ message: "Failed to generate ID" });
  }

  var new_id = 0;

  if (all_ids.length > 0) {
    new_id = Math.max(...all_ids);
  }

  new_id++;
  return res.json({
    message: "ID Generated",
    patient_id: new_id,
  });
};
