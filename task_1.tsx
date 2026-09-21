import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu,
  Search,
  Mic,
  Video,
  Bell,
  User,
  MoreVertical,
  Home,
  Compass,
  PlaySquare,
  Clock,
  ThumbsUp,
  PlusCircle,
  Settings,
  LogOut,
  MicOff,
  Camera,
  CameraOff,
  MonitorUp,
  PhoneOff,
  Hand,
  MessageSquare,
  Users,
  Shield,
  Wifi,
  WifiHigh,
  WifiLow,
  X,
  Send,
  Lock,
  UserX,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  Info,
  VideoOff,
  Maximize,
} from "lucide-react";

// Reusable shadcn-like Button component
const Button = React.forwardRef(
  (
    {
      className = "",
      variant = "default",
      size = "default",
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const variants = {
      default: "bg-zinc-50 text-zinc-900 hover:bg-zinc-200/90",
      destructive: "bg-red-500 text-zinc-50 hover:bg-red-500/90",
      outline:
        "border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 hover:text-zinc-50 text-zinc-300",
      secondary: "bg-zinc-800 text-zinc-50 hover:bg-zinc-800/80",
      ghost: "hover:bg-zinc-800 hover:text-zinc-50 text-zinc-400",
      link: "text-zinc-50 underline-offset-4 hover:underline",
    };
    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    };
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

// Reusable shadcn-like Input component
const Input = React.forwardRef(({ className = "", type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-50 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      ref={ref}
      {...props}
    />
  );
});

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-zinc-50 text-zinc-900",
    secondary: "bg-zinc-800 text-zinc-50",
    destructive: "bg-red-500 text-zinc-50",
    outline: "text-zinc-50 border border-zinc-800",
  };
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}
    >
      {children}
    </div>
  );
};

const MOCK_VIDEOS = Array.from({ length: 12 }).map((_, i) => ({
  id: `vid-${i}`,
  title: `The Future of WebRTC and Real-time Communications ${i + 1}`,
  channel: "Tech Innovators",
  views: `${Math.floor(Math.random() * 900 + 10)}K views`,
  time: `${Math.floor(Math.random() * 11 + 1)} months ago`,
  thumbnail: `https://picsum.photos/seed/${i + 100}/640/360`,
  avatar: `https://picsum.photos/seed/${i + 200}/100/100`,
}));

const INITIAL_PARTICIPANTS = [
  {
    id: "p1",
    name: "Alice Johnson",
    isMicOn: true,
    isCamOn: true,
    isSpeaking: false,
    connection: "high",
    role: "co-host",
  },
  {
    id: "p2",
    name: "Bob Smith",
    isMicOn: false,
    isCamOn: true,
    isSpeaking: false,
    connection: "medium",
    role: "guest",
  },
  {
    id: "p3",
    name: "Charlie Davis",
    isMicOn: false,
    isCamOn: false,
    isSpeaking: false,
    connection: "low",
    role: "guest",
  },
];

export default function App() {
  // App Routing State
  const [appView, setAppView] = useState("youtube"); // 'youtube', 'pre-join', 'call'
  const [errorMessage, setErrorMessage] = useState("");

  // Call State
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("Guest User");
  const [localStream, setLocalStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
  const [callDuration, setCallDuration] = useState(0);

  // Sidebar UI State
  const [activePanel, setActivePanel] = useState(null); // 'chat', 'participants', 'info'
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: "Alice Johnson",
      text: "Hey everyone! Welcome to the meeting.",
      time: "10:00 AM",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true); // For YouTube view

  // Host Settings
  const [isMeetingLocked, setIsMeetingLocked] = useState(false);

  const startLocalStream = async (audio = true, video = true) => {
    try {
      setErrorMessage("");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio,
        video,
      });
      setLocalStream(stream);
      setIsMicOn(audio);
      setIsCamOn(video);
    } catch (err) {
      console.error("Failed to get local stream", err);
      setErrorMessage(
        "Camera or microphone permission denied. Entering in view-only mode.",
      );
      setIsMicOn(false);
      setIsCamOn(false);
    }
  };

  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    } else {
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCam = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOn(videoTrack.enabled);
      }
    } else if (!localStream && !isCamOn) {
      // Try to start it if it was completely off
      startLocalStream(isMicOn, true);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const videoTrack = screenStream.getVideoTracks()[0];
        videoTrack.onended = () => stopScreenShare();
        setLocalStream(screenStream);
        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    stopLocalStream();
    await startLocalStream(isMicOn, true);
    setIsScreenSharing(false);
  };

  // Simulate remote participants speaking and call duration
  useEffect(() => {
    if (appView !== "call") return;

    const speakingInterval = setInterval(() => {
      setParticipants((prev) =>
        prev.map((p) => {
          if (!p.isMicOn) return { ...p, isSpeaking: false };
          return { ...p, isSpeaking: Math.random() > 0.7 };
        }),
      );
    }, 2500);

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(speakingInterval);
      clearInterval(timer);
    };
  }, [appView]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => stopLocalStream();
  }, []);

  const handleJoinCall = (id) => {
    setRoomId(id || Math.random().toString(36).substring(7, 15).toLowerCase());
    setAppView("pre-join");
    startLocalStream(true, true);
  };

  const enterMeeting = () => {
    setAppView("call");
    setCallDuration(0);
  };

  const leaveCall = () => {
    stopLocalStream();
    setAppView("youtube");
    setCallDuration(0);
    setActivePanel(null);
    setParticipants(INITIAL_PARTICIPANTS);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([
      ...chatMessages,
      {
        id: Date.now(),
        sender: userName,
        text: chatInput,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setChatInput("");
  };

  const toggleParticipantMute = (id) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isMicOn: !p.isMicOn } : p)),
    );
  };

  const removeParticipant = (id) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const LocalVideo = ({ stream, className }) => {
    const videoRef = useRef(null);
    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);
    return (
      <video ref={videoRef} autoPlay playsInline muted className={className} />
    );
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const ConnectionIcon = ({ quality }) => {
    if (quality === "high")
      return <WifiHigh className="w-4 h-4 text-emerald-500" />;
    if (quality === "medium")
      return <Wifi className="w-4 h-4 text-amber-500" />;
    return <WifiLow className="w-4 h-4 text-red-500" />;
  };

  const renderYouTube = () => (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-50 font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex text-zinc-400"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-1.5 cursor-pointer">
            <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center">
              <PlaySquare className="w-5 h-5 text-zinc-950 fill-zinc-950" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              StreamConnect
            </span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl px-8 hidden md:flex items-center">
          <div className="flex w-full items-center bg-zinc-900 border border-zinc-800 rounded-full focus-within:ring-1 focus-within:ring-zinc-700 focus-within:border-zinc-700 overflow-hidden">
            <div className="pl-4 pr-2">
              <Search className="w-4 h-4 text-zinc-500" />
            </div>
            <input
              type="text"
              placeholder="Search videos, channels, or meetings..."
              className="bg-transparent outline-none text-sm text-zinc-100 w-full py-2 placeholder:text-zinc-500"
            />
            <Button
              variant="secondary"
              className="rounded-none rounded-r-full h-full border-l border-zinc-800 px-5"
            >
              Search
            </Button>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="ml-3 rounded-full shrink-0 bg-zinc-900"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            onClick={() => handleJoinCall()}
            className="flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            <span className="hidden sm:inline">New Meeting</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex text-zinc-400"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center cursor-pointer ml-1">
            <User className="w-4 h-4 text-zinc-300" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "w-64" : "w-20"} hidden md:flex flex-col py-3 overflow-y-auto border-r border-zinc-800 transition-all duration-300 ease-in-out shrink-0`}
        >
          <nav className="space-y-1 px-3 mb-4">
            {[
              { icon: Home, label: "Home", active: true },
              { icon: Compass, label: "Explore" },
              { icon: PlaySquare, label: "Subscriptions" },
            ].map((item, i) => (
              <Button
                key={i}
                variant={item.active ? "secondary" : "ghost"}
                className={`w-full justify-start ${!sidebarOpen && "justify-center px-0"}`}
              >
                <item.icon
                  className={`w-5 h-5 ${sidebarOpen ? "mr-3" : "m-0"} ${item.active ? "text-zinc-50" : "text-zinc-400"}`}
                />
                {sidebarOpen && <span>{item.label}</span>}
              </Button>
            ))}
          </nav>
          <div className="border-t border-zinc-800 my-2" />
          <nav className="space-y-1 px-3">
            {[
              { icon: Clock, label: "History" },
              { icon: PlaySquare, label: "Your videos" },
              { icon: ThumbsUp, label: "Liked videos" },
            ].map((item, i) => (
              <Button
                key={i}
                variant="ghost"
                className={`w-full justify-start ${!sidebarOpen && "justify-center px-0"}`}
              >
                <item.icon
                  className={`w-5 h-5 ${sidebarOpen ? "mr-3" : "m-0"} text-zinc-400`}
                />
                {sidebarOpen && <span>{item.label}</span>}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 flex justify-around p-2 z-20">
          {[Home, Compass, PlusCircle, PlaySquare, User].map((Icon, i) => (
            <Button
              key={i}
              variant="ghost"
              size="icon"
              className={
                i === 2
                  ? "text-zinc-50 border border-zinc-700"
                  : "text-zinc-400"
              }
            >
              <Icon className="w-5 h-5" />
            </Button>
          ))}
        </nav>

        {/* Video Grid */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6 scroll-smooth">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {MOCK_VIDEOS.map((video) => (
              <div
                key={video.id}
                className="flex flex-col gap-3 group cursor-pointer"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/50">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Badge
                    variant="secondary"
                    className="absolute bottom-2 right-2 px-1.5 py-0 text-[10px] bg-zinc-950/80 backdrop-blur"
                  >
                    14:20
                  </Badge>
                </div>
                <div className="flex gap-3 pr-4">
                  <img
                    src={video.avatar}
                    alt={video.channel}
                    className="w-9 h-9 rounded-full object-cover bg-zinc-800 shrink-0"
                  />
                  <div className="flex flex-col overflow-hidden">
                    <h3 className="text-zinc-100 font-medium text-sm line-clamp-2 leading-tight group-hover:text-zinc-300">
                      {video.title}
                    </h3>
                    <div className="text-zinc-400 text-xs mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="hover:text-zinc-300 truncate">
                        {video.channel}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">
                        {video.views} • {video.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );

  const renderPreJoin = () => (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full flex flex-col md:flex-row gap-8 items-center bg-zinc-900/50 p-6 md:p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        {/* Left: Video Preview Card */}
        <div className="w-full md:w-3/5 flex flex-col">
          <div className="relative aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 shadow-inner flex items-center justify-center">
            {isCamOn && localStream ? (
              <LocalVideo
                stream={localStream}
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-zinc-600">
                <CameraOff className="w-12 h-12" />
                <span className="text-sm font-medium">
                  Camera is turned off
                </span>
              </div>
            )}

            {/* Embedded Controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              <Button
                variant={isMicOn ? "secondary" : "destructive"}
                size="icon"
                onClick={toggleMic}
                className="rounded-full h-12 w-12 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 hover:bg-zinc-800"
              >
                {isMicOn ? (
                  <Mic className="w-5 h-5" />
                ) : (
                  <MicOff className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant={isCamOn ? "secondary" : "destructive"}
                size="icon"
                onClick={toggleCam}
                className="rounded-full h-12 w-12 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 hover:bg-zinc-800"
              >
                {isCamOn ? (
                  <Camera className="w-5 h-5" />
                ) : (
                  <CameraOff className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-950/50 border border-red-900/50 rounded-md text-red-200 text-sm text-center">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Right: Meeting Details & Actions */}
        <div className="w-full md:w-2/5 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-50 mb-2">
              Ready to join?
            </h1>
            <p className="text-zinc-400 text-sm">
              Configure your audio and video before entering the room.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 text-left w-full">
                Your Name
              </label>
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="bg-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300 text-left w-full">
                Meeting ID
              </label>
              <div className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-zinc-500 font-mono text-sm">
                {roomId}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={enterMeeting}
              size="lg"
              className="w-full text-base"
            >
              Join Meeting
            </Button>
            <Button variant="ghost" onClick={leaveCall} className="w-full">
              Cancel and Return
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSidebarPanel = () => {
    if (!activePanel) return null;

    return (
      <div className="absolute md:relative right-0 top-0 h-full w-full sm:w-80 lg:w-96 bg-zinc-950 border-l border-zinc-800 flex flex-col z-40 transition-all shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
          <h2 className="text-base font-semibold capitalize text-zinc-100 flex items-center gap-2">
            {activePanel === "chat" && <MessageSquare className="w-4 h-4" />}
            {activePanel === "participants" && <Users className="w-4 h-4" />}
            {activePanel === "info" && <Info className="w-4 h-4" />}
            {activePanel}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActivePanel(null)}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Chat Panel */}
          {activePanel === "chat" && (
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-4 overflow-y-auto mb-4 scrollbar-thin">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === userName ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[10px] font-medium text-zinc-500 mb-1">
                      {msg.sender} • {msg.time}
                    </span>
                    <div
                      className={`px-3 py-2 rounded-2xl max-w-[85%] text-sm ${msg.sender === userName ? "bg-zinc-100 text-zinc-900 rounded-tr-sm" : "bg-zinc-800 text-zinc-100 rounded-tl-sm border border-zinc-700"}`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={handleSendMessage}
                className="flex gap-2 relative mt-auto pt-2 border-t border-zinc-800"
              >
                <Input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Message everyone..."
                  className="pr-10"
                  disabled={isMeetingLocked}
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="secondary"
                  className="absolute right-0 top-2 h-10 w-10 bg-transparent hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}

          {/* Participants Panel */}
          {activePanel === "participants" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-zinc-400 mb-3 px-1">
                  <span>In Meeting ({participants.length + 1})</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-zinc-300"
                  >
                    Mute All
                  </Button>
                </div>

                {/* You */}
                <div className="flex items-center justify-between group p-2 hover:bg-zinc-900 rounded-lg transition-colors border border-transparent hover:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-zinc-50 text-xs">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <p className="font-medium text-sm text-zinc-100 flex items-center gap-2">
                        {userName} (You)
                        <Badge
                          variant="secondary"
                          className="px-1.5 py-0 text-[10px]"
                        >
                          Host
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-zinc-500">
                    {isMicOn ? (
                      <Mic className="w-4 h-4" />
                    ) : (
                      <MicOff className="w-4 h-4 text-red-400" />
                    )}
                    {isCamOn ? (
                      <Camera className="w-4 h-4" />
                    ) : (
                      <CameraOff className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>

                {/* Others */}
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between group p-2 hover:bg-zinc-900 rounded-lg transition-colors border border-transparent hover:border-zinc-800"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${p.name}&backgroundColor=27272a`}
                        alt={p.name}
                        className="w-8 h-8 rounded-full ring-1 ring-zinc-800"
                      />
                      <div className="flex flex-col">
                        <p className="font-medium text-sm text-zinc-100 flex items-center gap-2">
                          {p.name}
                          {p.role === "co-host" && (
                            <Shield className="w-3 h-3 text-indigo-400" />
                          )}
                        </p>
                        {p.isSpeaking && (
                          <p className="text-[10px] text-emerald-400 font-medium">
                            Speaking...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 text-zinc-500 items-center">
                      <ConnectionIcon quality={p.connection} />
                      {p.isMicOn ? (
                        <Mic className="w-4 h-4" />
                      ) : (
                        <MicOff className="w-4 h-4 text-red-400" />
                      )}

                      {/* Host Actions Dropdown Simulation */}
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleParticipantMute(p.id)}
                          className="h-6 w-6 text-zinc-400 hover:text-zinc-100"
                        >
                          {p.isMicOn ? (
                            <MicOff className="w-3 h-3" />
                          ) : (
                            <Mic className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeParticipant(p.id)}
                          className="h-6 w-6 text-zinc-400 hover:text-red-400"
                        >
                          <UserX className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info/Security Panel */}
          {activePanel === "info" && (
            <div className="space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-4">
                <h3 className="font-medium text-sm text-zinc-100 flex items-center gap-2">
                  Meeting Details
                </h3>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500">Meeting Link</p>
                  <div className="flex gap-2">
                    <Input
                      value={`streamconnect.app/${roomId}`}
                      readOnly
                      className="h-8 text-xs bg-zinc-950"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs shrink-0"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-4">
                <h3 className="font-medium text-sm text-zinc-100 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Host Controls
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">Lock Meeting</span>
                  <button
                    onClick={() => setIsMeetingLocked(!isMeetingLocked)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${isMeetingLocked ? "bg-indigo-500" : "bg-zinc-700"}`}
                  >
                    <div
                      className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform ${isMeetingLocked ? "left-[22px]" : "left-[3px]"}`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">
                    Allow Screen Share
                  </span>
                  <button className="w-10 h-5 rounded-full transition-colors relative bg-indigo-500">
                    <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-transform left-[22px]" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCall = () => {
    // Dynamic Grid calculation
    const totalUsers = participants.length + 1;
    let gridClass = "grid-cols-1";
    if (totalUsers === 2) gridClass = "grid-cols-1 md:grid-cols-2";
    if (totalUsers >= 3 && totalUsers <= 4) gridClass = "grid-cols-2";
    if (totalUsers >= 5) gridClass = "grid-cols-2 md:grid-cols-3";

    return (
      <div className="h-screen w-full bg-zinc-950 text-zinc-50 flex flex-col font-sans overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-zinc-800/60 flex items-center justify-between px-4 shrink-0 bg-zinc-950/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="gap-1.5 border-zinc-700 bg-zinc-900/50"
            >
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="font-mono text-zinc-300">{roomId}</span>
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-zinc-300 tabular-nums">
                {formatTime(callDuration)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setActivePanel(activePanel === "info" ? null : "info")
              }
              className="h-8 w-8 text-zinc-400"
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Content Area (Grid + Sidebar) */}
        <div className="flex-1 flex overflow-hidden relative p-2 md:p-4 gap-4">
          {/* Video Grid */}
          <div
            className={`flex-1 grid ${gridClass} gap-3 md:gap-4 overflow-y-auto content-center justify-center transition-all min-h-0`}
          >
            {/* Local User Card */}
            <div className="relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-lg aspect-video max-h-[80vh] w-full group">
              {isCamOn && localStream ? (
                <LocalVideo
                  stream={localStream}
                  className={`w-full h-full object-cover transform -scale-x-100 ${isScreenSharing ? "object-contain bg-zinc-950" : ""}`}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 gap-4">
                  <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-zinc-50">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}

              {/* Local User Overlays */}
              <div className="absolute bottom-3 left-3 bg-zinc-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800/50 flex items-center gap-2 shadow-sm">
                <span className="text-sm font-medium text-zinc-100">
                  {userName} (You)
                </span>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                {!isMicOn && (
                  <div className="bg-red-500/90 backdrop-blur p-1.5 rounded-md shadow-sm border border-red-500/20">
                    <MicOff className="w-4 h-4 text-white" />
                  </div>
                )}
                {isHandRaised && (
                  <div className="bg-amber-500/90 backdrop-blur p-1.5 rounded-md shadow-sm border border-amber-500/20">
                    <Hand className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Speaking Indicator Ring */}
              {isMicOn && (
                <div className="absolute inset-0 border-2 border-transparent transition-colors duration-300 pointer-events-none rounded-2xl group-hover:border-zinc-700/50" />
              )}
            </div>

            {/* Remote Participants Cards */}
            {participants.map((p) => (
              <div
                key={p.id}
                className={`relative bg-zinc-900 rounded-2xl overflow-hidden shadow-lg aspect-video max-h-[80vh] w-full transition-all duration-300 border-2 ${p.isSpeaking ? "border-emerald-500 shadow-emerald-500/10" : "border-zinc-800"}`}
              >
                {p.isCamOn ? (
                  <img
                    src={`https://picsum.photos/seed/${p.name}/800/600`}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${p.name}&backgroundColor=27272a`}
                      alt={p.name}
                      className="w-20 h-20 rounded-full ring-4 ring-zinc-800"
                    />
                  </div>
                )}

                {/* Remote User Overlays */}
                <div className="absolute bottom-3 left-3 bg-zinc-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800/50 flex items-center gap-2 shadow-sm">
                  <span className="text-sm font-medium text-zinc-100">
                    {p.name}
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex gap-2">
                  <div className="bg-zinc-950/70 backdrop-blur p-1.5 rounded-md border border-zinc-800/50">
                    <ConnectionIcon quality={p.connection} />
                  </div>
                  {!p.isMicOn && (
                    <div className="bg-red-500/90 backdrop-blur p-1.5 rounded-md shadow-sm border border-red-500/20">
                      <MicOff className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Area */}
          {renderSidebarPanel()}
        </div>

        {/* Bottom Control Bar */}
        <div className="h-20 bg-zinc-950 border-t border-zinc-800/60 flex items-center justify-center px-4 shrink-0 relative z-50">
          <div className="flex items-center gap-3 md:gap-4">
            {/* AV Controls */}
            <Button
              variant={isMicOn ? "secondary" : "destructive"}
              size="icon"
              onClick={toggleMic}
              className="rounded-full h-11 w-11 md:h-12 md:w-12 shadow-sm"
              title={isMicOn ? "Mute" : "Unmute"}
            >
              {isMicOn ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant={isCamOn ? "secondary" : "destructive"}
              size="icon"
              onClick={toggleCam}
              className="rounded-full h-11 w-11 md:h-12 md:w-12 shadow-sm"
              title={isCamOn ? "Stop Video" : "Start Video"}
            >
              {isCamOn ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size="icon"
              onClick={toggleScreenShare}
              className="rounded-full h-11 w-11 md:h-12 md:w-12 shadow-sm hidden sm:flex"
              title="Share Screen"
            >
              <MonitorUp className="w-5 h-5" />
            </Button>

            <Button
              variant={isHandRaised ? "outline" : "secondary"}
              size="icon"
              onClick={() => setIsHandRaised(!isHandRaised)}
              className={`rounded-full h-11 w-11 md:h-12 md:w-12 shadow-sm ${isHandRaised ? "bg-amber-500/20 border-amber-500/50 text-amber-500 hover:bg-amber-500/30" : ""}`}
              title="Raise Hand"
            >
              <Hand className="w-5 h-5" />
            </Button>

            {/* Divider */}
            <div className="w-px h-8 bg-zinc-800 mx-1 md:mx-2"></div>

            {/* Panel Toggles */}
            <div className="flex gap-2">
              <Button
                variant={
                  activePanel === "participants" ? "default" : "secondary"
                }
                size="icon"
                onClick={() =>
                  setActivePanel(
                    activePanel === "participants" ? null : "participants",
                  )
                }
                className="rounded-full h-11 w-11 md:h-12 md:w-12 shadow-sm"
              >
                <Users className="w-5 h-5" />
              </Button>

              <Button
                variant={activePanel === "chat" ? "default" : "secondary"}
                size="icon"
                onClick={() =>
                  setActivePanel(activePanel === "chat" ? null : "chat")
                }
                className="rounded-full h-11 w-11 md:h-12 md:w-12 shadow-sm relative"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-zinc-950"></span>
              </Button>
            </div>

            {/* Leave Call */}
            <Button
              variant="destructive"
              onClick={leaveCall}
              className="ml-2 md:ml-4 rounded-full h-11 md:h-12 px-6 shadow-lg shadow-red-900/20"
            >
              <PhoneOff className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline font-semibold">End Call</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {appView === "youtube" && renderYouTube()}
      {appView === "pre-join" && renderPreJoin()}
      {appView === "call" && renderCall()}
    </>
  );
}
