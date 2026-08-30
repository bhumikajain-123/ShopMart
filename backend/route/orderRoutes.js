const express = require("express");
const router = express.Router();


const protect = require("../middleware/authMiddleware");
const {admin} = require("../middleware/adminMiddleware");
const {getAllOrder,createOrder,getOrderById,updateOrderStatus} = require("../controller/orderController");





router.route("/").post(protect,createOrder).get(protect,admin,getAllOrder);
router.route("/my-orders").get(protect,getOrderById)
router.route("/:id/status").put(protect,admin,updateOrderStatus);


module.exports = router;