import mongoose from "mongoose";

const gymIncomeSchema = new mongoose.Schema(
  {
    client_key: {
      type: String,
      required: true,
      index: true,
    },

    hist_type: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      default: 0,
    },

    extras_amount: {
      type: Number,
      default: 0,
    },

    sub_amount_b4_discount: {
      type: Number,
      default: 0,
    },

    sub_plan: {
      type: String,
    },

    sub_type: {
      type: String,
    },

    sub_date: {
      type: Date,
      required: true,
    },

    exp_date: {
      type: Date,
    },

    // 🔹 Flags used to derive extras
    boxing: {
      type: Boolean,
      default: false,
    },

    pt_status: {
      type: Boolean,
      default: false,
    },

    // 🔹 Derived extras array (matches Flutter behavior)
    // extras: {
    //   type: [String],
    //   default: [],
    // },
  },
  {
    timestamps: true,
  }
);

gymIncomeSchema.index({ sub_date: 1 });

const GymIncome = mongoose.model("GymIncome", gymIncomeSchema);
export default GymIncome;
