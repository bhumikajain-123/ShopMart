const express = require("express");
const router = express.Router();
const {registerUser,loginUser,getUser} = require("../controller/authController");
const protect = require("../middleware/authMiddleware");
const {admin} = require("../middleware/adminMiddleware");




router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/users",protect,admin,getUser);

module.exports = router;