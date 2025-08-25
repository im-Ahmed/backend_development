import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId || videoId.length != 24) {
    throw new ApiError(400, "Video Id is missing or Invalid Id");
  }

  const aggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "commentedBy",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        content: 1,
        commentedBy: 1,
      },
    },
  ]);
  const options = {
    limit,
    page,
  };
  const comments = await Comment.aggregatePaginate(aggregate, options);
  return res
    .status(200)
    .json(
      new ApiResponse(200, comments.docs, "Comments are fetched successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!videoId || videoId.length != 24) {
    throw new ApiError(400, "Video Id is missing or Invalid Id");
  }
  if (!content) {
    throw new ApiError(400, "Comment content is required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id,
  });
  if (!comment) {
    throw new ApiError(500, "Something went wrong while adding comment");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment is addded successfully"));
  // TODO: add a comment to a video
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { newContent } = req.body;
  if (!commentId || commentId.length != 24) {
    throw new ApiError(400, "comment Id is missing or Invalid Id");
  }
  if (!newContent) {
    throw new ApiError(400, "Comment content is required for updating");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      content: newContent,
    },
    {
      new: true,
    }
  );
  if (!updatedComment) {
    throw new ApiError(500, "Something went wrong while updating comment");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedComment, "Comment is updated successfully")
    );

  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId || commentId.length != 24) {
    throw new ApiError(400, "comment Id is missing or Invalid Id");
  }

  try {
    await Comment.findByIdAndDelete(commentId);
  } catch (err) {
    throw new ApiError(
      500,
      err.message || "Something went wrong while deleting comment"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment is deleted successfully"));
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
