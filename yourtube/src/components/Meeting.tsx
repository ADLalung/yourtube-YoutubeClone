import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, MonitorUp, Users, 
  MessageSquare, PhoneOff, Copy, Check, X, User, Settings,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from './ui/button'
import { Input } from './ui/input'

// Simple Modal/Dialog Component
const Dialog = ({ open, onOpenChange, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 grid w-full max-w-md gap-4 border border-zinc-800 bg-zinc-950 p-6 shadow-lg sm:rounded-lg animate-in zoom-in-95 duration-200">
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4 text-zinc-400" />
        </button>
        {children}
      </div>
    </div>
  );
};


// Video Component to render MediaStream
const LocalVideo = ({ stream, className }: any) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline muted className={className} />;
};


// --- MAIN APPLICATION CONTENT ---

export default function App() {
  // Application State
  const [appState, setAppState] = useState('prejoin'); // 'prejoin' | 'meeting'
  const [userName, setUserName] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  
  // Media State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [mediaError, setMediaError] = useState('');
  
  // Dialog State
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Initialize media on mount
  useEffect(() => {
    initMedia();
    return () => stopMedia();
  }, []);

  const initMedia = async () => {
    try {
      setMediaError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      // setLocalStream(stream);
      setMicOn(true);
      setCamOn(true);
    } catch (error) {
      console.error('Error accessing media devices.', error);
      setMediaError('Unable to access camera or microphone. Please check permissions.');
      setMicOn(false);
      setCamOn(false);
    }
  };

  const stopMedia = () => {
    if (localStream) {
      // localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };


  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
      }
    } else {
      setMicOn(!micOn); // Optimistic UI if stream failed
    }
  };

  const toggleCam = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCamOn(videoTrack.enabled);
      }
    } else if (!localStream && !camOn) {
      // Try initializing again if it was completely blocked/off initially
      initMedia();
    }
  };

  const handleJoinMeeting = () => {
    // Generate a random meeting link
    const randomId = Math.random().toString(36).substring(2, 12).match(/.{1,3}/g)?.join('-') ?? '';
    setMeetingLink(`meet.example.com/${randomId}`);
    
    setAppState('meeting');
    setIsLinkDialogOpen(true);
  };

  const handleLeaveMeeting = () => {
    setAppState('prejoin');
    setIsLinkDialogOpen(false);
    setCopied(false);
    // In a real app, you might want to stop/restart media, but we'll keep it active for the demo loop
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${meetingLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const renderPrejoin = () => (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Video Preview */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative aspect-video bg-zinc-200 rounded-2xl overflow-hidden border border-zinc-200 shadow-xl flex items-center justify-center group">
            
            {camOn && localStream ? (
              <LocalVideo stream={localStream} className="w-full h-full object-cover transform -scale-x-100" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-zinc-500">
                <div className="h-24 w-24 rounded-full bg-zinc-300 flex items-center justify-center shadow-inner">
                  <User className="h-12 w-12 text-zinc-600" />
                </div>
                <span className="text-sm font-medium">Camera is off</span>
              </div>
            )}

            {/* In-video Overlay Controls */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 transition-opacity duration-300">
              <Button 
                variant={micOn ? 'secondary' : 'destructive'} 
                size="icon" 
                onClick={toggleMic}
                className={`h-12 w-12 rounded-full border border-zinc-200 bg-white/90 backdrop-blur-md shadow-sm ${micOn ? 'hover:bg-zinc-100 text-zinc-900' : 'bg-red-600 text-white hover:bg-red-500 border-red-600'}`}
              >
                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button 
                variant={camOn ? 'secondary' : 'destructive'} 
                size="icon" 
                onClick={toggleCam}
                className={`h-12 w-12 rounded-full border border-zinc-200 bg-white/90 backdrop-blur-md shadow-sm ${camOn ? 'hover:bg-zinc-100 text-zinc-900' : 'bg-red-600 text-white hover:bg-red-500 border-red-600'}`}
              >
                {camOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
            </div>
            
            {!micOn && (
              <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur p-2 rounded-full shadow-sm">
                <MicOff className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          
          {mediaError && (
             <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm flex items-center justify-center shadow-sm">
               {mediaError}
             </div>
          )}
        </div>

        {/* Right Side: Join Settings */}
        <div className="lg:col-span-4 flex flex-col gap-8 bg-white p-8 rounded-2xl border border-zinc-200 shadow-lg">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Ready to join?</h1>
            <p className="text-zinc-500 text-sm">No one else is here yet.</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-zinc-700">Your Name</label>
              <Input 
                id="name"
                value={userName} 
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="bg-zinc-50 border-zinc-200 h-12 text-base text-zinc-900 focus-visible:ring-red-500"
              />
            </div>
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
            <Button 
              onClick={handleJoinMeeting} 
              size="lg" 
              className="w-full h-12 text-base font-semibold bg-red-600 text-white hover:bg-red-700"
            >
              Join Meeting
            </Button>
            <Button variant="outline" className="w-full border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100">
              Present to meeting
            </Button>
          </div>
        </div>

      </div>
    </div>
  );


  const renderMeeting = () => (
    <div className="h-screen w-full bg-zinc-100 text-zinc-900 flex flex-col font-sans overflow-hidden">
      
      {/* Top Bar */}
      <header className="h-14 flex items-center justify-between px-6 z-10 absolute top-0 w-full bg-gradient-to-b from-white/80 to-transparent">
        <div className="bg-white/90 backdrop-blur border border-zinc-200 px-3 py-1.5 rounded-md text-xs font-mono text-zinc-700 flex items-center gap-2 shadow-sm">
           <LinkIcon className="h-3 w-3 text-zinc-600" /> {meetingLink.split('/')[1]}
        </div>
      </header>

      {/* Main Video Area */}
      <main className="flex-1 p-4 md:p-6 pb-24 flex items-center justify-center relative">
        <div className="w-full h-full max-w-6xl max-h-[85vh] relative rounded-2xl overflow-hidden border border-zinc-200 shadow-xl bg-white group">
            {camOn && localStream ? (
              <LocalVideo stream={localStream} className="w-full h-full object-cover transform -scale-x-100" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-zinc-100">
                <div className="h-32 w-32 rounded-full bg-red-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
            )}
            
            {/* User Label */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg border border-zinc-200 flex items-center gap-3 shadow-lg">
              <span className="font-medium text-zinc-800">{userName || 'You'}</span>
              {!micOn && <MicOff className="h-4 w-4 text-red-500" />}
            </div>
            
            {/* Outline when speaking (simulated by mic status for demo) */}
            {micOn && (
               <div className="absolute inset-0 border-[3px] border-red-500/40 rounded-2xl pointer-events-none transition-all duration-300" />
            )}
        </div>
      </main>

      {/* Bottom Control Bar */}
      <footer className="absolute bottom-0 w-full h-20 bg-white/95 border-t border-zinc-200 flex items-center justify-center px-4 z-20 shadow-[0_-1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 md:gap-4">
          
          <Button 
            variant={micOn ? 'secondary' : 'destructive'}
            size="icon"
            onClick={toggleMic}
            className={`h-12 w-12 rounded-full border ${micOn ? 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200' : 'bg-red-600 border-red-600 text-white hover:bg-red-500'}`}
          >
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant={camOn ? 'secondary' : 'destructive'}
            size="icon"
            onClick={toggleCam}
            className={`h-12 w-12 rounded-full border ${camOn ? 'bg-zinc-100 border-zinc-200 text-zinc-800 hover:bg-zinc-200' : 'bg-red-600 border-red-600 text-white hover:bg-red-500'}`}
          >
            {camOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button variant="secondary" size="icon" className="h-12 w-12 hidden sm:flex bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200">
            <MonitorUp className="h-5 w-5" />
          </Button>

          <div className="w-px h-8 bg-zinc-200 mx-2 hidden sm:block"></div>

          <Button variant="secondary" size="icon" className="h-12 w-12 bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200 relative">
            <Users className="h-5 w-5" />
            <span className="absolute top-2.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </Button>

          <Button variant="secondary" size="icon" className="h-12 w-12 bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200">
            <MessageSquare className="h-5 w-5" />
          </Button>

          <Button 
            variant="destructive"
            onClick={handleLeaveMeeting}
            className="ml-4 h-12 rounded-full px-6 md:px-8 font-semibold shadow-lg shadow-red-200"
          >
            <PhoneOff className="h-5 w-5 mr-2 hidden sm:inline" />
            End Call
          </Button>
        </div>
      </footer>

      {/* Meeting Ready Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Your meeting is ready</h2>
            <p className="text-sm text-zinc-500">Share this meeting link with others you want in the meeting.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-md p-2 pl-3">
            <span className="flex-1 text-sm text-zinc-700 truncate font-mono">{meetingLink}</span>
            <Button 
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 rounded-md shrink-0 bg-white border border-zinc-200 hover:bg-zinc-100" 
              onClick={copyLink}
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-zinc-600" />}
            </Button>
          </div>
          
          <div className="text-xs text-zinc-500 flex items-center gap-1.5 mt-2">
             <Settings className="h-3 w-3" /> People who use this meeting link must get your permission before they can join.
          </div>
        </div>
      </Dialog>
    </div>
  );


  return (
    <>
      {appState === 'prejoin' && renderPrejoin()}
      {appState === 'meeting' && renderMeeting()}
    </>
  );
}