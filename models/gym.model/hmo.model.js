import mongoose from "mongoose";

const gymHMOSchema = new mongoose.Schema(
  {
    hmo_name: { type: String, required: true, unique: true },
    days_week: { type: Number },
    hmo_amount: { type: Number },
  },
);

const GymHMO = mongoose.model("GymHMO", gymHMOSchema);

export default GymHMO;