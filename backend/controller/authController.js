const User = require("../model/User");
const bcrypt = require("bcrypt");
const Otp = require("../model/Otp");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) =>{
  return jwt.sign({id},process.env.JWT_SECRET,{expiresIn: "30d"});
}


// Register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if already registered
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // OTP expires in 5 minutes
    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Remove previous OTP for this email
    await Otp.deleteMany({ email });

    // Temporarily store registration data
    await Otp.create({
      name,
      email,
      password: hashedPassword,
      otp,
      expiresAt
    });

    // Send OTP
    const message = `
      Welcome to ShopNest, ${name}!

      Your OTP for registration is: ${otp}

      This OTP is valid for 5 minutes.
    `;

    await sendEmail(
      email,
      "ShopNest - Verify Your Email",
      message
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      email
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpData = await Otp.findOne({
      email,
      otp
    });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (otpData.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpData._id });

      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    // NOW create the actual user
    const user = await User.create({
      name: otpData.name,
      email: otpData.email,
      password: otpData.password,
      verified: true
    });

    // Remove temporary OTP data
    await Otp.deleteOne({
      _id: otpData._id
    });

    return res.status(201).json({
      success: true,
      message: "Email verified and registration completed",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
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

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Find existing temporary registration
    const otpData = await Otp.findOne({ email });

    if (!otpData) {
      return res.status(404).json({
        success: false,
        message: "Registration session not found. Please register again."
      });
    }

    // Generate new OTP
    const newOtp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // New expiry: 5 minutes
    const newExpiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    // Update OTP
    otpData.otp = newOtp;
    otpData.expiresAt = newExpiresAt;

    await otpData.save();

    // Send new OTP
    const message = `
      Your new ShopNest verification OTP is:

      ${newOtp}

      This OTP is valid for 5 minutes.
    `;

    await sendEmail(
      email,
      "ShopNest - New Verification OTP",
      message
    );

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

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
getUser,verifyEmail,resendOtp 
};