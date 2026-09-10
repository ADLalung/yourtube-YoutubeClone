import React, { Suspense,useState,useEffect } from 'react'
import WatchLaterContent from '@/components/WatchLaterContent'

export default function WatchLater(){
    return (
        <main className='flex-1 p-6'>
            <div className='max-w-4xl'>
            <h1 className='text-2xl font-bold mb-6'>Watch later</h1>
            <Suspense fallback={ <div>Loading watch later...</div> }>
                <WatchLaterContent />
            </Suspense>
            </div>
        </main>
    )
}
