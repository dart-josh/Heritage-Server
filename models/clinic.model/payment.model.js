import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  history_id: { type: String, required: true },
  hist_type: {
    type: String,
    required: true,
    enum: [
      "Assessment payment",
      "Session payment",
      "Session setup",
      "Session added",
    ],
  },
  amount: { type: Number },
  amount_b4_discount: { type: Number },
  date: { type: Date, required: true },
  session_paid: { type: Number },
  cost_p_session: { type: Number },
  old_float: { type: Number },
  new_float: { type: Number },
  session_frequency: { type: String },
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
