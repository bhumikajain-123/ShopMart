const express = require("express");
const router = express.Router();
const {registerUser,loginUser,getUser,verifyEmail,resendOtp } = require("../controller/authController");
const protect = require("../middleware/authMiddleware");
const {admin} = require("../middleware/adminMiddleware");




router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/users",protect,admin,getUser);
router.post("/verify-email",verifyEmail);
router.post("/resend-otp",resendOtp);


module.exports = router;