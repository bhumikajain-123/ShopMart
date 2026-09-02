const Razorpay = require("razorpay");
const crypto = require("crypto");
const Product = require("../model/Product");

const createOrder = async (req,res) =>{
    try{
        const {items} = req.body;
             if (!items || items.length === 0) {
            return res.status(400).json({
                message: "Items are required"
            });
        }
        let totalAmount = 0;
        for(item of items){
            const product = await Product.findById(item.productId);
            if(!product){
                return res.status(404).json({message : "Product not found"});
            }
            const total = product.price * item.quantity;
            totalAmount += total;
        }
        const instance = new Razorpay({
            key_id : process.env.key_id,
            key_secret : process.env.key_secret
        });
        const options = {
            amount : totalAmount,
            currency : "INR",
             receipt: crypto.randomBytes(10).toString("hex")
        }
        const order = instance.orders.create(options);
         res.status(200).json({
            success: true,
            order: order,
            totalAmount: totalAmount
        });


    }catch(err){
        res.status(500).json({message : "Server Error",error : err.message});
    }
}


    const verifyPayment = (req,res)=>{
        try{
            const{razorpay_order_id,razorpay_payment_id,razorpay_signature} = req.body;
  const body =  `${razorpay_order_id}|${razorpay_payment_id}`;
            const expectedSignature = crypto.Hmac("sha256",process.env.key_secret).update(body).digest("hex");
            if(exprectedSignature === razorpay_signature){
                res.status(200).json({message : "Payment verified successfully"});
            }else{
                res.status(500).json({message : "Payment verification failed"});
            }
        }catch(err){
            res.status(500).json({message : "Server Error",error : err.message});
        }
    }

    module.exports = {createOrder,verifyPayment};