import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    comment: {
      // comment which is liked
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    video: {
      //video which is liked
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    likedBy: {
      // one who liked
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    tweet: {
      //tweet which is liked
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
