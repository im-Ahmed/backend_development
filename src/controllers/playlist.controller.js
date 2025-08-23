import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(400, "Playlist name and description is required");
  }
  const playlist = await Playlist.create({
    name,
    description,
    owner: new mongoose.Types.ObjectId(req.user?._id),
  });
  if (!playlist) {
    throw new ApiError(500, "Something went wrong while creating playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist is created successfully"));
  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId || userId.length != 24) {
    throw new ApiError(400, "UserId is missing or Invalid Id");
  }
  const userPlaylist = await Playlist.find({
    owner: userId,
  });
  if (!userPlaylist) {
    throw new ApiError(
      500,
      "Something went wrong while getting user's playlist"
    );
  }
  return res
    .status(200)
    .json(new ApiResponse(200, userPlaylist, "Playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId || playlistId.length != 24) {
    throw new ApiError(400, "UserId is missing or Invalid Id");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(500, "Something went wrong while fetching playlistById");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist is fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (
    !playlistId ||
    !videoId ||
    playlistId.length != 24 ||
    videoId.length != 24
  ) {
    throw new ApiError(400, "IDs are missing or invalid IDs");
  }
  const videoAddedToPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: new mongoose.Types.ObjectId(videoId) } },
    { new: true }
  );
  if (!videoAddedToPlaylist) {
    throw new ApiError(
      500,
      "Something went wrong while adding video to playlist"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        videoAddedToPlaylist,
        "Video added to playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (
    !playlistId ||
    !videoId ||
    playlistId.length != 24 ||
    videoId.length != 24
  ) {
    throw new ApiError(400, "IDs are missing or invalid IDs");
  }
  try {
    await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { videos: new mongoose.Types.ObjectId(videoId) } },
      { new: true }
    );
  } catch (err) {
    throw new ApiError(
      500,
      err.message || "Something went wrong while removing video from playlist"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Video is removed successfully from playlist")
    );
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId || playlistId.length != 24) {
    throw new ApiError(400, "UserId is missing or Invalid Id");
  }
  try {
    await Playlist.findByIdAndDelete(playlistId);
  } catch (err) {
    throw new ApiError(500, "Something went wrong while deleting playlist");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist is deleted successfully"));
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!playlistId || playlistId.length != 24) {
    throw new ApiError(400, "UserId is missing or Invalid Id");
  }
  if (!name || !description) {
    throw new ApiError(
      400,
      "Name and description is required for updating playlist"
    );
  }
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
      },
      $set: {
        description: description,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedPlaylist) {
    throw new ApiError(500, "Something went wrong while updating playlist");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist is updated successfully")
    );
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
