import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || videoId.length != 24) {
    throw new ApiError(400, "Video Id is missing or an Invalid Id");
  }

  const userId = req.user?._id;

  // Check if like already exists for this user & video
  const likeExist = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  let message, isLiked;

  try {
    if (likeExist) {
      await Like.findOneAndDelete({
        video: videoId,
        likedBy: userId,
      });
      message = "Like removed from video";
      isLiked = false;
    } else {
      await Like.create({
        video: videoId,
        likedBy: userId,
      });
      message = "Video liked";
      isLiked = true;
    }
  } catch (err) {
    throw new ApiError(
      500,
      err.message || "Something went wrong while toggling video like"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { videoId, isLiked }, message));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId || commentId.length != 24) {
    throw new ApiError(400, "Comment Id is missing or an Invalid Id");
  }

  const userId = req.user?._id;

  // Check if like already exists for this user & video
  const likeExist = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  let message, isLiked;

  try {
    if (likeExist) {
      await Like.findOneAndDelete({
        comment: commentId,
        likedBy: userId,
      });
      message = "Like removed from comment";
      isLiked = false;
    } else {
      await Like.create({
        comment: commentId,
        likedBy: userId,
      });
      message = "comment liked";
      isLiked = true;
    }
  } catch (err) {
    throw new ApiError(
      500,
      err.message || "Something went wrong while toggling comment like"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { commentId, isLiked }, message));
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId || tweetId.length != 24) {
    throw new ApiError(400, "Tweet Id is missing or an Invalid Id");
  }

  const userId = req.user?._id;

  // Check if like already exists for this user & video
  const likeExist = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  let message, isLiked;

  try {
    if (likeExist) {
      await Like.findOneAndDelete({
        tweet: tweetId,
        likedBy: userId,
      });
      message = "Like removed from tweet";
      isLiked = false;
    } else {
      await Like.create({
        tweet: tweetId,
        likedBy: userId,
      });
      message = "tweet liked";
      isLiked = true;
    }
  } catch (err) {
    throw new ApiError(
      500,
      err.message || "Something went wrong while toggling tweet like"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { tweetId, isLiked }, message));
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const videos = await Like.find({
    video: { $exists: true },
    likedBy: req.user?._id,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Fetched successfully"));
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
