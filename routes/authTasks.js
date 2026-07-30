import { Router } from "express";

import { tasks } from "../controllers/authController.js";

const router = Router();

router.post("/create", tasks);

    
export default router;