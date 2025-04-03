import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

//app config
const app = express();

const port = process.env.PORT || 4000;

connectDB();

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true}))

//API end points
app.get('/',(req,res) => {
    res.send("API WORKING");
})
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);



app.listen(port,() => {
    console.log("Server is Running at ",port);
})