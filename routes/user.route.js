import express from "express"
import { add_update_customer, add_update_doctor, add_update_user, delete_customer, get_all_customers, get_all_doctors, get_all_users, get_doctor_by_id } from "../controllers/user.controller.js";

const router = express.Router();

router.get('/get_all_customers', get_all_customers)
router.get('/get_all_doctors', get_all_doctors)
router.get('/get_doctor_by_id/:id', get_doctor_by_id)
router.get('/get_all_users', get_all_users)

router.post('/add_update_customer', add_update_customer)
router.post('/add_update_doctor', add_update_doctor)
router.post('/add_update_user', add_update_user)

router.delete('/delete_customer/:id', delete_customer)

export default router;