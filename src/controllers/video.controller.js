import mongoose, { isValidObjectId, mongo } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary_file_uploading.js";
import { deleteFromCloudinary } from "../utils/cloudinary_file_remove.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  if (!userId) {
    throw new ApiError(400, "Id is missing or invalid Id in query");
  }
  if (!page || !limit || !query || !sortBy || !sortType) {
    throw new ApiError(
      400,
      "Some of the parameter is missing from URL request"
    );
  }
  let sortOrderId = 1;
  if (sortType?.toLowerCase() === "desc") {
    sortOrderId = -1;
  }
  const aggregation = Video.aggregate([
    {
      // get video belong to user
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    },
    {
      // only those which are published
      $match: {
        ispublished: true,
      },
    },
    {
      // get videos those matches the query
      $match: {
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    },
    {
      $sort: {
        createdAt: sortOrderId,
      },
    },
    {
      $project: {
        owner: 0,
      },
    },
  ]);
  if (!aggregation) {
    throw new ApiError(500, "Something went wrong while getting all videos");
  }
  const options = {
    page, // which page you want
    limit, // how many per page
  };
  const allVideos = await Video.aggregatePaginate(aggregation, options);
  return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "All videos fetched successfully"));
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  // get video details and verify
  // get video and thumbnail file and verfiy
  // upload on cloudinary and verify
  // create document in video collection
  const { title, description } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "Title and Description is required");
  }
  const videoFileLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;
  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail is not uploaded successfully");
  }
  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    owner: new mongoose.Types.ObjectId(req.user?._id),
    duration: videoFile.duration,
  });
  const videoUploaded = await Video.findById(video._id).select("-owner");
  if (!videoUploaded) {
    throw new ApiError(500, "Something went wrong while uploading video");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, videoUploaded, "Video is uploaded successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || videoId?.length != 24) {
    throw new ApiError(400, "Video Id is missing or an invalid Id");
  }
  const videoDetails = await Video.findById(videoId).select("-owner ");
  if (!videoDetails) {
    throw new ApiError(401, "Something went wrong while getting the video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videoDetails, "Video is fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //update video details like title, description, thumbnail
  const { videoId } = req.params;
  const { newTitle, newDescription } = req.body;
  const thumbnailLocalPath = req.file?.path;
  if (!videoId || videoId?.length != 24) {
    throw new ApiError(400, "Video Id is missing or an Invalid Id");
  }
  if (!newTitle || !newDescription || !thumbnailLocalPath) {
    throw new ApiError(400, "All fields are required or update");
  }
  const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!newThumbnail) {
    throw new ApiError(
      500,
      "Something went wrong while updating cloudinary thumbnail"
    );
  }
  const currentVideoDetails = await Video.findById(videoId);
  // delete old thumbnail from cloudinary
  await deleteFromCloudinary(currentVideoDetails.thumbnail);
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      title: newTitle,
      description: newDescription,
      thumbnail: newThumbnail.url,
    },
    {
      new: true,
    }
  ).select("-owner");
  if (!updatedVideo) {
    throw new ApiError(500, "Something went wrong while updating video");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedVideo,
        "Video details are updated successfully"
      )
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || videoId?.length != 24) {
    throw new ApiError(400, "Video Id is missing or an Invalid Id");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "No video found against this Id");
  }
  try {
    await deleteFromCloudinary(video.videoFile);
    await deleteFromCloudinary(video.thumbnail);
    await Video.findByIdAndDelete(videoId);
  } catch (err) {
    throw new ApiError(
      500,
      err.message || "Something went wrong while deleting Video"
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video is deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || videoId.length != 24) {
    throw new ApiError(400, "Video Id is missing or an Invalid Id");
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    [{ $set: { ispublished: { $not: "$ispublished" } } }],
    { new: true }
  ).select("-owner");
  if (!updatedVideo) {
    throw new ApiError(401, "Video is not founded against this Id");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video publish status changed"));
});

const handleViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId || videoId.length != 24) {
    throw new ApiError(400, "Video Id is missing or an Invalid Id");
  }
  let message;
  try {
    await Video.findByIdAndUpdate(videoId, {
      $inc: { views: 1 },
    });
    message = "view counted";
  } catch (err) {
    throw new ApiError(
      500,
      err.message || "Something went wrong while view counting"
    );
  }
  return res.status(200).json(new ApiResponse(200, {}, message));
});
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  handleViews
};
