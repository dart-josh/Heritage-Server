import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  is_available: { type: Boolean, default: true },

  total_sessions: { type: Number, default: 0 },
  title: { type: String },
  my_patients: [
    {
      patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
      session_count: { type: Number, default: 0 },
    },
  ],

  ong_patients: [
    {
      patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
      treatment_type: { type: String, required: true },
      treatment_duration: { type: String, required: true },
    },
  ],
  pen_patients: [
    {
      patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
      treatment_type: { type: String, required: true },
      treatment_duration: { type: String, required: true },
    },
  ],
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
