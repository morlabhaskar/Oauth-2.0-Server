import mongoose from "mongoose";


const userScema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "",
    },
    verifyOtp: {
        type: String,
        default: "",
    },
    verifyOtpExpireAt: {
        type: Number,
        default: 0,
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    },
    resetOtp: {
        type: String,
        default: "",
    },
    resetOtpExpireAt: {
        type: Number,
        default: 0,
    },
}, { timestamps: true })

const userModel = mongoose.models.user || mongoose.model("user",userScema);
export default userModel;