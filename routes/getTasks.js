import { Router } from "express";

import { getTasks ,updateTaskStatus} from "../controllers/authController.js";

const router = Router();

router.get("/get/:uuid", getTasks);
router.patch("/task-status", updateTaskStatus);
    
export default router;  