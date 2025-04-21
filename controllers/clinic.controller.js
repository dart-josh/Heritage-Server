import mongoose from "mongoose";
import AccessoryRequest from "../models/clinic.model/accessory_request.model.js";
import CaseFile from "../models/clinic.model/case_file.model.js";
import Equipement from "../models/clinic.model/equipment.model.js";
import Patient from "../models/clinic.model/patient.model.js";
import Accessory from "../models/sales.model/accessory.model.js";
import { generate_nano_id } from "../utils/utils.js";
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

// get case file by date
export const get_case_file_by_date = async (req, res) => {
  const { patient, treatment_date } = req.body;
  try {
    const caseFiles = await CaseFile.find({ patient, treatment_date })
      .populate("patient")
      .populate("doctor");
    res.json({ caseFiles });
  } catch (error) {
    console.log("Error in get_case_file_by_patient controller:", error.message);
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

// get patients
export const get_all_patients = async (req, res) => {
  try {
    const patients = await Patient.find({})
      .populate("current_doctor")
      .populate("last_doctor")
      .populate("assessment_info.equipment");
    res.json({ patients });
  } catch (error) {
    console.log("Error in get_all_patients controller:", error.message);
    return res.status(500).send({ message: "Internal Server error" });
  }
};

// get patient by id
export const get_patient_by_id = async (req, res) => {
  const { patient_id } = req.body;

  try {
    const patients = await Patient.find({ patient_id })
      .populate("current_doctor")
      .populate("last_doctor")
      .populate("assessment_info.equipment");
    res.json({ patients });
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
    sponsor,
    refferal_code,
  } = req.body;

  // verify fields
  if (!f_name || !gender) {
    return res.status(500).json({ message: "Enter all required fields" });
  }

  const patient_id_exists = await Patient.findOne({patient_id});

  try {
    // if id is undefined CREATE
    if (!id) {
      if (patient_id_exists) {
        return res.status(500).json({message: "Patient ID Exists"});
      }

      const patient = await Patient.create({
        patient_id,
        reg_date,
        user_status,
        f_name,
        m_name,
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
        sponsor,
        refferal_code,
      });

      res.json({ message: "Patient Created Successfully", patient });

      //? emit
      io.emit("Patient", patient);
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
        return res.status(500).json({message: "Patient ID Exists"});
      }

      const patient = await Patient.findByIdAndUpdate(
        id,
        {
          patient_id,
          reg_date,
          user_status,
          f_name,
          m_name,
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
          sponsor,
          refferal_code,
        },
        { new: true }
      );

      //? emit
      io.emit("Patient", patient);

      res.json({ message: "Patient Updated Successfully", patient });
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

    res.json({ message: "Baseline Completed Successfully", patient_data });

    //? emit
    io.emit("Patient", patient_data);
  } catch (error) {
    console.log("Error in complete_base_line: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// assign current doctor
export const assign_current_doctor = async (req, res) => {
  const { patient, doctor } = req.body;

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
    const patient_data = await Patient.findByIdAndUpdate(patient, {
      current_doctor: doctor,
      last_doctor: patientExists.current_doctor,
    });
    if (!patient_data) {
      return res.status(500).json({ message: "Patient not found" });
    }

    res.json({ message: "Current Doctor Assigned Successfully", patient_data });

    //? emit
    io.emit("Patient", patient_data);
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
    const { patient, treatment_info } = req.body;

    // treatment_info = last_bp, current_treatment_date, treatment_elapse

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

    if (treatment_info.current_treatment_date) {
      treatment_info.last_bp_p = patientExists.treatment_info.last_bp;
      treatment_info.last_treatment_date_p =
        patientExists.treatment_info.last_treatment_date;
      treatment_info.last_treatment_date =
        patientExists.treatment_info.current_treatment_date;
    }

    const patient_data = await Patient.findByIdAndUpdate(patient, {
      treatment_info,
    });

    res.json({ message: "Treatment Info Updated Successfully", patient_data });

    //? emit
    io.emit("Patient", patient_data);
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
    equipment,
  };

  try {
    const patient_data = await Patient.findByIdAndUpdate(patient, {
      $push: { assessment_info },
    });

    res.json({ message: "Assessment Info Updated Successfully", patient_data });

    //? emit
    io.emit("Patient", patient_data);
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
    const patient_data = await Patient.findByIdAndUpdate(patient, {
      clinic_info,
    });

    res.json({ message: "Clinic Info Updated Successfully", patient_data });

    //? emit
    io.emit("Patient", patient_data);
  } catch (error) {
    console.log("Error in update_clinic_info: ", error.message);
    res
      .status(500)
      .json({ message: "Internal Server error", error: error.message });
  }
};

// update clinic variables
export const update_clinic_variables = async (req, res) => {
  const { patient, can_treat, treatment_duration, start_time, end_time } =
    req.body;

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
    can_treat,
    treatment_duration,
    start_time,
    end_time,
  };

  try {
    const patient_data = await Patient.findByIdAndUpdate(patient, {
      clinic_variables,
    });

    res.json({
      message: "Clinic Variables Updated Successfully",
      patient_data,
    });

    //? emit
    io.emit("clinic_variables", patient_data);
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

  // clinic_history = hist_type, amount, amount_b4_discount, date, session_paid, cost_p_session, old_float, new_float, session_frequency

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

  try {
    const patient_data = await Patient.findByIdAndUpdate(patient, {
      $push: { clinic_history },
    });

    res.json({ message: "Clinic History Updated Successfully", patient_data });

    //? emit
    io.emit("Patient", patient_data);
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

  try {
    const patient_data = await Patient.findByIdAndUpdate(patient, {
      $push: { clinic_invoice },
    });

    res.json({ message: "Clinic Invoice Updated Successfully", patient_data });
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
    io.emit("AccessoryRequest");

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
    io.emit("AccessoryRequest");

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

// send patient to clinic
export const send_patient_to_clinic = async (req, res) => {
  const { patient } = req.params;
};

// generate patient_id
export const generate_patient_id = async (req, res) => {
   var all_ids = [];

  try {
    const patients = await Patient.find({});

    for (let index = 0; index < patients.length; index++) {
      const element = patients[index];
      
      var id = parseInt(element.patient_id.split('-')[1]);
      all_ids.push(id);
    }
  } catch (error) {
    console.log('Error in generate_patient_id', error);
    return res.status(500).json({message: 'Failed to generate ID'});
  }
  console.log(all_ids);
  var last_id = Math.max(...all_ids);
  last_id++;
  return res.json({message: "ID Generated", patient_id: last_id});
}
