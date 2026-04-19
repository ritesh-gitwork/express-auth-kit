import express from "express";
import { Router } from "express";
import { getMe, signin, signUp } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signin);

router.get("/me", authMiddleware, getMe);

export default router;
