import { nanoid } from "nanoid";
import Patient from "../models/clinic.model/patient.model.js";

export const generate_nano_id = () => {
  return "" + nanoid(11);
};

export const generate_customer_id = () => {
  return "CUST" + generate_nano_id();
};

export const generate_accessory_id = () => {
  return "ACC" + generate_nano_id();
};

export const generate_order_id = () => {
  return "ORD" + generate_nano_id();
};

export const getTimezoneOffset = (date) => {
  if (!date) {
    return null;
  }

  const newDate = new Date(date);

  // convert date to local timezone
  newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());

  return newDate;
};

export const get_date = (date) => {
  if (!date) {
    return null;
  }
  
  return date.toString().split('T')[0];
}



//!

// export const run_con = async (req, res) => {
//   const data_l = []
  
//   data_l.forEach((data) => {
//     convertt(data);
//   })
  

//   res.json({ sone: true });
// };

// export const convertt = (data) => {
//   const dd = data["reg_date"];

//   var dateString = getTimezoneOffset(convertDate(dd));

//   data["reg_date"] = dateString;

//   add_update_patient(data);
// };

// function convertDate(dateString) {
//   const [day, month, year] = dateString.split("/");
//   return new Date(+year, month - 1, +day, 2);
// }

// export const add_update_patient = async (data) => {
//   const {
//     patient_id,
//     reg_date,
//     user_status,
//     f_name,
//     m_name,
//     l_name,
//     user_image,
//     phone_1,
//     phone_2,
//     email,
//     address,
//     gender,
//     dob,
//     age,
//     occupation,
//     nature_of_work,
//     hykau,
//     hykau_others,
//     hmo,
//     hmo_id,
//     sponsors,
//     refferal_code,
//   } = data;

//   // verify fields
//   if (!f_name || !gender || !patient_id) {
//     return console.log(patient_id);
//   }

//   const patient_id_exists = await Patient.findOne({ patient_id });

//   try {
//     if (patient_id_exists) {
//       return console.log('Exist already -- ', patient_id);
//     }

    

//     const patient = await Patient.create({
//       patient_id,
//       reg_date,
//       user_status,
//       f_name,
//       m_name,
//       l_name,
//       user_image,
//       phone_1,
//       phone_2,
//       email,
//       address,
//       gender,
//       dob,
//       age,
//       occupation,
//       nature_of_work,
//       hykau,
//       hykau_others,
//       hmo,
//       hmo_id,
//       sponsors,
//       refferal_code,
//     });

//     console.log(patient._id);


//   } catch (error) {
//     console.log("Error in add_update_patient: -", error.message, '-----', patient_id);

//   }
// };

//!
