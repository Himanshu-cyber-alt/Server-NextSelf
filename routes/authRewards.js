import { Router } from "express";
import { addRewardMinutes ,removeReward} from "../controllers/authController.js";


const router = Router();

router.post('/add-reward',addRewardMinutes);
router.post('/remove-reward',removeReward);

export default router;