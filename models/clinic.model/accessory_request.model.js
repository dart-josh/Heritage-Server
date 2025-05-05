import mongoose from "mongoose";

const accessoryRequestSchema = new mongoose.Schema(
  {
    request_id: { type: String, required: true, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    accessories: [
      {
        accessory: { type: mongoose.Schema.Types.ObjectId, ref: "Accessory" },
        qty: { type: Number, required: true },
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
