import mongoose from "mongoose";

const treatmentInfoSchema = new mongoose.Schema({
  last_bp: { type: String },
  last_bp_p: { type: String },
  last_treatment_date: { type: Date, default: null },
  last_treatment_date_p: { type: Date, default: null },
  current_treatment_date: { type: Date, default: null },
  assessment_completed: { type: Boolean },
  assessment_date: { type: Date, default: null },
  assessment_paid: { type: Boolean },
  skip_assessment: { type: Boolean },
});

const clinicInfoSchema = new mongoose.Schema({
  total_session: { type: Number },
  frequency: { type: String },
  completed_session: { type: Number },
  paid_session: { type: Number },
  cost_per_session: { type: Number },
  amount_paid: { type: Number },
  floating_amount: { type: Number },
});

const cliniVariablesSchema = new mongoose.Schema({
  case_type: { type: String, default: null },
  treatment_duration: { type: String, default: null },
  start_time: { type: Date, default: null },
});

const patientSchema = new mongoose.Schema({
  patient_id: { type: String, required: true, unique: true },
  reg_date: { type: Date },
  user_status: { type: Boolean, default: true },
  f_name: { type: String, required: true },
  m_name: { type: String },
  l_name: { type: String },
  user_image: { type: String },
  phone_1: { type: String },
  phone_2: { type: String },
  email: { type: String },
  address: { type: String },
  gender: { type: String },
  marrital_status: { type: String },
  religion: { type: String },
  dob: { type: String },
  age: { type: String },
  occupation: { type: String },
  nature_of_work: { type: String },
  hykau: { type: String },
  hykau_others: { type: String },
  hmo: { type: String },
  hmo_id: { type: String },
  baseline_done: { type: Boolean, default: false },
  sponsors: [
    {
      name: { type: String, required: true },
      phone: { type: String },
      address: { type: String },
      role: { type: String },
    },
  ],
  refferal_code: { type: String },
  current_doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    default: null,
  },
  last_doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    default: null,
  },
  treatment_info: {
    type: treatmentInfoSchema,
  },
  clinic_info: {
    type: clinicInfoSchema,
  },
  clinic_variables: {
    type: cliniVariablesSchema,
  },
  assessment_info: [
    {
      case_select: { type: String, required: true },
      case_select_others: { type: String },
      case_description: { type: String },
      diagnosis: { type: String },
      case_type: { type: String },
      treatment_type: { type: String },
      equipment: [{ type: mongoose.Schema.Types.ObjectId, ref: "Equipment" }],
      assessment_date: { type: Date },
    },
  ],
  clinic_history: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  ],
  clinic_invoice: [
    {
      invoice_id: { type: String, required: true },
      invoice_type: { type: String, required: true },
      amount: { type: Number },
      discount: { type: Number },
      date: { type: Date, required: true },
      total_session: { type: Number },
      frequency: { type: String },
      completed_session: { type: Number },
      paid_session: { type: Number },
      cost_per_session: { type: Number },
      amount_paid: { type: Number },
      floating_amount: { type: Number },
    },
  ],
  total_amount_paid: { type: Number },
  current_case_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CaseFile",
    default: null,
  },
});

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
