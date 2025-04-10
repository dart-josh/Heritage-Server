import mongoose from "mongoose";

const salesRecordSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    items: [{ item: {type: mongoose.Schema.Types.ObjectId, ref: "Accessory"}, qty: { type: Number, required: true } }],
    order_price: { type: Number, required: true },
    order_qty: { type: Number, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    discount_price: { type: Number },
    shortNote: {
      type: String,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    splitPaymentMethod: [
      {
        paymentMethod: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    saleType: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const SalesRecord = mongoose.model("SalesRecord", salesRecordSchema);

export default SalesRecord;
