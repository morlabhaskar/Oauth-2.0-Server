import express from 'express';
import { getUserData, updateUserData } from '../controllers/userController.js';
import userAuth from '../middleware/userAuth.js';

const userRouter = express.Router();

userRouter.get('/userData', userAuth,getUserData);
userRouter.post('/update-user', userAuth,updateUserData);

export default userRouter;