import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authTasks from "./routes/authTasks.js"
import getTasks  from "./routes/getTasks.js";
import getStatus from "./routes/getStatus.js"
import authDiamond from "./routes/authDiamond.js"
import authRewards from "./routes/authRewards.js"
import authHistory from "./routes/authHistory.js"
import authRoutes  from "./routes/authRoutes.js";
import authEmail from "./routes/authEmail.js"
import authGrowth from './routes/authGrowth.js'

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());




app.use("/api/auth",authRoutes);
app.use("/api/auth",authTasks);

app.use("/api/auth",getTasks);
app.use("/api/auth",getStatus);
app.use("/api/auth",authDiamond);
app.use("/api/auth",authRewards);
app.use("/api/auth",authHistory);
app.use("/api/auth",authEmail);
app.use("/api/auth",authGrowth);



app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Unifeed API Running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});