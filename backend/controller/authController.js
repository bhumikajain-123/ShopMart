const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) =>{
  return jwt.sign({id},process.env.JWT_SECRET,{expiresIn: "30d"});
}


// Register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // Hash password
    const salt = await  bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });
if(user){
  const otp = Math.floor(100000+Math.random()*900000).toString();
  const message = `
  Welcome to ShopNest ,${name}!
  Your otp for ShopNest registeration is: ${otp}`

  await sendEmail(email,`Welcome to ShopNest - Your otp for Registration`,message);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role : user.role,
        token : generateToken(user._id)
      
      }
    });

  } else{
    return res.json({message })
  }
}catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
console.log(email,password);
        const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    const  token = generateToken(user._id);
 
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const getUser = async (req,res)=>{

  try{
    const user = await User.find({}).select('-password')
    res.status(200).json(user);
  }catch(err){
    res.status(500).json({message : "Server Error"});
  }
}

// Logout
// const logoutUser = async (req, res) => {
//   try {
//     res.status(200).json({
//       success: true,
//       message: "Logout successful"
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };


module.exports = {
  registerUser,
  loginUser,
getUser
};