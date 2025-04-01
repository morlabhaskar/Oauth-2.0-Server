import bcript from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const register = async (req,res) => {

    const {name,email,password} = req.body;
    if(!name || !email || !password) {
        return res.json({success:false,message:"Please fill all the fields"})
    }
    try {

        const existingUser = await userModel.findOne({email})

        if(existingUser) {
            return res.json({success:false,message:"User Already Exists"})
        }

        const salt = await bcript.genSalt(10)
        const hashedPassword = await bcript.hash(password,salt);

        const userData = {
            name,
            email,
            password:hashedPassword
        }

        const user = new userModel(userData)
        // const user = new userModel({name,email,password:hashedPassword})
        await user.save()

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});

        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({success:true,message:"User Created Successfully",token})

        
    } catch (error) {
        res.json({success:false,message:error.message})
        // res.json({success:false,message:"Server Error"})
    }

}

//API for login user
const login = async (req,res) => {

    try {
        const {email,password} = req.body;

        if(!email || !password) {
            return res.json({success:false,message:"Please fill all the fields"})
        }

        const user = await userModel.findOne({email})

        if(!user) {
            return res.json({success:false,message:"User Not Found"})
        }

        const isMatch = await bcript.compare(password,user.password)

        if(!isMatch) {
            res.json({success:false,message:"Invalid Credentials"})
        }

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});

        res.cookie("token",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({success:true,message:"Login Successfull",user:user.email,token});


    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

const logout = async (req,res) => {
    try {
        res.clearCookie("token",{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        res.json({success:true,message:"Logout Successfull"})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

export {register,login,logout}