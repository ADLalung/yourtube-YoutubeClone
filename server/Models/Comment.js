import mongoose from "mongoose";

const commentSchema = mongoose.Schema(
  {
    userid: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    videoid: { type: mongoose.Schema.Types.ObjectId, ref: "videofiles", required: true },
    commentbody: {type:String },
    commentedon: { type: Date, default: Date.now, required: true },
    usercommented: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("comment", commentSchema);