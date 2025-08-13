import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { LIMIT } from "./constants.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: LIMIT })); // data in the form of JSON
app.use(express.urlencoded({ extended: true, limit: LIMIT })); // data from the URL and how it is encoded
app.use(express.static("public")); // for media files handling like images , pdf and etc in public (choice name) folder
app.use(cookieParser());

//Routes import

import userRouter from "./routes/user.routes.js";

// Routes declaration
app.use("/api/v1/users", userRouter);

// Example: http://localhost:8000/api/v1/users/ then the route passs the controll to userRouter

export { app };
