import mongoose from "mongoose";

const client_detailsSchema = new mongoose.Schema(
  {
    f_name: { type: String },
    m_name: { type: String },
    l_name: { type: String },
  },
  {
    _id: false, // IMPORTANT: prevents auto _id for each history entry
  }
);

const contact_detailsSchema = new mongoose.Schema(
  {
    phone_1: { type: String },
    phone_2: { type: String },
    email: { type: String },
    address: { type: String },
    ig_user: { type: String },
    fb_user: { type: String },
  },
  {
    _id: false, // IMPORTANT: prevents auto _id for each history entry
  }
);

const personal_detailsSchema = new mongoose.Schema(
  {
    gender: { type: String },
    dob: { type: String },
    show_age: { type: Boolean },
    occupation: { type: String },
  },
  {
    _id: false, // IMPORTANT: prevents auto _id for each history entry
  }
);

const sub_detailsSchema = new mongoose.Schema(
  {
    sub_type: { type: String },
    sub_plan: { type: String },
    sub_status: { type: Boolean },
    sub_date: { type: String },
    pt_plan: { type: String },
    pt_status: { type: Boolean },
    pt_date: { type: String },
    boxing: { type: Boolean },
    bx_date: { type: String },
    sub_paused: { type: Boolean },
    paused_date: { type: String },
  },
  {
    _id: false, // IMPORTANT: prevents auto _id for each history entry
  }
);

const program_detailsSchema = new mongoose.Schema(
  {
    program_type_select: { type: String },
    corporate_type_select: { type: String },
    company_name: { type: String },
    hmo: { type: String },
    hmo_id: { type: String },
    hykau: { type: String },
    hykau_others: { type: String },
  },
  {
    _id: false, // IMPORTANT: prevents auto _id for each history entry
  }
);

const subHistorySchema = new mongoose.Schema({
  sub_plan: {
    type: String,
  },

  sub_type: {
    type: String,
    // required: true,
  },

  sub_date: {
    type: String,
  },

  exp_date: {
    type: String,
    // required: true,
  },

  amount: {
    type: Number,
  },

  extras_amount: {
    type: Number,
    default: 0,
  },

  boxing: {
    type: Boolean,
  },

  pt_status: {
    type: Boolean,
  },

  pt_plan: {
    type: String,
  },

  hist_type: {
    type: String,
    // required: true,
  },

  time_stamp: {
    type: String,
    default: () => new Date().toISOString(),
  },

  history_id: {
    type: String,
    // required: true,
  },

  sub_amount_b4_discount: {
    type: Number,
    default: null,
  },
});

const clientSchema = new mongoose.Schema({
  client_id: { type: String, required: true, unique: true },
  reg_date: { type: String },
  user_status: { type: Boolean },

  user_image: { type: String },
  client_details: {
    type: client_detailsSchema,
  },
  contact_details: {
    type: contact_detailsSchema,
  },
  personal_details: {
    type: personal_detailsSchema,
  },
  sub_details: {
    type: sub_detailsSchema,
  },
  program_details: {
    type: program_detailsSchema,
  },

  sub_income: { type: Number },
  baseline_done: { type: Boolean },
  physio_cl: { type: Boolean },
  physio_key: { type: String },

  indemnity_verified: { type: Boolean },
  max_days: { type: Number },
  renew_dates: { type: String },
  registration_dates: { type: String },
  registered: { type: Boolean },

  sub_history: {
    type: [subHistorySchema],
    default: [],
  },
});

const GymClient = mongoose.model("GymClient", clientSchema);

export default GymClient;
