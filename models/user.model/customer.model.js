import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  customer_id: {  type: String, required: true, unique: true },
  f_name: { type: String, required: true },
  l_name: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  total_spent: { type: Number, default: 0 },
  last_visit: { type: Date },
  last_order: { type: Date },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "SalesRecord" }],
});

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
