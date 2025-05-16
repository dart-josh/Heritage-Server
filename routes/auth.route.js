import express from "express"
import { login, check_pin, reset_password, reset_pin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post('/login', login);
router.post('/check_pin', check_pin);

router.post('/reset_password/:id', reset_password);
router.post('/reset_pin/:id', reset_pin);

export default router;