import Meeting from '@/components/Meeting'

import react, { useState, useEffect, Suspense } from 'react'

const index = () => {
    return (
        <main className='flex-1 p-6'>
            <div className='max-w-4xl'>
            <h1 className='text-2xl font-bold mb-6'>Meet/Live</h1>

            <Suspense fallback={ <div>Loading...</div> }>
                <Meeting />
            </Suspense>

            </div>
        </main>
    )
}

export default index