import express from "express";
// Make sure to import your new controllers at the top of the file!
import { 
  getGrowthTopics, 
  addGrowthTopic, 
  deleteGrowthTopic, 
  updateGrowthTime 
} from "../controllers/authController.js"; 

const router = express.Router();

// --- GROWTH ROUTES ---


router.get("/growth/:uuid", getGrowthTopics);

router.post("/growth/add", addGrowthTopic);


router.delete("/growth/:id", deleteGrowthTopic);


router.post("/growth/update-time", updateGrowthTime);

export default router;