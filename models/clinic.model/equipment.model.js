import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  equipmentName: {
    type: String,
    required: true,
  },
  equipmentId: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    required: true,
  },
  costing: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['Available', 'In Use', 'Under Maintenance'],
    default: 'Available',
  },
});

const Equipment = mongoose.model("Equipment", equipmentSchema);

export default Equipment;

