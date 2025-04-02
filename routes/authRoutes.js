import express from 'express';
import { register, login, logout, sendVerifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();
// Register route
authRouter.post('/register', register);

// Login route  
authRouter.post('/login', login);

// Logout route 
authRouter.post('/logout', logout);

//send verify otp
authRouter.post('/send-verify-otp', userAuth,sendVerifyOtp);

//verify account
authRouter.post('/verify-account', userAuth,verifyEmail);

//isAuthenticated route
authRouter.post('/is-auth', userAuth,isAuthenticated);

//send reset otp
authRouter.post('/send-reset-otp',sendResetOtp);

//reset password
authRouter.post('/reset-password',resetPassword);


export default authRouter;