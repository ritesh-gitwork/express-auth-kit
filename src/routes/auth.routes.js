import { Router } from "express";
import { getMe, signin, signUp } from "../controllers/auth.controller.js";
import { authmiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signin);

router.get("/me", authmiddleware, getMe);

export default router;
