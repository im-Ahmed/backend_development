import { app } from "./app.js";
import  connect_DB from "./db/index.js";
import dotenvx from "@dotenvx/dotenvx";
dotenvx.config({ path: ".env" });

connect_DB().then(()=>{
    app.listen(process.env.PORT || 4000 ,()=>console.log(`Server is running on http://localhost:${process.env.PORT}`));
}).catch((err)=>{
    console.log("ERROR: ", err);
})

