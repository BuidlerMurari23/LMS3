import { Router } from "express";
import upload from "../middleware/multerMiddleware.js"
import { login, register } from "../controllers/userController.js";

const router = Router();

router.post("/register", upload.single("avatar"), register);
router.post("/login", login)

export default router;