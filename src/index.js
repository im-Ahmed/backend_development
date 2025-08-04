// import mongoose from "mongoose";
// import dotenvx from "@dotenvx/dotenvx";
// import { DB_NAME } from "./constants.js";
// import  express  from "express";
import  connect_DB from "./db/index.js";
// dotenvx.config();


connect_DB();

/*
const app = express();
;(async ()=>{

    try {
        await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("ERROR: ", error);
        })
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("ERROR: ",error);
        throw new error;
    }
})()
*/
