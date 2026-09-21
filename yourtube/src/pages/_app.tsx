import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../lib/AuthContext";
import {useState} from 'react'

export default function App({ Component, pageProps }: AppProps) {
  // Sidebar functionings
  const [isSidebar, setIsSidebar] = useState(false)
  const toggleSidebar = ()=>{
    setIsSidebar(prev => !prev)
  }
  
  return (
    <UserProvider>
      <div className="min-h-screen bg-white text-black">
        <title>Your-Tube Clone</title>
        <Header
          onMenuClick={toggleSidebar}
        />
        <Toaster />
        <div className="flex">
          <Sidebar isOpen={isSidebar} />
          <Component {...pageProps} />
        </div>
      </div>
    </UserProvider>
  );
}