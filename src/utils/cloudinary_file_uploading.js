import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenvx from "@dotenvx/dotenvx";
import { log } from "console";
dotenvx.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UploadOnCloudiary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload the Image
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // Image uploaded successfully
    console.log("File is Uploaded successfully", response.url);
    return response;
  } catch (error) {
    // Remove the temporarilly save file if the image upload got failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};


export { UploadOnCloudiary };
