import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
          unique: true,
      },
      
   is_available: {type: bool, default: true,},

   total_sessions: {type: int,  default: 0,},
   
   ong_treatment: {type: int,  default: 0,},
   pen_treatment: {type: int,  default: 0,},

   title: {type: String,},
  all_patients: [
    {patient: {type: mongoose.Schema.Types.ObjectId,
    ref: "PhysioPatient",}, sessions: {type: Number, default: 0,}}
  ],

  ong_patients: [
    {patient: {type: mongoose.Schema.Types.ObjectId,
    ref: "PhysioPatient",}, treatment_type: {type: String, required: true},}
  ],
  pen_patients: [
    {patient: {type: mongoose.Schema.Types.ObjectId,
    ref: "PhysioPatient",}, treatment_type: {type: String, required: true},}
  ],
  });
  
  const Doctor = mongoose.model("Doctor", doctorSchema);
  
  export default Doctor;