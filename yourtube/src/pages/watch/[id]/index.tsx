import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Videoplayer from "@/components/Videoplayer";
import VideoInfo from "@/components/VideoInfo";
import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import axiosInstance from "@/lib/axiosinstance";

const index = () => {
  const router = useRouter();
  const { id } = router.query;

  const [videos, setvideo] = useState<any>([])
  const [video, setVideo] = useState<any>(null)
  const [loading, setloading] = useState(true)

  useEffect(() => {
    if (!id || typeof id !== "string") return

    const fetchvideo = async () => {
      try {
        const res = await axiosInstance.get("/video/getall")
        const video = res.data?.filter((vid:any)=> vid._id === id )
        setvideo(video[0])
        setVideo(res.data)
      } catch (error) {
        console.log(error)
      } finally {
        setloading(false)
      }
    };
    fetchvideo()
  }, []);

  // const relativeVideos = [
  //     {
  //         _id: "1",
  //         videotitle: "Amazing Nature Documentary",
  //         filename: "nature-doc.mp4",
  //         filetype: "video/mp4",
  //         filepath: "/videos/nature-doc.mp4",
  //         filesize: "500MB",
  //         videochanel: "Nature Channel",
  //         Like: 1250,
  //         Dislike: 50,
  //         views: 45000,
  //         uploader: "nature_lover",
  //         createdAt: new Date().toISOString(),
  //     },
  //     {
  //         _id: "2",
  //         videotitle: "Cooking Tutorial: Perfect Pasta",
  //         filename: "pasta-tutorial.mp4",
  //         filetype: "video/mp4",
  //         filepath: "/videos/pasta-tutorial.mp4",
  //         filesize: "300MB",
  //         videochanel: "Chef's Kitchen",
  //         Like: 890,
  //         Dislike: 20,
  //         views: 23000,
  //         uploader: "chef_master",
  //         createdAt: new Date(Date.now() - 86400000).toISOString(),
  //     },
  //     {
  //         _id: "3",
  //         videotitle: "How to make money in just 2days",
  //         filename: "make-money.mp4",
  //         filetype: "video/mp4",
  //         filepath: "/videos/make-money.mp4",
  //         filesize: "180.mb",
  //         videochanel: "MoneyTalks",
  //         Like: 1200,
  //         Dislike: 500,
  //         views: 50000,
  //         uploader: "money_talks",
  //         createdAt: new Date(Date.now() - 96400000).toISOString(),
  //     },
  // ]

  if (loading) return <div>Loading...</div>;

  if (!videos) {
    return <div>Video not found</div>;
  }
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Videoplayer video={videos} />
            <VideoInfo video={videos} />
            <Comments videoId={id} />
          </div>
          <div className="space-y-4">
            <RelatedVideos videos={video} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
