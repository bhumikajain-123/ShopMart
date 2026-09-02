const User = require("../model/User");
const Order = require("../model/Order");
const product = require("../model/Product");

const getAdminStats  = async (req,res) =>{
    try{
        const totalUsers = await User.countDocuments({role : "user"});
        const totalOrder = await Order.countDocuments({});
        const totalProduct = await product.countDocuments({});
        const orders = await Order.find({});

        const totalRevenue = orders.reduce((total,order)=> total + order.totalAmount,0);
        res.status(200).json({
            totalUsers,totalOrder,totalProduct,totalRevenue
        })


}catch(err){
    res.status(500).json({message  : "Server Error",error : err.message});
}
}

module.exports = getAdminStats;