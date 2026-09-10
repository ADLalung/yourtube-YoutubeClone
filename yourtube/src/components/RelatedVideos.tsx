import React from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
const vid = "/video/vdo.mp4"


const RelatedVideos = ({videos}: any) => {

    // console.log(videos)

    return (
        <div>
        {videos.map((video: any)=>(
            <Link key={video._id} href={`/watch/${video._id}`} className='flex gap-2 group'>
                <div className='relative w-40 aspect-video bg-gray-100 rounded overflow-hidden flex-shrink-0'>
                    <video 
                        src={vid}
                        className='object-cover group-hover:scale-105 transition-transfrom duration-200'
                    ></video>
                </div>
                <div className='flex-1 min-w-0'>
                    <h3 className='font-medium text-sm line-clamp-2 group-hover:text-blue-600'>
                        {video.videotitle}
                    </h3>
                    <p className='text-xs text-gray-600 mt-1'>{video.chanel}</p>
                    <p className='text-xs text-gray-600 '>
                        {video.views.toLocaleString()} views {" ~ "}
                        {formatDistanceToNow(new Date(video.createdAt))} ago
                    </p>
                </div>
            </Link>
        ))}
        </div>
    )
}

export default RelatedVideos
