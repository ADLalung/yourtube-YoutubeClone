import User from "../Models/Auth.js";
import Subscription from "../Models/Subscription.js";
import DownloadLog from "../Models/Download.js";

export const getSubscriptionTier = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).select("subscriptionTier");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const tier = await Subscription.findOne({ tierName: user.subscriptionTier });
    

    return res.status(200).json({
      subscriptionTier: user.subscriptionTier,
      dailyLimit: tier ? tier.dailyLimit : 0
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const processDownload = async (req, res) => {
  try {
    const { userId } = req.body;
    const { videoId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tier = await Subscription.findOne({ tierName: user.subscriptionTier });

    if (!tier) {
      return res.status(400).json({ error: "Subscription tier not configured" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const alreadyDownloaded = await DownloadLog.findOne({
      userId,
      videoId,
      downloadAt: { $gte: startOfDay }
    });

    if (alreadyDownloaded) {
      return res.status(200).json({
        url: "YOUR_SECURE_S3_LINK",
        message: "Already used quota today"
      });
    }

    const todayDownloads = await DownloadLog.distinct("videoId", {
      userId,
      downloadAt: { $gte: startOfDay }
    });

    if (todayDownloads.length >= tier.dailyLimit) {
      return res.status(403).json({ error: "Daily download limit reached" });
    }

    await DownloadLog.create({
      userId,
      videoId,
      ipAdress: req.ip
    });

    return res.status(200).json({
      url: "YOUR_SECURE_S3_LINK",
      message: "Download approved"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Download failed" });
  }
};