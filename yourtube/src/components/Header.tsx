"use client"
import {
  Bell,
  FaceSlightlySmiling,
  Flag,
  Menu,
  Mic,
  Search,
  User,
  VideoIcon,
  Video,
  PlaySquare
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import Channeldialogue from "@/components/Channeldialogue";
import { useUser } from "@/lib/AuthContext";

const Header = ({onMenuClick}: any) => {
  const { user, logout, handlegooglesignin, isLoading } = useUser();
  
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogeopen, setIsDialogeopen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white border-b">
      <div className="flex items-center gap-4">
        
        <Button variant="ghost" className="md:flex text-zinc-400"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6 text-zinc-500" />
        </Button>

        <Link href="/" className="flex items-center gap-1">
          <div className="p-1 rounded">
            <PlaySquare className="w-6 h-6 text-red-700" />
          </div>
          <span className="text-xl font-medium">YourTube</span>
          <span className="text-xs text-gray-400 ml-1">IN</span>
        </Link>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 flex-1 max-w-2xl mx-4"
      >
        <div className="flex flex-1 item-center rounded-full
            focus-within:ring-1 focus-within:ring-gray-400 "
        >
          <Input
            type="text"
            placeholder="Search videos"
            value={searchQuery}
            onKeyPress={handleKeypress}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent rounded-l-full border-r-0 focus-visible:ring-0"
          />
          <Button
            type="submit"
            className="rounded-r-full px-6 bg-zinc-200 hover:bg-zinc-300 text-gray-600 border border-l-0"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Mic className="w-5 h-5" />
        </Button>
      </form>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Link
              href="/meeting"
              className="flex items-center gap-2
                text-gray-300 bg-zinc-800 rounded-md p-1
                hover:bg-zinc-600 transition-color duration-300
              "
            >
              <Video className="w-6 h-6" />
              <span className="hidden sm:inline">Meet/Live</span>
            </Link>

            <Button variant="ghost" size="icon">
              <Bell className="w-6 h-6" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {user?.channelname ? (
                  <DropdownMenuItem>
                    <Link href={`/channel/${user?._id}`}>Your channel</Link>
                  </DropdownMenuItem>
                ) : (
                  <div className="px-2 py-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => setIsDialogeopen(true)}
                    >
                      Create Channel
                    </Button>
                  </div>
                )}

                <DropdownMenuItem>
                  <Link href="/history">History</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/liked">Liked videos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/watch-later">Watch later</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/downloads">Downloads</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button
              className="flex items-center gap-2"
              onClick={handlegooglesignin}
              disabled={isLoading}
            >
              <User className="w-4 h-4" />
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </>
        )}{" "}
      </div>
      <Channeldialogue
        isopen={isDialogeopen}
        onclose={() => setIsDialogeopen(false)}
        mode="create"
      />
    </header>
  );
};

export default Header;
