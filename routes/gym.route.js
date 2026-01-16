import express from "express";
import {
  add_to_sub_history,
  add_update_hmo,
  delete_client,
  delete_hmo,
  generate_client_id,
  get_all_clients,
  get_gym_income,
  get_hmo,
  register_client,
  update_client,
} from "../controllers/gym.controller.js";
const router = express.Router();

router.get("/get_all_clients", get_all_clients);
router.get("/get_hmo", get_hmo);
router.get("/get_gym_income/:month", get_gym_income);

router.post("/register_client", register_client);
router.post("/update_client", update_client);
router.post("/add_to_sub_history", add_to_sub_history);
router.post("/add_update_hmo", add_update_hmo);

router.post("/generate_client_id", generate_client_id);

router.delete("/delete_client/:id", delete_client);
router.delete("/delete_hmo/:id", delete_hmo);

export default router;
