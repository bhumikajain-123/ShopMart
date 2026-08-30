const Order = require("../model/Order");
const Product = require("../model/Product");

const sendEmail = require("../utils/sendEmail");

const createOrder = async (req, res) => {
    try {

        const id = req.user._id;

        const {
            items,
            address,
            paymentId
        } = req.body;


        // Validate order data
        if (!items || !address || !paymentId) {
            return res.status(400).json({
                message: "Invalid Order data"
            });
        }


        // Check items
        if (items.length === 0) {
            return res.status(400).json({
                message: "Order must contain at least one product"
            });
        }


        // Check address
        if (
            !address.fullName ||
            !address.street ||
            !address.city ||
            !address.postalCode ||
            !address.country
        ) {
            return res.status(400).json({
                message: "Complete shipping address is required"
            });
        }


        let total = 0;
        const orderProduct = [];


        // Process products
        for (const item of items) {

            if (!item.productId) {
                return res.status(400).json({
                    message: "ProductId is required"
                });
            }


            if (!item.quantity || item.quantity <= 0) {
                return res.status(400).json({
                    message: "Quantity must be greater than 0"
                });
            }


            const product = await Product.findById(item.productId);


            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }


            if (item.quantity > product.stock) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.name}`
                });
            }


            // Calculate total using database price
            const itemTotal = product.price * item.quantity;

            total += itemTotal;


            // Add product to order
            orderProduct.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price
            });


            // Reduce stock
            product.stock -= item.quantity;

            await product.save();
        }


        // Create order
        const order = await Order.create({
            user: id,
            items: orderProduct,
            totalAmount: total,
            address: address,
            paymentId: paymentId
        });


        // Send email
        await sendEmail(
            req.user.email,

            "Order Created Successfully 🎉",

            `Hi ${req.user.name || "Customer"},

Thank you for shopping with ShopMart! 🛍️

Your order has been successfully placed.

💰 Total Amount: ₹${order.totalAmount}

📦 Order Status: Confirmed ✅

We're excited to get your order ready and deliver it to you soon. 🚚📦

Thank you for choosing ShopMart.

We hope you enjoy your shopping experience! ❤️

Best Regards,

ShopMart Team`
        );


        // Send response
        return res.status(201).json({
            message: "Order created successfully",
            order
        });


    } catch (err) {

        console.log(err);

        return res.status(500).json({
            message: "Server Error",
            error: err.message
        });
    }
};

const getOrderById = async (req,res) =>{
    try{
   const id  = req.user._id;
    const order = await Order.find({user : id}).populate("items.productId","name price").sort({cretedAt:-1});
    if(order.length=== 0 ){
        return res.status(200).json({message : "No orders found",order: []})
    }
res.status(200).json({message : "Order fetch successfully",order});
    }catch(err){
        res.status(500).json({message : "Server Error",error : err.message});
    }
}

const getAllOrder = async (req,res) =>{
    try{
        const order = await Order.find({}).populate("user","id name");
        res.status(200).json(order);
    }catch(err){
        res.status(500).json({message : "Server Error",error : err.message});
    }
}
const updateOrderStatus = async (req,res) => {
    try{
        const {status} = req.body;
        if(!status){
            return res.status(400).json({message : "Order status is required"})
        }
        const order = await Order.findById(req.params.id);
        if(!order){
            return req.status(400).json({message : "order not found"});
        }
        const validStatus = ["pending","confirmed","Processing","shipped","deleivered","cancelled"]

        if(!validStatus.includes(status)){
            return res.status(400).json({message : "Invalid Order Status"});
        }
        order.status = status;
        await order.save();
        res.status(200).json({message : "Order Status updated successfully"});
    }catch(err){
        res.status(500).json({message : "Server Error",error: err.message});
    }
}


module.exports = {createOrder,getOrderById,getAllOrder,updateOrderStatus}
