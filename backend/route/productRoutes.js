const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({dest:"uploads/"});

const protect = require("../middleware/authMiddleware");
const {admin} = require("../middleware/adminMiddleware");
const {getProducts,createProduct,getProductById,updateProduct,deleteProduct} = require("../controller/productController");





router.route("/").get(getProducts).post(protect,admin,upload.single("image"),createProduct);

router.route("/:id").get(getProductById).put(protect,admin,upload.single("image"),updateProduct).delete(protect,admin,deleteProduct);


module.exports = router;