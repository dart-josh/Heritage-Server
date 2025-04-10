import mongoose from "mongoose";

const healthSchema = new mongoose.Schema(
  {
    height: { type: String },
    weight: { type: String },
    ideal_weight: { type: String },
    fat_rate: { type: String },
    weight_gap: { type: String },
    weight_target: { type: String },
    waist: { type: String },
    arm: { type: String },
    chest: { type: String },
    thighs: { type: String },
    hips: { type: String },
    pulse_rate: { type: String },
    blood_pressure: { type: String },

    chl_ov: { type: String },
    chl_nv: { type: String },
    chl_rm: { type: String },
    hdl_ov: { type: String },
    hdl_nv: { type: String },
    hdl_rm: { type: String },
    ldl_ov: { type: String },
    ldl_nv: { type: String },
    ldl_rm: { type: String },
    trg_ov: { type: String },
    trg_nv: { type: String },
    trg_rm: { type: String },
    blood_sugar: { type: Boolean },
    eh_finding: { type: String },
    eh_recommend: { type: String },
    sh_finding: { type: String },
    sh_recommend: { type: String },
    ah_finding: { type: String },
    ah_recommend: { type: String },
    other_finding: { type: String },
    other_recommend: { type: String },
    ft_obj_1: { type: String },
    ft_obj_2: { type: String },
    ft_obj_3: { type: String },
    ft_obj_4: { type: String },
    ft_obj_5: { type: String },

    data_type: { type: String },
    date: { type: String },
    done: { type: Boolean, default: false },
    note: { type: String },
    doctor_note: { type: String },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "PhysioPatient" },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Health = mongoose.model("Health", healthSchema);

export default Health;
