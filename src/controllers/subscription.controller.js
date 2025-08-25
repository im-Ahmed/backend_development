import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // validate channelId
  if (!channelId || channelId.length !== 24) {
    throw new ApiError(400, "Channel Id is missing or invalid");
  }

  // prevent self-subscription
  if (channelId === req.user?._id.toString()) {
    throw new ApiError(400, "Channel should not subscribe to itself");
  }

  try {
    // check if already subscribed
    const existingSubscription = await Subscription.findOne({
      subscriber: req.user?._id,
      channel: channelId,
    });

    let message, isSubscribed;

    if (existingSubscription) {
      // unsubscribe
      await Subscription.findOneAndDelete({
        subscriber: req.user?._id,
        channel: channelId,
      });
      message = "Unsubscribed successfully";
      isSubscribed = false;
    } else {
      // subscribe
      await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
      });
      message = "Subscribed successfully";
      isSubscribed = true;
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { channelId, isSubscribed }, message));
  } catch (err) {
    throw new ApiError(500, "Something went wrong while toggling subscription");
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId || channelId.length !== 24) {
    throw new ApiError(400, "Channel Id is missing or invalid");
  }

  const allSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              coverImage: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        subscribers: 1,
      },
    },
  ]);
  if (!allSubscribers || allSubscribers?.length === 0) {
    throw new ApiError(500, "No subscribers found for this channel");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allSubscribers[0].subscribers,
        "Subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId || subscriberId.length !== 24) {
    throw new ApiError(400, "Channel Id is missing or invalid");
  }

  const allChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channels",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              coverImage: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        _id: 0,
        channels: 1,
      },
    },
  ]);
  if (!allChannels || allChannels?.length === 0) {
    throw new ApiError(404, "No channel found against this subcsriber");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allChannels[0].channels,
        "Channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
