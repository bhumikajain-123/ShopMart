const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoDb = require("./config/db");
dotenv.config();

mongoDb();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
    res.send("ecommerce");
});


app.use("/api/auth",require("./route/authRoutes"));
app.use("/api/products",require("./route/productRoutes"));
app.use("/api/orders",require("./route/orderRoutes"));
// app.use("/api/payment",require("./route/paymentRoutes"));
// app.use("/api/analytics",require("./route/analyticsRoutes"));

const PORT = process.env.PORT;


app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})