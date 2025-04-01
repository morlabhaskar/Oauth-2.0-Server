import bcript from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel';

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
        const hashedPassword = bcript.hash(password,salt);

        const userData = {
            name,
            email,
            password:hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"7d"});

        res.json({success:true,token})

        
    } catch (error) {
        res.json({success:false,message:error.message})
    }

}

//API for login user
const loginUser = async (req,res) => {

    const {email,password} = req.body;

    if(!email || !password) {
        return res.json({success:false,message:"Please fill all the fields"})
    }

    try {

        const user = await userModel.findOne({email})

        if(!user) {
            return res.json({success:false,message:"User Not Found"})
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(isMatch) {
            const token = jwt.sign({id:user._id},process.env.JWT_SECRET)
            res.json({success:true,token,message:"Login Successfully"})
        }
        else{
            res.json({success:false,message:"Invalid Credentials"})
        }

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

export {register,loginUser}