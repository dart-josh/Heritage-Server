import express from "express"
import { add_update_accessory, add_update_sales_record, delete_accessory, delete_sales_record, get_accessoryById, get_all_accessories, get_sales_record, get_sales_record_by_date } from "../controllers/sales.controller.js";

const router = express.Router();

router.get('/get_all_accessories', get_all_accessories)
router.get('/get_accessoryById/:id', get_accessoryById)
router.get('/get_sales_record', get_sales_record)
router.post('/get_sales_record_by_date', get_sales_record_by_date)

router.post('/add_update_accessory', add_update_accessory)
router.post('/add_update_sales_record', add_update_sales_record)

router.delete('/delete_accessory/:id', delete_accessory)
router.delete('/delete_sales_record/:id', delete_sales_record)

export default router;