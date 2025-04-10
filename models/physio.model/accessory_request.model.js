import mongoose from "mongoose";

const accessoryRequestSchema = new mongoose.Schema(
  {
    request_id: { type: String, required: true, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "PhysioPatient" },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    accessories: [
      {
        acccossory: { type: mongoose.Schema.Types.ObjectId, ref: "Accessory" },
        qty: { type: Int16Array, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const AccessoryRequest = mongoose.model(
  "AccessoryRequest",
  accessoryRequestSchema
);

export default AccessoryRequest;
