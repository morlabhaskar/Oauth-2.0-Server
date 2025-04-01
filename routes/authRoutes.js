import express from 'express';
import { register, login, logout } from '../controllers/authController.js';

const authRouter = express.Router();
// Register route
authRouter.post('/register', register);
// Login route  
authRouter.post('/login', login);
// Logout route 
authRouter.post('/logout', logout);

export default authRouter;