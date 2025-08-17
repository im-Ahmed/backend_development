import { v2 as cloudinary } from "cloudinary";
import dotenvx from "@dotenvx/dotenvx";
import { ApiError } from "./ApiError.js";
dotenvx.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const deleteFromCloudinary = async (URI) => {
  try {
    if (!URI) {
      throw new ApiError(500, "old file is missing");
    }
    const publicId = URI.substring(
      URI.lastIndexOf("/") + 1,
      URI.lastIndexOf(".")
    );
    console.log(publicId);
    const res = await cloudinary.uploader.destroy(publicId);

    if (res.result !== "ok") {
      throw new ApiError(500, "failed while deleting old image");
    }
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "something went wrong while removing previous file from cloudinary"
    );
  }
};
export { deleteFromCloudinary };
