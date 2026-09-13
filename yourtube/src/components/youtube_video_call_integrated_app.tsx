import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Menu, Search, Mic, Video, Bell, User, MoreVertical, Home, Compass, 
  PlaySquare, Clock, ThumbsUp, PlusCircle, Settings, LogOut,
  MicOff, Camera, CameraOff, MonitorUp, PhoneOff, Hand, MessageSquare, 
  Users, Shield, Wifi, WifiHigh, WifiLow, X, Send, Lock, UserX, UserCheck, CheckCircle2, ChevronRight
} from 'lucide-react';

const MOCK_VIDEOS = Array.from({ length: 12 }).map((_, i) => ({
  id: `vid-${i}`,
  title: `Building the Future of Web Communication ${i + 1}`,
  channel: 'Tech Innovators',
  views: `${Math.floor(Math.random() * 900 + 10)}K views`,
  time: `${Math.floor(Math.random() * 11 + 1)} months ago`,
  thumbnail: `https://picsum.photos/seed/${i + 100}/640/360`,
  avatar: `https://picsum.photos/seed/${i + 200}/100/100`
}));

const INITIAL_PARTICIPANTS = [
  { id: 'p1', name: 'Alice Johnson', isMicOn: true, isCamOn: true, isSpeaking: false, connection: 'high', role: 'co-host' },
  { id: 'p2', name: 'Bob Smith', isMicOn: false, isCamOn: true, isSpeaking: false, connection: 'medium', role: 'guest' },
  { id: 'p3', name: 'Charlie Davis', isMicOn: false, isCamOn: false, isSpeaking: false, connection: 'low', role: 'guest' },
  { id: 'p4', name: 'Diana Prince', isMicOn: true, isCamOn: true, isSpeaking: false, connection: 'high', role: 'guest' }
];

export default function App() {
  // App Routing State
  const [appView, setAppView] = useState('youtube'); // 'youtube', 'pre-join', 'call'
  
  // Call State
  const [roomId, setRoomId] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
  const [callDuration, setCallDuration] = useState(0);
  
  // Sidebar UI State
  const [activePanel, setActivePanel] = useState(null); // 'chat', 'participants', 'settings', 'host'
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Alice Johnson', text: 'Hey everyone! 👋', time: '10:00 AM' }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // Host Settings
  const [isMeetingLocked, setIsMeetingLocked] = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState(false);
  const [blurBackground, setBlurBackground] = useState(false);

  const startLocalStream = async (audio = true, video = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
      setLocalStream(stream);
      setIsMicOn(audio);
      setIsCamOn(video);
    } catch (err) {
      console.error("Failed to get local stream", err);
      alert("Microphone/Camera permission denied or device not found. Simulating experience.");
    }
  };

  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
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
    } else {
      setIsCamOn(!isCamOn);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
        // Replace video track
        const videoTrack = screenStream.getVideoTracks()[0];
        
        videoTrack.onended = () => {
          stopScreenShare();
        };

        setLocalStream(screenStream); // Simplify for this mock, normally you'd manage multiple streams
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

  // Simulate remote participants speaking
  useEffect(() => {
    if (appView !== 'call') return;
    
    const speakingInterval = setInterval(() => {
      setParticipants(prev => prev.map(p => {
        // Only active mic users can "speak"
        if (!p.isMicOn) return { ...p, isSpeaking: false };
        // Randomly toggle speaking state
        return { ...p, isSpeaking: Math.random() > 0.7 };
      }));
    }, 2000);

    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
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
    setRoomId(id || Math.random().toString(36).substring(7));
    setAppView('pre-join');
    startLocalStream();
  };

  const enterMeeting = () => {
    setAppView('call');
    setCallDuration(0);
  };

  const leaveCall = () => {
    stopLocalStream();
    setAppView('youtube');
    setCallDuration(0);
    setActivePanel(null);
    setParticipants(INITIAL_PARTICIPANTS);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, {
      id: Date.now(),
      sender: 'You',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');
  };

  const renderYouTube = () => (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-white overflow-hidden font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-800 rounded-full hidden md:block">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1 cursor-pointer">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <PlaySquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tighter">MyTube</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl px-8 hidden md:flex items-center">
          <div className="flex w-full">
            <div className="flex items-center flex-1 bg-[#121212] border border-gray-700 rounded-l-full px-4 py-2 focus-within:border-blue-500">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search" 
                className="bg-transparent outline-none text-white w-full"
              />
            </div>
            <button className="bg-[#222222] border border-l-0 border-gray-700 rounded-r-full px-5 py-2 hover:bg-gray-800">
              <Search className="w-5 h-5" />
            </button>
          </div>
          <button className="ml-4 p-2 bg-[#181818] rounded-full hover:bg-gray-700">
            <Mic className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <button 
            onClick={() => handleJoinCall('MEET-' + Math.random().toString(36).substring(7).toUpperCase())}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 md:px-4 py-2 rounded-full font-medium transition-colors text-sm md:text-base"
          >
            <Video className="w-5 h-5" />
            <span className="hidden md:inline">Meet / Live</span>
          </button>
          <Bell className="w-6 h-6 hidden md:block cursor-pointer hover:text-gray-300" />
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center cursor-pointer">
            <User className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 hidden xl:flex flex-col p-3 overflow-y-auto border-r border-gray-800 hover:scrollbar-thin">
          <nav className="space-y-1 mb-4 border-b border-gray-800 pb-4">
            {[
              { icon: Home, label: 'Home', active: true },
              { icon: Compass, label: 'Explore' },
              { icon: PlaySquare, label: 'Subscriptions' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer ${item.active ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
                <item.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </nav>
          <nav className="space-y-1">
            {[
              { icon: Clock, label: 'History' },
              { icon: PlaySquare, label: 'Your videos' },
              { icon: Clock, label: 'Watch later' },
              { icon: ThumbsUp, label: 'Liked videos' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl cursor-pointer hover:bg-gray-800">
                <item.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </nav>
        </aside>

        {/* Video Grid */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0f0f0f]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {MOCK_VIDEOS.map(video => (
              <div key={video.id} className="flex flex-col gap-3 cursor-pointer group">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">14:20</span>
                </div>
                <div className="flex gap-3 pr-6">
                  <img src={video.avatar} alt={video.channel} className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <h3 className="text-white font-medium text-sm md:text-base line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">{video.title}</h3>
                    <span className="text-gray-400 text-sm mt-1 hover:text-white">{video.channel}</span>
                    <span className="text-gray-400 text-sm">{video.views} • {video.time}</span>
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
    <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Video Preview */}
        <div className="flex flex-col items-center">
          <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl flex items-center justify-center">
            {isCamOn && localStream ? (
              <LocalVideo stream={localStream} className="w-full h-full object-cover transform -scale-x-100" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-gray-500">
                <CameraOff className="w-16 h-16" />
                <span className="text-lg">Camera is off</span>
              </div>
            )}
            
            {/* Overlay Controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <button 
                onClick={toggleMic}
                className={`p-4 rounded-full ${isMicOn ? 'bg-gray-800/80 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'} backdrop-blur border border-gray-600/50 transition-colors`}
              >
                {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>
              <button 
                onClick={toggleCam}
                className={`p-4 rounded-full ${isCamOn ? 'bg-gray-800/80 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'} backdrop-blur border border-gray-600/50 transition-colors`}
              >
                {isCamOn ? <Camera className="w-6 h-6" /> : <CameraOff className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Join Info */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-4xl font-bold mb-2">Ready to join?</h1>
          <p className="text-gray-400 mb-8">Room ID: <span className="font-mono text-white bg-gray-800 px-2 py-1 rounded">{roomId}</span></p>
          
          <button 
            onClick={enterMeeting}
            className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            Join Meeting <ChevronRight className="w-5 h-5" />
          </button>
          
          <button 
            onClick={leaveCall}
            className="mt-4 text-gray-400 hover:text-white transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  const LocalVideo = ({ stream, className }) => {
    const videoRef = useRef(null);
    useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);
    return <video ref={videoRef} autoPlay playsInline muted className={className} />;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const ConnectionIcon = ({ quality }) => {
    if (quality === 'high') return <WifiHigh className="w-4 h-4 text-green-500" />;
    if (quality === 'medium') return <Wifi className="w-4 h-4 text-yellow-500" />;
    return <WifiLow className="w-4 h-4 text-red-500" />;
  };

  const renderSidebarPanel = () => {
    if (!activePanel) return null;

    return (
      <div className="w-full md:w-80 lg:w-96 bg-[#18181b] border-l border-gray-800 flex flex-col h-full overflow-hidden shrink-0 absolute md:relative right-0 top-0 z-40 transition-all">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#18181b]">
          <h2 className="text-lg font-semibold capitalize">
            {activePanel === 'host' ? 'Host Controls' : activePanel}
          </h2>
          <button onClick={() => setActivePanel(null)} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Chat Panel */}
          {activePanel === 'chat' && (
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-4 overflow-y-auto mb-4 scrollbar-thin">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-500 mb-1">{msg.sender} • {msg.time}</span>
                    <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${msg.sender === 'You' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2 relative mt-auto">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Send a message..."
                  className="flex-1 bg-gray-800 text-white rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  disabled={isMeetingLocked && !['host', 'co-host'].includes(INITIAL_PARTICIPANTS[0].role)}
                />
                <button type="submit" className="absolute right-2 top-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Participants Panel */}
          {activePanel === 'participants' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Users className="w-4 h-4" /> In call ({participants.length + 1})
              </div>
              
              {/* You */}
              <div className="flex items-center justify-between group p-2 hover:bg-gray-800 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">Y</div>
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">You <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">Host</span></p>
                  </div>
                </div>
                <div className="flex gap-2 text-gray-400">
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-red-400" />}
                  {isCamOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4 text-red-400" />}
                </div>
              </div>

              {/* Others */}
              {participants.map(p => (
                <div key={p.id} className="flex items-center justify-between group p-2 hover:bg-gray-800 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${p.name}&backgroundColor=475569`} alt={p.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        {p.name}
                        {p.role === 'co-host' && <Shield className="w-3 h-3 text-blue-400" />}
                      </p>
                      {p.isSpeaking && <p className="text-xs text-green-400">Speaking...</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 text-gray-400 items-center">
                    <ConnectionIcon quality={p.connection} />
                    {p.isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-red-400" />}
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                      <button className="p-1 hover:text-red-400"><UserX className="w-4 h-4" title="Remove" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Settings / Host Panel */}
          {(activePanel === 'settings' || activePanel === 'host') && (
            <div className="space-y-6">
              {activePanel === 'host' && (
                <div className="bg-gray-800 p-4 rounded-xl space-y-4">
                  <h3 className="font-medium text-blue-400 flex items-center gap-2"><Shield className="w-4 h-4" /> Security</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lock Meeting</span>
                    <button 
                      onClick={() => setIsMeetingLocked(!isMeetingLocked)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${isMeetingLocked ? 'bg-blue-600' : 'bg-gray-600'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isMeetingLocked ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Mute All Participants
                  </button>
                </div>
              )}

              <div className="bg-gray-800 p-4 rounded-xl space-y-4">
                <h3 className="font-medium flex items-center gap-2"><Settings className="w-4 h-4" /> Audio & Video</h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Noise Suppression</span>
                  <button onClick={() => setNoiseSuppression(!noiseSuppression)} className={`w-12 h-6 rounded-full transition-colors relative ${noiseSuppression ? 'bg-blue-600' : 'bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${noiseSuppression ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Blur Background</span>
                  <button onClick={() => setBlurBackground(!blurBackground)} className={`w-12 h-6 rounded-full transition-colors relative ${blurBackground ? 'bg-blue-600' : 'bg-gray-600'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${blurBackground ? 'left-7' : 'left-1'}`} />
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
    // Calculate grid columns based on number of participants (including local user)
    const totalUsers = participants.length + 1;
    let gridCols = "grid-cols-1";
    if (totalUsers >= 2 && totalUsers <= 4) gridCols = "grid-cols-1 md:grid-cols-2";
    if (totalUsers >= 5) gridCols = "grid-cols-2 md:grid-cols-3";

    return (
      <div className="h-screen w-full bg-[#09090b] text-white flex flex-col font-sans overflow-hidden">
        
        {/* Top Info Bar */}
        <div className="h-12 border-b border-gray-800 flex items-center justify-between px-4 shrink-0 bg-[#09090b]/90 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="font-mono bg-gray-800 px-2 py-0.5 rounded text-sm text-gray-300">Room: {roomId}</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
            <div className="flex items-center gap-1.5 bg-gray-800 px-3 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {formatTime(callDuration)}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Video Grid */}
          <div className={`flex-1 p-2 md:p-4 grid ${gridCols} gap-2 md:gap-4 overflow-y-auto content-center justify-center transition-all ${activePanel ? 'hidden md:grid' : ''}`}>
            
            {/* Local User */}
            <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden border-2 border-transparent shadow-lg max-h-[80vh] mx-auto w-full group">
              {isCamOn && localStream ? (
                <LocalVideo stream={localStream} className={`w-full h-full object-cover transform -scale-x-100 ${blurBackground ? 'blur-sm' : ''}`} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold">Y</div>
                </div>
              )}
              
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                <span className="text-sm font-medium">You (Host)</span>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                {!isMicOn && <div className="bg-red-500/90 p-1.5 rounded-full"><MicOff className="w-4 h-4" /></div>}
                {isHandRaised && <div className="bg-yellow-500/90 p-1.5 rounded-full animate-bounce"><Hand className="w-4 h-4" /></div>}
              </div>
            </div>

            {/* Remote Users */}
            {participants.map(p => (
              <div key={p.id} className={`relative aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-lg max-h-[80vh] mx-auto w-full transition-all duration-300 border-2 ${p.isSpeaking ? 'border-blue-500 shadow-blue-500/20' : 'border-transparent'}`}>
                {p.isCamOn ? (
                   <img src={`https://picsum.photos/seed/${p.name}/800/600`} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                     <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${p.name}&backgroundColor=475569`} alt={p.name} className="w-20 h-20 rounded-full" />
                  </div>
                )}
                
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="text-sm font-medium">{p.name}</span>
                </div>
                
                <div className="absolute top-3 right-3 flex gap-2">
                  <div className="bg-black/50 p-1 rounded-md backdrop-blur">
                    <ConnectionIcon quality={p.connection} />
                  </div>
                  {!p.isMicOn && <div className="bg-red-500/90 p-1.5 rounded-full shadow-sm"><MicOff className="w-4 h-4 text-white" /></div>}
                </div>
              </div>
            ))}
          </div>

          {/* Right Sidebar Panel Overlay/Inline */}
          {renderSidebarPanel()}

        </div>

        {/* Bottom Control Bar */}
        <div className="h-20 bg-[#111111] border-t border-gray-800 flex items-center justify-center px-2 md:px-6 shrink-0 relative z-50">
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Core Controls */}
            <button 
              onClick={toggleMic}
              className={`p-3 md:p-4 rounded-full transition-all ${isMicOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
              title={isMicOn ? "Mute" : "Unmute"}
            >
              {isMicOn ? <Mic className="w-5 h-5 md:w-6 md:h-6" /> : <MicOff className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            
            <button 
              onClick={toggleCam}
              className={`p-3 md:p-4 rounded-full transition-all ${isCamOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
              title={isCamOn ? "Stop Video" : "Start Video"}
            >
              {isCamOn ? <Video className="w-5 h-5 md:w-6 md:h-6" /> : <CameraOff className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            
            <button 
              onClick={toggleScreenShare}
              className={`p-3 md:p-4 rounded-full transition-all ${isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
              title="Share Screen"
            >
              <MonitorUp className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <button 
              onClick={() => setIsHandRaised(!isHandRaised)}
              className={`p-3 md:p-4 rounded-full transition-all ${isHandRaised ? 'bg-yellow-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
              title="Raise Hand"
            >
              <Hand className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-700 mx-1 md:mx-2 hidden sm:block"></div>

            {/* Panel Toggles */}
            <div className="hidden sm:flex gap-2">
              <button onClick={() => setActivePanel(activePanel === 'participants' ? null : 'participants')} className={`p-3 md:p-4 rounded-full transition-all ${activePanel === 'participants' ? 'bg-blue-600/20 text-blue-500' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                <Users className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              <button onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')} className={`p-3 md:p-4 rounded-full transition-all relative ${activePanel === 'chat' ? 'bg-blue-600/20 text-blue-500' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#111111]"></span>
              </button>

              <button onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')} className={`p-3 md:p-4 rounded-full transition-all hidden lg:block ${activePanel === 'settings' ? 'bg-blue-600/20 text-blue-500' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                <Settings className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              <button onClick={() => setActivePanel(activePanel === 'host' ? null : 'host')} className={`p-3 md:p-4 rounded-full transition-all hidden lg:block ${activePanel === 'host' ? 'bg-blue-600/20 text-blue-500' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                <Shield className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            {/* Mobile Dropdown Button (simplified for mockup, acts as toggle for chat on small screens) */}
            <button onClick={() => setActivePanel(activePanel ? null : 'chat')} className="p-3 rounded-full bg-gray-800 text-white sm:hidden">
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Leave Call */}
            <button 
              onClick={leaveCall}
              className="ml-2 md:ml-4 px-6 md:px-8 py-3 md:py-4 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20"
            >
              <PhoneOff className="w-5 h-5 md:w-6 md:h-6" />
              <span className="hidden sm:inline">End Call</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {appView === 'youtube' && renderYouTube()}
      {appView === 'pre-join' && renderPreJoin()}
      {appView === 'call' && renderCall()}
    </>
  );
}