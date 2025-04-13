import userModel from "../models/userModel.js";
import {v2 as cloudinary} from 'cloudinary'
// import cloudinary from '../config/cloudinary.js';

const getUserData = async (req, res) => {

    try {

        const { userId } = req.user;
        // const { userId } = req.body;
        const user = await userModel.findById(userId);
        // if (!user) {
        //     return res.json({ success: false, message: "User not found" });
        // }

        res.json({ success: true, user });
        console.log(user);
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message:error.message })
        
    }

}

//update user data
const updateUserData = async (req, res) => {
    try {
        const { userId } = req.user;
        const { name } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        await userModel.findByIdAndUpdate(userId, { name });
        const updatedUser = await userModel.findById(userId);

        res.json({ success: true, message: "User updated successfully", updatedUser });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message:error.message })
        
    }
}

// delete user account
const deleteUserAccount = async (req, res) => {
    const { userId } = req.user;
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        await userModel.findByIdAndDelete(userId);
        res.json({ success: true, message: "User account deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message:error.message })
        
    }
}

export { getUserData,updateUserData,deleteUserAccount };