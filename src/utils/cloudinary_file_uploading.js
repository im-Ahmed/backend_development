import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenvx from "@dotenvx/dotenvx";
dotenvx.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // Upload the Image
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // Image uploaded successfully
    fs.unlinkSync(localFilePath); // remove the image from our server
    return response;
  } catch (error) {
    // Remove the temporarilly save file if the image upload got failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
