import mongoose from "mongoose";

const downloadLogSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  videoId: {
    type: String,
    required: true,
    index: true
  },
  downloadedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['completed', 'failed', 'interrupted'],
    default: 'completed'
  }
});

downloadLogSchema.index({ userId: 1, downloadedAt: 1 })
downloadLogSchema.index({ userId: 1, videoId: 1, downloadedAt: 1 })

export default mongoose.model("download", downloadLogSchema);