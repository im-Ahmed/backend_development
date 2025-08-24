import mongoose, { Mongoose, isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { raw } from "express";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Tweet content is required");
  }
  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });
  if (!tweet) {
    throw new ApiError(500, "Something went wrong while creating tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet is created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId || userId.length != 24) {
    throw new ApiError(400, "UserId is missing or Invalid ID");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(400, "User does not found");
  }
  const allTweet = await Tweet.find({
    owner: userId,
  });
  if (!allTweet) {
    throw new ApiError(500, "Something went wrong while fetching tweets");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, allTweet, "Tweets fetched successfully"));

  // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { newContent } = req.body;
  if (!newContent) {
    throw new ApiError(400, "content is required for update tweet");
  }
  if (!tweetId || tweetId.length != 24) {
    throw new ApiError(400, "UserId is missing or Invalid ID");
  }
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      content: newContent,
    },
    { new: true }
  );
  if (!tweet) {
    throw new ApiError(400, "Something went wrong while updating tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet is updated successfully"));
  //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId || tweetId.length != 24) {
    throw new ApiError(400, "UserId is missing or Invalid ID");
  }
  try {
    await Tweet.findByIdAndDelete(tweetId);
  } catch (err) {
    throw new ApiError(
      400,
      err.message || "Something went wrong while deleting tweet"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet is deleted successfully"));
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
