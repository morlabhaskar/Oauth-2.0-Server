import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
// import connectCloudinary from './config/cloudinary.js';

//app config
const app = express();

const port = process.env.PORT || 4000;

connectDB();
// connectCloudinary();

//middlewares
const allowedOrigins = ['http://localhost:5173','https://oauth-client-2025.vercel.app'];

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:allowedOrigins,credentials:true}))

//API end points
app.get('/',(req,res) => {
    res.send("API WORKING");
})
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);



app.listen(port,() => {
    console.log("Server is Running at ",port);
})
