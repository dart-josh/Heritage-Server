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
      session_count: { type: Number, default: 1 },
    },
  ],

  ong_patients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
  ],
  pen_patients: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
  ],
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
