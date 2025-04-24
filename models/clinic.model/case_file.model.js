import mongoose from "mongoose";

const caseFileSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    bp_reading: { type: String },
    note: { type: String },
    remarks: { type: String },
    case_type: { type: String, required: true },

    treatment_date: { type: Date, required: true },
    start_time: { type: Date, default: null },
    end_time: { type: Date, default: null },
    treatment_decision: { type: String },
    refered_decision: { type: String },
    other_decision: { type: String },
  },
  {
    timestamps: true,
  }
);

const CaseFile = mongoose.model("CaseFile", caseFileSchema);

export default CaseFile;
