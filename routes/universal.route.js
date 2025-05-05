import express from "express"
import { add_update_health, delete_all_health_data, delete_health_data, finish_health, get_health_by_patient_id } from "../controllers/universal.controller.js";

// import {run_con} from "../utils/utils.js";

const router = express.Router();

router.post('/get_health_by_patient_id', get_health_by_patient_id)

router.post('/add_update_health', add_update_health)
router.post('/finish_health/:id', finish_health)

router.delete('/delete_health_data/:id', delete_health_data)
router.delete('/delete_all_health_data/:patient', delete_all_health_data)


// router.get('/run_con', run_con)

export default router;