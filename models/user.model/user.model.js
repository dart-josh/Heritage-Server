import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
  },
  f_name: {
    type: String,
    required: true,
  },
  l_name: {
    type: String,
    required: true,
  },
  m_name: {
    type: String,
  },
  user_image: {
    type: String,
  },
  user_status: {
    type: Boolean,
    default: true,
  },
  user_role: {
    type: String,
    required: true,
    enum: ['Management',
    'Admin/Accounting',
    'Customer Service Unit',
    'ICT',
    'Physiotherapist',
    'Production',
    'Sales',],
  },
  section: {
    type: String,
    required: true,
    enum: ['General Staff',
    'Heritage Physiotherapy clinic',
    'Heritage Fitness',
    'Delightsome Juice & Smoothies'],
  },
  full_access: {
    type: Boolean,
    default: false,
  },
  last_activity: {
    type: Map,
  },
  fresh_day: {
    type: Boolean,
    default: true,
  },
  app_role: {
    type: String,
    required: true,
    enum: [ 'Admin',
      'CSU',
      'Doctor',
      'Management',
      'Marketer',
      'ICT',
      'None',],
  },
  can_sign_in: {
    type: Boolean,
    default: true,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
