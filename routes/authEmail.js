import { Router } from "express";
import {sendEmailAlert} from "../controllers/authController.js";


const router = Router();

// Add this line to your routes file
router.post("/send-alert", sendEmailAlert);

export default router;