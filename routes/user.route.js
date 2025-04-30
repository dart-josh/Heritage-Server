import express from "express"
import { add_update_customer, add_update_doctor, add_update_user, delete_customer, get_all_customers, get_doctors, get_all_users, get_doctor_by_id, generate_user_id, delete_user, delete_doctor, update_pen_patients, remove_pen_patients, update_ong_patients, remove_ong_patients, update_my_patients} from "../controllers/user.controller.js";

const router = express.Router();

router.get('/get_all_customers', get_all_customers)
router.get('/get_doctors', get_doctors)
router.get('/get_doctor_by_id/:id', get_doctor_by_id)
router.get('/get_all_users', get_all_users)

router.post('/add_update_customer', add_update_customer)
router.post('/add_update_doctor', add_update_doctor)
router.post('/add_update_user', add_update_user)

router.post('/update_pen_patients', update_pen_patients)
router.post('/remove_pen_patients', remove_pen_patients)
router.post('/update_ong_patients', update_ong_patients)
router.post('/remove_ong_patients', remove_ong_patients)
router.post('/update_my_patients', update_my_patients)


router.delete('/delete_customer/:id', delete_customer)
router.delete('/delete_user/:id', delete_user)
router.delete('/delete_doctor/:id', delete_doctor)

router.post('/generate_user_id', generate_user_id)

export default router;