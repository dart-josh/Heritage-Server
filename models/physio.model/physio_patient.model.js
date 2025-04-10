import mongoose from "mongoose";

const treatmentInfoSchema = new mongoose.Schema({
  last_bp: String,
  last_bp_p: String,
  last_treatment_date: Date,
  last_treatment_date_p: Date,
  current_treatment_date: Date,
  treatment_elapse: Boolean,
});

const physioPatientSchema = new mongoose.Schema({
  patient_id: { type: String, required: true, unique: true },
  reg_date: { type: String },
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
  dob: { type: String },
  age: { type: String },
  occupation: { type: String },
  nature_of_work: { type: String },
  hykau: { type: String },
  hykau_others: { type: String },
  hmo: { type: String },
  baseline_done: { type: Boolean },
  sponsor: [
    {
      sponsor_name: { type: String },
      sponsor_phone: { type: String },
      sponsor_addr: { type: String },
      sponsor_role: { type: String },
    },
  ],
  refferal_code: { type: String },
  current_doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  last_doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  treatment_info: {
    type: Map,
    of: { type: treatmentInfoSchema },
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
    },
  ],
  clinic_history: [
    {
      history_id: { type: String, required: true },
      hist_type: {
        type: String,
        required: true,
        enum: ["assessment payment", "session payment", "session setup"],
      },
      amount: { type: Number},
      amount_b4_discount: { type: Number},
      date: { type: Date, required: true },
      session_paid: { type: Number},
      cost_p_session: { type: Number},
      old_float: { type: Number},
      new_float: { type: Number},
      session_frequency: { type: String },
    },
  ],
});

const PhysioPatient = mongoose.model("PhysioPatient", physioPatientSchema);

export default PhysioPatient;
