import { Router } from "express";
import {
  getstatus,
  updateFocusStatus,
} from "../controllers/authController.js";

const router = Router();

router.get("/focus-status/:uuid", getstatus);
router.patch("/focus-status", updateFocusStatus);

export default router;