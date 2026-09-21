import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  tierName: {
    type: String,
    required: true,
    unique: true,
    enum: ["Free", "Bronze", "Silver", "Gold"]
  },
  dailyLimit: {
    type: Number,
    required: true,
    min: 0
  }
});

export default mongoose.model("subscription", subscriptionSchema);