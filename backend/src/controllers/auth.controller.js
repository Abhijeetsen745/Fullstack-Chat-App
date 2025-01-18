import bcrypt from 'bcryptjs'
import User from '../models/user.model.js'
import { generateToken } from '../lib/util.js';
import cloudinary from '../lib/cloudinary.js';

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
  
    try {
      // All fields are required
      if (!fullName || !email || !password) {
        return res.status(400).json({ message: "Please fill in all fields" });
      }
  
      // Password length validation
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long" });
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
  
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create new user
      const newUser = new User({
        fullName,
        email,
        password: hashedPassword,
      });
  
      try {
        await newUser.save();
      } catch (saveError) {
        console.error("Error saving new user:", saveError);
        return res.status(500).json({ message: "Failed to create new user" });
      }
  
      // Generate token
      try {
        generateToken(newUser._id, res); // Ensure this function is defined correctly
      } catch (tokenError) {
        console.error("Error generating token:", tokenError);
        return res.status(500).json({ message: "Token generation failed" });
      }
  
      return res
        .status(201)
        .json({ message: "User created successfully", fullName: newUser.fullName });
    } catch (error) {
      console.error("Error in signup controller:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
  

export const login = async(req,res)=>{
    const {email,password}= req.body;
      
    try {
        if(!email || !password){
            return res.status(400).json({message:'Please fill in all fields'});}

         const user = await User.findOne({ email });
            if(!user){
                return res.status(400).json({ message: "Invalid Credentials" });
            }
         
            const isPasswordCorrect = await bcrypt.compare(password,user.password)
            if(!isPasswordCorrect){
                return res.status(400).json({ message: "Invalid Credentials" });}

            generateToken(user._id,res)
            return res.status(200).json({message:"User logged in successfully",fullName:user.fullName})
        
    } catch (error) {
        console.log('error in login controller',error);
        return res.status(500).json({message:"server error"})
    }
}

export const logout = (req,res)=>{
    
    try {
        res.cookie("jwt","",{maxAge:0})
        return res.status(200).json({msg:"User logged out successfully"})
    } catch (error) {
        console.log('error in logout controller',error);
        return res.status(500).json({message:"server error"})
    }
}


export const updateProfile =async (req,res)=>{
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;
        if(!profilePic){
            return res.status(400).json({message:'Profile pic is required'});
        }
        const pic = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:pic.secure_url},{new:true})
        return res.status(200).json({msg:"Profile updated successfully",updatedUser})

    } catch (error) {
        console.log('error in updateProfile controller',error);
        return res.status(500).json({message:"server error"})
    }
}

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};