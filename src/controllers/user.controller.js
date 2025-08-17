import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary_file_uploading.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";
import dotenvx from "@dotenvx/dotenvx";
import { deleteFromCloudinary } from "../utils/cloudinary_file_remove.js";
dotenvx.config();

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found for token generation");
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went while generating access and refresh tokens"
    );
  }
};
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
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // check avatar is uploaded
  if (!avatarLocalPath) {
    throw new ApiError(400, "Upload the avatar photo");
  }
  // upload the images on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : "";
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
    .status(200)
    .json(new ApiResponse(201, userCreated, "User Successfully registered"));
});
const loginUser = asyncHandler(async (req, res) => {
  // req.body - data
  // username or email based
  // check user against data
  // check password
  // generate access and refresh token
  // send cookies
  // return response

  // get details
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }
  // check for user
  const user = await User.findOne({
    $and: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }
  // check password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }
  // generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  // getting the referance of updated user that save with refreshc token in above generateAccessAndRefreshToken method
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // cookie options
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        accessToken,
        refreshToken,
      }),
      "User logged in successfully"
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  // find user against that id and update the refresh token as undefined
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    }
  );
  // cookie options
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  // gett the refresh token
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    // verify the refresh token
    const decodedToken = Jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    // check user against that refresh token
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }
    // generate tokens
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    // cookies options
    const options = {
      httpOnly: true,
      secure: true,
    };
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});
const changeCurrentPassword = asyncHandler(async (req, res) => {
  // get old and new password from body
  // get user id from req
  //check pass on that id
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(401, "Unauthorired user");
  }
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Incorrect old password");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully!"));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "current user is fetched successfully")
    );
});
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!(fullName || email)) {
    throw new ApiError(400, "Full Name and Email is required");
  }
  const isValidEmail = email.includes("@");
  if (!isValidEmail) {
    throw new ApiError(400, "invalid email");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");
  if (!user) {
    throw new ApiError(401, "something went wrong while updating user");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User is updated successfully"));
});
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(500, "Error while uploading avatar to cloudinary");
  }
  // delete old image from cloudinary
  const URIOfOldAvatar = req.user.avatar;
  console.log(URIOfOldAvatar);
  await deleteFromCloudinary(URIOfOldAvatar);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar is updated successfully"));
});
const updateUserConverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(500, "Error while uploading cover image to cloudinary");
  }
  // delete old image from cloudinary
  const URIOfOldcoverImage = req.user.coverImage;
  console.log(URIOfOldcoverImage);
  await deleteFromCloudinary(URIOfOldcoverImage);
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image is updated successfully"));
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserConverImage,
};
