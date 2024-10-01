
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { config } from 'dotenv';
import morgan from 'morgan'
import errorMiddleware from './middleware/errorMiddleware.js';
import userRouter from "./routes/userRoutes.js"

config()



const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true}))
app.use(cookieParser());
app.use(cors({
        origin: [process.env.FRONTEND_URL],
        credentials: true
}))
app.use(morgan("dev"))



app.use("/pin", (req, res) => {
    res.status(200).json({
        success: true,
        message: "point"
    })
});

app.use("/api/v1/user", userRouter)

app.use("*", (req, res) => {
    res.status(401).send("OPPS PAGE NOT FOUND")
});

app.use(errorMiddleware);

export default app;

