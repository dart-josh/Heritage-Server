import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  name: {
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
  status: {
    type: String,
    enum: ['Available', 'In Use', 'Under Maintenance'],
    default: 'Available',
  },
});

const Equipment = mongoose.model("Equipment", equipmentSchema);

export default Equipment;

