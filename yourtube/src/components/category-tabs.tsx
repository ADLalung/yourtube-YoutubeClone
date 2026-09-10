import { Button } from './ui/button';
import React,{ useState } from 'react';


const categories = [
    "All",
    "Movie",
    "News",
    "Gaming",
    "Science",
    "Education",
    "Travel",
    "Food",
    "Fashion"
]

const Categorytabs = () => {
    const [activeCategory, setActiveCategory] = useState("All");
    return (
        <div className='flex mb-6 gap-2 overflow-x-auto pb-2'>
            {categories.map((category)=>(
                <Button 
                    key={category} 
                    variant={activeCategory === category ? "default": "secondary"}
                    className="whitespace-nowrap"
                    onClick={()=>{setActiveCategory(category)}}
                >
                    {category}
                </Button>
            ))}
        </div>
    )
}

export default Categorytabs;