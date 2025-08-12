import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenvx from "@dotenvx/dotenvx";
dotenvx.config({ path: ".env" });

const connect_DB = async () => {
  try {
    const connetionInstance = await mongoose.connect(
      `${process.env.DB_URI}${DB_NAME}`
    );
    console.log(`Connected to DB Host: ${connetionInstance.connection.host}`);
  } catch (error) {
    console.log("ERROR: ", error);
    process.exit(1);
  }
};
export default connect_DB;
