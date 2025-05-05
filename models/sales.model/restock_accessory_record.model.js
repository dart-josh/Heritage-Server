import mongoose from "mongoose";

const restockAccessoryRecordSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    accessories: [
      {
        accessory: { type: mongoose.Schema.Types.ObjectId, ref: "Accessory" },
        qty: { type: Number, required: true },
      },
    ],
    order_qty: { type: Number, required: true },
    shortNote: {
      type: String,
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    supplier: {
      type: String,
    },
    verified: { type: Boolean, default: false },
    verifiedDate: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const RestockAccessoryRecord = mongoose.model(
  "RestockAccessoryRecord",
  restockAccessoryRecordSchema
);

export default RestockAccessoryRecord;
