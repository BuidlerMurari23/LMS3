import { Router } from "express";
import upload from "../middleware/multerMiddleware.js"
import { getUserProfile, login, logOut, register } from "../controllers/userController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.get("/me", isLoggedIn, getUserProfile);
router.get("/logout", isLoggedIn, logOut)

export default router;