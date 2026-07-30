import { Router } from "express";
import {addHistory,getHistory} from "../controllers/authController.js";


const router = Router();

router.post('/add-history',addHistory);
router.get("/get-history/:uuid", getHistory);


export default router;