import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import { create, getByUserId } from "../controllers/resume.controller.js";

const router = express.Router();

router.post("/create", verifyToken, create);
router.get("/resumes/user/:userId", verifyToken, getByUserId);
export default router;
