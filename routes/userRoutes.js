import { Router } from "express";
import upload from "../middleware/multerMiddleware.js"
import { changePassword, forgotPassword, getUserProfile, login, logOut, register, resetPassword, updateProfile } from "../controllers/userController.js";
import { isLoggedIn } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", upload.single("avatar"), register);
router.post("/login", login);
router.get("/me", isLoggedIn, getUserProfile);
router.get("/logout", isLoggedIn, logOut);

router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:resetToken", resetPassword);

router.post("/changePassword", isLoggedIn, changePassword);
router.put("/updateUser", isLoggedIn, upload.single("avatar"), updateProfile)


export default router;