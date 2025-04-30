import express from "express";
import {
  add_update_accessory_request,
  add_update_case_file,
  add_update_equipment,
  add_update_patient,
  assign_current_doctor,
  complete_base_line,
  delete_accessory_request,
  delete_all_accessory_request,
  delete_case_file,
  delete_equipment,
  delete_patient,
  generate_patient_id,
  get_all_accessory_requests,
  get_all_case_files,
  get_all_equipments,
  get_all_patients,
  get_case_file_by_id,
  get_case_file_by_patient,
  get_case_file_by_date,
  get_patient_by_id,
  update_assessment_info,
  update_clinic_history,
  update_clinic_info,
  update_treatment_info,
  update_clinic_variables,
} from "../controllers/clinic.controller.js";

const router = express.Router();

router.get("/get_all_accessory_requests", get_all_accessory_requests);
router.get("/get_all_case_files", get_all_case_files);
router.post("/get_case_file_by_patient", get_case_file_by_patient);
router.post("/get_case_file_by_date", get_case_file_by_date);
router.post('/get_case_file_by_id', get_case_file_by_id);
router.get("/get_all_equipments", get_all_equipments);
router.get("/get_all_patients", get_all_patients);
router.post("/get_patient_by_id", get_patient_by_id);

router.post("/add_update_accessory_request", add_update_accessory_request);
router.post("/add_update_case_file", add_update_case_file);
router.post("/add_update_equipment", add_update_equipment);
router.post("/add_update_patient", add_update_patient);
router.post("/complete_base_line", complete_base_line);
router.post("/assign_current_doctor", assign_current_doctor);
router.post("/update_treatment_info", update_treatment_info);
router.post("/update_clinic_variables", update_clinic_variables);
router.post("/update_assessment_info", update_assessment_info);
router.post("/update_clinic_info", update_clinic_info);
router.post("/update_clinic_history", update_clinic_history);

router.delete("/delete_accessory_request/:id", delete_accessory_request);
router.delete("/delete_all_accessory_request", delete_all_accessory_request);
router.delete("/delete_case_file/:id", delete_case_file);
router.delete("/delete_equipment/:id", delete_equipment);
router.delete("/delete_patient/:id", delete_patient);

router.post("/generate_patient_id", generate_patient_id);

export default router;
