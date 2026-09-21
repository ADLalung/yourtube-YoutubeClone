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
