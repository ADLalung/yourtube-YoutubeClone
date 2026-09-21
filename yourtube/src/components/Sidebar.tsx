"use client"
import {
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  History,
  User,
  Download
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useUser } from "@/lib/AuthContext";
import Channeldialogue from "./Channeldialogue";

const Sidebar = ({isOpen, download}:any) => {
  const { user } = useUser();

  const [isdialogeopen, setisdialogeopen] = useState(false);
  return (
    <aside className={`shrink-0 overflow-hidden whitespace-nowrap transition-all duration-300 ${isOpen ? 'w-44' : 'w-16'}`}>
      <nav className="space-y-1 p-2">
        <Link href="/" className="block">
          <Button variant="ghost" className={`h-11 w-full ${isOpen ? 'justify-start px-3' : 'justify-center px-0'}`}>
            <Home className={`h-5 w-5 shrink-0 ${isOpen ? 'mr-3' : ''}`} />
            <span className={isOpen ? '' : 'hidden'}>Home</span>
          </Button>
        </Link>
        <Link href="/explore" className="block">
          <Button variant="ghost" className={`h-11 w-full ${isOpen ? 'justify-start px-3' : 'justify-center px-0'}`}>
            <Compass className={`h-5 w-5 shrink-0 ${isOpen ? 'mr-3' : ''}`} />
            <span className={isOpen ? '' : 'hidden'}>Explore</span>
          </Button>
        </Link>
        <Link href="/subscriptions" className="block">
          <Button variant="ghost" className={`h-11 w-full ${isOpen ? 'justify-start px-3' : 'justify-center px-0'}`}>
            <PlaySquare className={`h-5 w-5 shrink-0 ${isOpen ? 'mr-3' : ''}`} />
            <span className={isOpen ? '' : 'hidden'}>Subscriptions</span>
          </Button>
        </Link>

        {user && (
          <>
            <div className="mt-3 border-t border-gray-200 pt-3">
              <Link href="/history" className="block">
                <Button variant="ghost" className={`h-11 w-full ${isOpen ? 'justify-start px-3' : 'justify-center px-0'}`}>
                  <History className={`h-5 w-5 shrink-0 ${isOpen ? 'mr-3' : ''}`} />
                  <span className={isOpen ? '' : 'hidden'}>History</span>
                </Button>
              </Link>
              <Link href="/liked" className="block">
                <Button variant="ghost" className={`h-11 w-full ${isOpen ? 'justify-start px-3' : 'justify-center px-0'}`}>
                  <ThumbsUp className={`h-5 w-5 shrink-0 ${isOpen ? 'mr-3' : ''}`} />
                  <span className={isOpen ? '' : 'hidden'}>Liked videos</span>
                </Button>
              </Link>
              <Link href="/watch-later" className="block">
                <Button variant="ghost" className={`h-11 w-full ${isOpen ? 'justify-start px-3' : 'justify-center px-0'}`}>
                  <Clock className={`h-5 w-5 shrink-0 ${isOpen ? 'mr-3' : ''}`} />
                  <span className={isOpen ? '' : 'hidden'}>Watch later</span>
                </Button>
              </Link>
              {user?.channelname ? (
                <>
                <Link href={`/channel/${user.id}`} className="block">
                  <Button variant="ghost" className={`h-11 w-full ${isOpen ? 'justify-start px-3' : 'justify-center px-0'}`}>
                    <User className={`h-5 w-5 shrink-0 ${isOpen ? 'mr-3' : ''}`} />
                    <span className={isOpen ? '' : 'hidden'}>Your channel</span>
                  </Button>
                </Link>

                <Link href="/downloads" className="block">
                  <Button variant="ghost" 
                    className={`h-11 w-full ${isOpen ? 'justify-start px-3' : 'justify-center px-0'}`}
                    onClick={()=>{download}}
                  >
                    <Download className={`h-5 w-5 shrink-0 ${isOpen ? 'mr-3' : ''}`} />
                    <span className={isOpen ? '' : 'hidden'}>Downloads</span>
                  </Button>
                </Link>
                </>
              ) : (
                <div className={`py-2 ${isOpen ? 'px-1' : 'px-0'}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className={`h-10 w-full ${isOpen ? '' : 'px-0 text-[0px]'}`}
                    onClick={() => setisdialogeopen(true)}
                  >
                    <span className={isOpen ? '' : 'hidden'}>Create Channel</span>
                    {!isOpen && <User className="h-5 w-5" />}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
    </aside>
  );
};

export default Sidebar;