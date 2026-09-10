import mongoose from "mongoose";

const likeSchema = mongoose.Schema(
  {
    viewer: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    videoid: { type: mongoose.Schema.Types.ObjectId, ref: "videofiles", required: true },
    likedon: { type: Date, default: Date.now, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("like", likeSchema);