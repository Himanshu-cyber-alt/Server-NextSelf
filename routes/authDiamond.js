import { Router } from "express";
import { getDiamond,addDiamond,removeDiamonds } from "../controllers/authController.js";

const router = Router();


router.get('/get-diamond/:uuid',getDiamond)
router.post('/add-diamond',addDiamond);
router.post('/remove-diamond/:uuid',removeDiamonds)

export default router;