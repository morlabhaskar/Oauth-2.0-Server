import express from 'express';
import { deleteUserAccount, getUserData, updateUserData } from '../controllers/userController.js';
import userAuth from '../middleware/userAuth.js';
// import upload from '../middleware/multer.js';

const userRouter = express.Router();

userRouter.get('/userData', userAuth,getUserData);
userRouter.post('/update-user',userAuth,updateUserData);
userRouter.delete('/delete-user', userAuth,deleteUserAccount);

export default userRouter;