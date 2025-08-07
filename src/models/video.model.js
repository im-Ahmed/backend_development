import mongoose, { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchena = new Schema(
  {
    videoFile: {
      type: String, //URL from Cloudinary
      required: true,
    },
    thumbnail: {
      type: String, //URL from Cloudinary
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: { type: Number, required: true },
    views: {
      type: Number,
      default: 0,
    },
    ispublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

videoSchena.plugin(mongooseAggregatePaginate);

export const Video = model("Video", videoSchena);
