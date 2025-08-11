import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { UploadOnCloudiary } from "../utils/cloudinary_file_uploading.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  /* Flow to logic 
  - get user details
  - validate data
  - validate email
  - check for user if already exist
  - handle images
  - check if avatar is uploaded succussfully or not
  - upload images to cloudinary - get urls
  - create user object in dB
  - check if the user created successfully or not
  - remove the password and refresh token field from user
  - return the user as respone
  
  */
  // get data from the user
  const { username, email, fullName, password } = req.body;
  console.log(email, username);
  // validate data - if all fields are non empty
  if (
    [username, email, fullName, password].some((field) => field.trim() == "")
  ) {
    throw new ApiError(400, "All fields should be filled");
  }
  // validate email format
  const validEmail = email.includes("@");
  if (!validEmail) {
    throw new ApiError(400, "Invalid Email must have `@` ");
  }
  // check if user already exist
  const userExisted = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (userExisted) {
    throw new ApiError(400, "User is already exist with same name or email");
  }
  // handle images
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // check avatar is uploaded
  if (!avatarLocalPath) {
    throw new ApiError(400, "Upload the avatar photo");
  }
  // upload the images on cloudinary
  const avatar = await UploadOnCloudiary(avatarLocalPath);
  const coverImage = await UploadOnCloudiary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar is not uploaded on cloudinary");
  }
  // create object in dB
  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
  });
  // get the created user without password and refresh token field
  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!userCreated) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  // send respone
  return res
    .status(201)
    .json(new ApiResponse(200, userCreated, "User Successfully registered"));
});

export { registerUser };
