import { Router } from "express";
import upload from "../middleware/multerMiddleware.js"
import { forgotPassword, getUserProfile, login, logOut, register, resetPassword } from "../controllers/userController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.get("/me", isLoggedIn, getUserProfile);
router.get("/logout", isLoggedIn, logOut);

router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:resetToken", resetPassword);


export default router;