const Product = require ("../model/Product");
const cloudinary = require("../config/cloudinary");


const getProducts = async (req,res) =>{
    try{
    //     cloudinary.api.ping()
    // .then((result) => {
    //     console.log("Cloudinary Connected:", result);
    // })
    // .catch((error) => {
    //     console.log("Cloudinary Connection Failed:");
    //     console.log(error.message);
    // });
const product = await  Product.find({});

    res.json(product);
    }catch(err){
        res.status(500).json(err.message);
    }

    
}
const getProductById = async (req,res) =>{
    try{
        const {id} = req.params;
        const product = await Product.findById(id);
        if(product){
 res.json(product);
        }else{
            res.status(404).json({message : "Product not found"});
        }
       
    }catch(err){
        res.send(500).json({message : "Server Error"});
    }
}
const updateProduct = async (req,res) =>{
   try{

    const {name,description,price,category,stock} = req.body;
    const product = await Product.findById(req.params.id);
    if(product){
        product.name = name || product.name,
        product.description = description || product.description,
        product.price = price || product.price,
        product.category = category || product.category,
        product.stock = stock ?? product.stock
    
   if(req.file){
    const result = await cloudinary.uploader.upload(req.file.path);
    console.log(result);
    imageUrl = result.secure_url
  }
  await product.save();
  res.status(200).json({message : "Product updated successfully"},product)
}else{
    res.status(404).json({message : "Product not found"});
}
   }catch(err){
    res.status(500).json({message : "Server Error",error: err.message});
   }


    }
    const deleteProduct = async(req,res)=>{
        try{
            const product = await Product.findByIdAndDelete(req.params.id);
            if(!product){
                res.status(404).json({message : "Product not found"});
            }
            res.status(200).json({message : "Product deleted Successfully"})
        }catch(err){
            res.status(500).json({message : "Server Error",error : err.message});
        }
    }

const createProduct = async (req,res) =>{
    try{
        
        const {name,description,price,category,stock} = req.body;
       
        let imageUrl = "";
  if(req.file){
    const result = await cloudinary.uploader.upload(req.file.path);
 
    imageUrl = result.secure_url
  }
 const product =  await Product.create({name,description,price,category,stock,imageUrl})
 
  res.status(201).json({product,message : "product add successfyylly"});
} catch(err){
  
    
    res.status(500).json({
        message: "Server Error",
        error: err.message
    });
}
}



module.exports = {getProducts,getProductById,createProduct,updateProduct,deleteProduct};