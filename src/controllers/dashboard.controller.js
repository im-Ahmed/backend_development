import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const channelId = req.user?._id;
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });
  // Fetch all videos owned by channel
  const videos = await Video.find({ owner: channelId }, "_id views");

  const videoIds = videos.map((v) => v._id);

  const totalViews = videos.reduce((acc, v) => acc + (v.views || 0), 0);
  const totalVideos = videos.length;
  const totalLikes = await Like.countDocuments({ video: { $in: videoIds } });
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalSubscribers,
        totalViews,
        totalVideos,
        totalLikes,
      },
      "Fetched successfully"
    )
  );
  // const totalLikes = await Like.countDocuments({
  //   likedBy: chan,
  // });
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const videos = await Video.find({
    owner: userId,
  });
  if (!videos || videos.length < 0) {
    throw new ApiError(
      500,
      "Something went wrong while getting channel's all videos"
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos Fetched Successfully"));
});

export { getChannelStats, getChannelVideos };
