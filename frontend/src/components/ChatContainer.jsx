import { motion } from 'framer-motion'
import { HiSparkles, HiPencil } from 'react-icons/hi'
import { FaUser, FaDownload, FaRegCopy } from 'react-icons/fa'
import { TbCopyCheckFilled } from 'react-icons/tb'
import MessageInput from './MessageInput'
import Sidebar from './Sidebar'
import ChatHistory from './ChatHistory'
import Settings from './Settings'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import React, { useState, useEffect, useRef, useContext, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { ThemeContext } from '../App'

const API_URL = import.meta.env.VITE_API_URL 
const backend_url = import.meta.env.VITE_BACKEND_URL 

const ModernAudioPlayer = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 15);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // Generate bars pattern that exactly matches the image
  const generateBars = () => {
    const bars = [];
    const numberOfBars = 35; // Adjusted to match image exactly
    
    for (let i = 0; i < numberOfBars; i++) {
      let height;
      const center = numberOfBars / 2;
      const distanceFromCenter = Math.abs(i - center);
      
      // Create exact wave pattern from the image
      if (distanceFromCenter < 3) {
        // Deepest dip in center
        height = 6;
      } else if (distanceFromCenter < 6) {
        // First rise from center
        height = 15;
      } else if (distanceFromCenter < 9) {
        // Second level
        height = 22;
      } else if (distanceFromCenter < 12) {
        // Third level
        height = 18;
      } else {
        // Outer edges
        height = 12;
      }
      
      bars.push(height);
    }
    
    return bars;
  };

  const bars = useMemo(generateBars, [url]);
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="bg-[#2a2a2a] rounded-xl overflow-hidden max-w-sm">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />
      
      {/* Header section */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="bg-[#cc2b5e] w-12 h-12 rounded-full flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </div>
          <div className="text-white">
            <div className="font-semibold">Generated Audio</div>
            <div className="text-sm text-white/70">Vaani.pro</div>
          </div>
        </div>
        
        <a 
          href={url} 
          download
          className="bg-[#cc2b5e] w-10 h-10 rounded-full flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
      
      {/* Waveform visualization */}
      <div className="px-4 py-2">
        <div className="h-16 flex items-center justify-center">
          <div className="w-full flex items-end justify-center gap-[2px]">
            {bars.map((height, i) => {
              const isPlayed = (i / bars.length) * 100 <= progressPercent;
              
              return (
                <div
                  key={i}
                  className={`w-[3px] ${isPlayed ? 'bg-[#cc2b5e]' : 'bg-[#384759]'}`}
                  style={{ 
                    height: `${height}px`,
                    transition: 'background-color 0.2s ease'
                  }}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Player controls */}
      <div className="flex items-center p-4 pt-2">
        <button
          onClick={togglePlay}
          className="bg-[#cc2b5e] w-12 h-12 rounded-full flex items-center justify-center mr-4"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white">
              <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <div className="flex-1 flex items-center space-x-2">
          <span className="text-white text-sm">
            {formatTime(progress)}
          </span>
          
          <div className="flex-1 relative h-1 bg-gray-700 rounded-full">
            <input
              type="range"
              min="0"
              max={duration || 15}
              value={progress}
              step="0.01"
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute h-1 bg-[#cc2b5e] rounded-full" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          
          <span className="text-white text-sm">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

const ChatContainer = () => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [threadId, setThreadId] = useState(null)
  const messagesEndRef = useRef(null)
  const [agentStatus, setAgentStatus] = useState("")
  const [isGeneratingMedia, setIsGeneratingMedia] = useState(false)
  const [generatingMediaType, setGeneratingMediaType] = useState(null)
  const [mediaType, setMediaType] = useState(null)
  const { user } = useAuth()
  const [chatTitle, setChatTitle] = useState("New Chat")
  const [conversations, setConversations] = useState([])
  const { theme } = useContext(ThemeContext)
  const [isLoadingChat, setIsLoadingChat] = useState(false)

  
  // Add these missing useRef declarations
  const chatIdRef = useRef(`temp_${Date.now()}`)
  const saveInProgress = useRef(false)

  // Add this state for the selected model
  const [model, setModel] = useState("gemini-1.5-flash")

  // Add these state variables
  const [useAgent, setUseAgent] = useState(false);
  const [deepResearch, setDeepResearch] = useState(false);

  // Add a ref to store the original lastUpdated timestamp
  const chatLastUpdatedRef = useRef(null);

  // Modify the scrollToBottom function to be smoother and less frequent
  const scrollToBottom = () => {
    const options = {
      behavior: 'smooth',
      block: 'end',
    };
    
    // Use requestAnimationFrame to debounce the scroll
    if (!scrollToBottom.isScrolling) {
      scrollToBottom.isScrolling = true;
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView(options);
        scrollToBottom.isScrolling = false;
      });
    }
  };
  scrollToBottom.isScrolling = false;

  // Modify the useEffect for scrolling
  useEffect(() => {
    // Only scroll if the last message is from the assistant or if it's a new message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && (!lastMessage.isTemporary || lastMessage.role === 'user')) {
      scrollToBottom();
    }
  }, [messages]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible)
  }

  const predefinedPrompts = [
    {
      id: 1,
      title: "General Assistant",
      prompt: "Hi! I'd love to learn more about what you can help me with. What are your capabilities?"
    },
    {
      id: 2,
      title: "Writing Help",
      prompt: "Can you help me improve my writing skills? I'd like some tips and guidance."
    },
    {
      id: 3,
      title: "Code Assistant",
      prompt: "I need help with programming. Can you explain how you can assist with coding?"
    }
  ];

  const handlePromptClick = (promptItem) => {
    // Add prompt as user message
    const userMessage = {
      role: 'user',
      content: promptItem.prompt
    }
    handleSendMessage(userMessage)
  }

  const handleReactAgentStreamingRequest = async (message, options = {}) => {
    if (message.role === 'user') {
      setIsLoading(true);
      setAgentStatus("Initializing research agent...");
      
      const controller = new AbortController();
      const signal = controller.signal;
      
      try {
        const response = await fetch(`${API_URL}/api/react-search-streaming`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, message],
            model: options.model,
            thread_id: threadId,
            file_url: options.file_url,
            max_search_results: options.deep_research ? 5 : 3
          }),
          signal
        });
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        const tempMessageId = Date.now();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Researching...',
          isTemporary: true,
          id: tempMessageId
        }]);
        
        // Add buffer for accumulating partial JSON chunks
        let buffer = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          buffer += chunk;
          
          // Try to extract complete JSON objects from buffer
          let lastNewlineIndex = 0;
          let newlineIndex;
          
          while ((newlineIndex = buffer.indexOf('\n', lastNewlineIndex)) !== -1) {
            const line = buffer.substring(lastNewlineIndex, newlineIndex).trim();
            lastNewlineIndex = newlineIndex + 1;
            
            if (!line) continue;
            
            try {
              const data = JSON.parse(line);
              
              if (data.type === 'status') {
                setAgentStatus(data.status);
              } 
              else if (data.type === 'result') {
                await new Promise(resolve => setTimeout(resolve, 500));
                setMessages(prev => {
                  const newMessages = prev.filter(msg => msg.id !== tempMessageId).concat([data.message]);
                  saveChat(newMessages);
                  return newMessages;
                });
            
                if (!threadId && data.thread_id) {
                  setThreadId(data.thread_id);
                  chatIdRef.current = data.thread_id;
                }
              }
            } catch (parseError) {
              console.error("Error parsing stream data:", parseError);
              // Just log the error and continue, don't break the stream
            }
          }
          
          // Keep any remaining incomplete data in the buffer
          buffer = buffer.substring(lastNewlineIndex);
        }
      } catch (error) {
        console.error("Error with streaming react-agent:", error);
        setMessages(prev => prev.filter(msg => !msg.isTemporary));
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Sorry, I encountered an error with the research agent. Please try again.'
        }]);
      } finally {
        setIsLoading(false);
        setAgentStatus("");
      }
    }
  };

  const fetchChatHistory = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`${backend_url}/api/chat/history/all`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const allChats = [
          ...response.data.categories.today,
          ...response.data.categories.yesterday,
          ...response.data.categories.lastWeek,
          ...response.data.categories.lastMonth,
          ...response.data.categories.older,
        ];
        
        setConversations(allChats);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user]);
  
  const saveChat = async (currentMessages = messages) => {
    if (!user || currentMessages.length === 0 || !currentMessages.some(m => m.role === 'user') || isLoadingChat) return;
    
    if (saveInProgress.current) {
      return;
    }
    
    // Don't save if the last message is temporary
    if (currentMessages[currentMessages.length - 1]?.isTemporary) {
      return;
    }
    
    saveInProgress.current = true;
    
    try {
      const chatId = threadId || chatIdRef.current;
      let title = chatTitle;
      if (title === "New Chat" && currentMessages.length > 0) {
        const firstUserMsg = currentMessages.find(m => m.role === 'user');
        if (firstUserMsg) {
          title = firstUserMsg.content.substring(0, 30);
          if (firstUserMsg.content.length > 30) title += "...";
        }
      }
      
      // Filter out temporary messages before saving
      const messagesToSave = currentMessages.filter(msg => !msg.isTemporary);
      
      
      // Check if this is just a chat load or an actual update with new messages
      const isJustLoading = chatLastUpdatedRef.current && 
                           !chatId.startsWith('temp_') && 
                           !chatId.startsWith('new_');
      
      // Choose the right endpoint - update for existing chats, save for new ones
      let response;
      
      if (chatId && !chatId.startsWith('temp_') && !chatId.startsWith('new_')) {
        // Use the update endpoint for existing chats
        response = await axios.put(`${backend_url}/api/chat/${chatId}/update`, {
          title,
          messages: JSON.parse(JSON.stringify(messagesToSave)),
          preserveTimestamp: isJustLoading // Preserve timestamp when just loading
        }, {
          withCredentials: true
        });
      } else {
        // Use save endpoint for new chats
        response = await axios.post(`${backend_url}/api/chat/save`, {
          chatId,
          title,
          messages: JSON.parse(JSON.stringify(messagesToSave)),
        }, {
          withCredentials: true
        });
      }
      
      if (response.data.success) {
        if (response.data.chat.id && (!threadId || threadId.startsWith('temp_'))) {
          setThreadId(response.data.chat.id);
          chatIdRef.current = response.data.chat.id;
        }
        fetchChatHistory();
        
        // If we were using a temporary title, update with the one from server
        if (title === "New Chat" || title.endsWith("...")) {
          setChatTitle(response.data.chat.title);
        }
        
        // Store the last updated timestamp from response
        chatLastUpdatedRef.current = response.data.chat.lastUpdated;
      }
    } catch (error) {
      console.error("Error saving chat:", error);
      // Could add user feedback here with a toast notification
    } finally {
      saveInProgress.current = false;
    }
  };
  
  useEffect(() => {
    if (!user || messages.length === 0 || !messages.some(m => m.role === 'user') || isLoadingChat) return;
    
    // Don't save if the last message is temporary
    if (messages[messages.length - 1]?.isTemporary) return;
    
    const saveTimer = setTimeout(() => {
      saveChat(messages);
    }, 2000); // Increased from 1000 to 2000ms
    
    return () => clearTimeout(saveTimer);
  }, [messages, user]);

  useEffect(() => {
    if (isGeneratingMedia) {
      const timeoutId = setTimeout(() => {
        setIsGeneratingMedia(false);
        setGeneratingMediaType(null);
      }, 30000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isGeneratingMedia]);

  useEffect(() => {
    if (isGeneratingMedia && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        const content = lastMessage.content || '';
        const containsImageUrl = 
          content.includes('.jpg') || 
          content.includes('.jpeg') || 
          content.includes('.png') || 
          content.includes('.gif') || 
          content.includes('replicate.delivery') ||
          content.includes('image-url');
          
        const containsMusicUrl = 
          content.includes('.mp3') || 
          content.includes('.wav') || 
          content.includes('musicfy.lol') ||
          content.includes('audio-url');
        
        if (containsImageUrl || containsMusicUrl) {
          setIsGeneratingMedia(false);
          setGeneratingMediaType(null);
        }
      }
    }
  }, [messages, isGeneratingMedia]);

  const handleChatStreamingRequest = async (message, options = {}) => {
    if (message.role === 'user') {
      setIsLoading(true);
      
      const messageText = message.content.toLowerCase();
      const isMediaRequest = 
        (messageText.includes('generate') || 
         messageText.includes('create') || 
         messageText.includes('make')) &&
        (messageText.includes('image') || 
         messageText.includes('picture') ||
         messageText.includes('music') ||
         messageText.includes('audio') ||
         messageText.includes('song'));
      
      // Don't add temporary message for media requests to avoid conflicts
      if (!isMediaRequest && !isGeneratingMedia) {
        const tempMessageId = Date.now();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '',
          isTemporary: true,
          id: tempMessageId
        }]);
      }
      
      try {
        console.log("Making streaming request with options:", {
          model: options.model,
          thread_id: threadId,
          use_agent: options.use_agent || false,
          stream: true,
          isMediaRequest,
          isGeneratingMedia
        });
        
        const response = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, message],
            model: options.model,
            thread_id: threadId,
            file_url: options.file_url,
            use_agent: options.use_agent || false,
            deep_research: false,
            stream: true
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error (${response.status}):`, errorText);
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let fullResponse = "";
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            if (!line.trim()) continue;
            
            try {
              const data = JSON.parse(line);
              
              if (data.type === "status") {
                setAgentStatus(data.status);
              }
              else if (data.type === "chunk") {
                // Fix: Accumulate chunks properly for streaming text
                if (!isMediaRequest && !isGeneratingMedia) {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const tempIndex = newMessages.findIndex(msg => msg.isTemporary);
                    
                    if (tempIndex >= 0) {
                      newMessages[tempIndex] = {
                        ...newMessages[tempIndex],
                        content: newMessages[tempIndex].content + data.chunk
                      };
                    } else {
                      newMessages.push({
                        role: 'assistant',
                        content: data.chunk,
                        isTemporary: true,
                        id: Date.now()
                      });
                    }
                    
                    return newMessages;
                  });
                } else {
                  fullResponse += data.chunk;
                }
              }
              else if (data.type === "done") {
                // Mark the message as permanent when done
                setMessages(prev => {
                  const newMessages = prev.map(msg => 
                    msg.isTemporary ? { ...msg, isTemporary: false } : msg
                  );
                  saveChat(newMessages);
                  return newMessages;
                });
                
                if (!threadId && data.thread_id) {
                  setThreadId(data.thread_id);
                  chatIdRef.current = data.thread_id;
                }
                
                setIsLoading(false);
                setAgentStatus("");
              }
              else if (data.type === "result") {
                const content = data.message?.content || '';
                
                const containsImageUrl = 
                  content.includes('.jpg') || 
                  content.includes('.jpeg') || 
                  content.includes('.png') || 
                  content.includes('.gif') || 
                  content.includes('replicate.delivery') ||
                  content.includes('image-url') ||
                  /!\[.*?\]\(https?:\/\/\S+\)/i.test(content);
                  
                const containsMusicUrl = 
                  content.includes('.mp3') || 
                  content.includes('.wav') || 
                  content.includes('musicfy.lol') ||
                  content.includes('audio-url');
                
                const isMediaResponse = containsImageUrl || containsMusicUrl;
                
                setIsLoading(false);
                setAgentStatus("");
                setIsGeneratingMedia(false);
                setGeneratingMediaType(null);
                
                if (isMediaRequest) {
                  setMessages(prev => {
                    const filteredMessages = prev.filter(msg => 
                      !(msg.isTemporary || 
                        (msg.role === 'assistant' && 
                         (msg.content.includes('Processing information') || 
                          msg.content.includes('Generating'))))
                    );
                    
                    const newMessages = [...filteredMessages, data.message];
                    saveChat(newMessages);
                    return newMessages;
                  });
                } else {
                  setMessages(prev => {
                    const newMessages = prev.filter(msg => !msg.isTemporary).concat([data.message]);
                    saveChat(newMessages);
                    return newMessages;
                  });
                }
                
                if (!threadId && data.thread_id) {
                  setThreadId(data.thread_id);
                  chatIdRef.current = data.thread_id;
                }
              }
            } catch (jsonError) {
              console.error("Error parsing stream data:", jsonError, "Line:", line);
            }
          }
        }
      } catch (error) {
        console.error("Error with streaming chat:", error);
        setMessages(prev => prev.filter(msg => !msg.isTemporary));
        setIsGeneratingMedia(false);
        setGeneratingMediaType(null);
        setIsLoading(false);
      }
    }
  };

  const handleSendMessage = (message, options = {}) => {
    chatLastUpdatedRef.current = null;
    
    const userMessage = { ...message };
    
    if (options.file_url) {
      const fileUrl = options.file_url;
      
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
      
      if (isImage) {
        userMessage.content = `${userMessage.content}\n\n![Uploaded Image](${fileUrl})`;
      } else {
        userMessage.content = `${userMessage.content}\n\n[Uploaded File](${fileUrl})`;
      }
    }
    
    setMessages(prev => [...prev, userMessage]);

    if (userMessage.role !== 'user') return;

    const messageText = userMessage.content.toLowerCase();
    
    setIsGeneratingMedia(false);
    setGeneratingMediaType(null);
    
    const songTerms = ['song', 'music', 'audio', 'tune', 'melody', 'compose'];
    const audioVerbs = ['generate', 'create', 'make', 'compose', 'play'];
    
    const isAudioRequest = 
      songTerms.some(term => messageText.includes(term)) &&
      (audioVerbs.some(verb => messageText.includes(verb)) || 
       messageText.startsWith('play') || 
       messageText.startsWith('sing'));
    
    const isImageRequest = !isAudioRequest && (
      (messageText.includes('image') || 
       messageText.includes('picture') || 
       messageText.includes('photo') || 
       messageText.includes('drawing')) &&
      (messageText.includes('generate') || 
       messageText.includes('create') || 
       messageText.includes('draw') || 
       messageText.includes('make'))
    );

    if (isAudioRequest) {
      setIsGeneratingMedia(true);
      setGeneratingMediaType('audio');
      setMediaType('music');
    } else if (isImageRequest) {
      setIsGeneratingMedia(true);
      setGeneratingMediaType('image');
      setMediaType('image');
    }

    setIsLoading(true);
    
    if (options.deep_research) {
      handleReactAgentStreamingRequest(userMessage, options);
    } else if (options.use_agent) {
      handleChatStreamingRequest(userMessage, options);
    } else {
      handleChatStreamingRequest(userMessage, options);
    }
  };

  const loadChat = async (chatId) => {
    try {
      setIsLoadingChat(true);
      const response = await axios.get(`${backend_url}/api/chat/${chatId}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const chatData = response.data.chat;
        setMessages(chatData.messages);
        setChatTitle(chatData.title);
        setThreadId(chatData.chatId);
        chatIdRef.current = chatData.chatId;
        
        if (chatData.lastUpdated) {
          chatLastUpdatedRef.current = chatData.lastUpdated;
        }
        
        setIsHistoryOpen(false);
      }
    } catch (error) {
      console.error("Error loading chat:", error);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setThreadId(null);
    chatIdRef.current = `temp_${Date.now()}`;
    setChatTitle("New Chat");
  };

  const hasActiveConversation = messages.length > 0

  const extractMediaUrls = (content) => {
    if (!content) return { text: '', imageUrls: [], musicUrls: [] };
    
    const imageRegex = /!\[(.*?)\]\((https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp))\)|(?<!\[)(https?:\/\/\S+\.(?:jpg|jpeg|png|gif|webp))(?!\])/gi;
    const musicRegex = /(https?:\/\/\S+\.(?:mp3|wav|ogg|m4a)(?:\S*))|(https?:\/\/(?:api\.musicfy\.lol|replicate\.delivery|replicate\.com|\w+\.(?:r2\.cloudflarestorage|cloudfront|amazonaws))\.com\/\S+)/gi;
    
    const imageUrls = [];
    const musicUrls = [];
    
    let imageMatch;
    while ((imageMatch = imageRegex.exec(content)) !== null) {
      imageUrls.push(imageMatch[2] || imageMatch[0]);
    }
    
    let musicMatch;
    while ((musicMatch = musicRegex.exec(content)) !== null) {
      musicUrls.push(musicMatch[0]);
    }
    
    let text = content;
    [...imageUrls, ...musicUrls].forEach(url => {
      text = text.replace(new RegExp(`^${url.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'gm'), '');
      text = text.replace(new RegExp(url.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), '');
      text = text.replace(new RegExp(`!\\[.*?\\]\\(${url.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\)`, 'g'), '');
    });
    
    return { text, imageUrls, musicUrls };
  };

  const extractSources = (content) => {
    if (!content) return [];
    
    // Look for URLs in the content
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const sources = [];
    let match;
    
    // Find all URLs in the content
    while ((match = urlRegex.exec(content)) !== null) {
      try {
        const url = match[0].replace(/\.$/, ''); // Remove trailing period if present
        
        // Skip media URLs
        const isMediaUrl = 
          /\.(jpg|jpeg|png|gif|webp|mp3|wav|ogg|m4a)$/i.test(url) || 
          url.includes('musicfy.lol') || 
          url.includes('replicate.delivery') || 
          url.includes('replicate.com') ||
          url.includes('r2.cloudflarestorage') ||
          url.includes('cloudfront') ||
          url.includes('amazonaws');
        
        // Only add unique non-media URLs
        if (!isMediaUrl && !sources.some(s => s.url === url)) {
          sources.push({
            url: url,
            // Try to extract domain for title
            title: new URL(url).hostname.replace('www.', '')
          });
        }
      } catch (e) {
        console.error("Error parsing URL:", match[0]);
      }
    }
    
    return sources;
  };

  const SourcesDropdown = ({ sources }) => {
    const { theme } = useContext(ThemeContext);
    const [isOpen, setIsOpen] = useState(false);
    
    if (!sources || sources.length === 0) return null;
    
    // Function to determine if a URL is a storage or media URL
    const isStorageUrl = (url) => {
      try {
        const domain = new URL(url).hostname;
        return domain.includes('cloudflarestorage') || 
               domain.includes('amazonaws') ||
               domain.includes('cloudfront') ||
               domain.includes('replicate');
      } catch (e) {
        return false;
      }
    };
    
    // Get icon for the source based on domain type
    const getSourceIcon = (source) => {
      try {
        const url = source.url;
        const domain = new URL(url).hostname;
        
        // For storage URLs, use a custom generic icon
        if (isStorageUrl(url)) {
          return (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18H20C21.1046 18 22 17.1046 22 16V8C22 6.89543 21.1046 6 20 6H4Z" />
              <path d="M12 18V6" />
            </svg>
          );
        }
        
        // For normal websites, use a favicon with fallback
        return (
          <img 
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`} 
            alt=""
            className="w-4 h-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z' fill='%23999'/%3E%3C/svg%3E";
            }}
          />
        );
      } catch (e) {
        // Fallback for invalid URLs
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        );
      }
    };
    
    return (
      <div className="mt-2">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 rounded-lg px-2 py-1.5 text-xs ${
            theme === 'dark' 
              ? 'bg-white/10 hover:bg-white/15 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          } transition-colors`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="7 10 12 15 17 10"></polyline>
          </svg>
          <span>{sources.length} {sources.length === 1 ? 'Source' : 'Sources'}</span>
        </button>
        
        {isOpen && (
          <div className={`mt-2 p-2 rounded-lg ${
            theme === 'dark' 
              ? 'bg-black/40 border border-white/10' 
              : 'bg-white border border-gray-200 shadow-md'
          }`}>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, index) => {
                try {
                  const domain = new URL(source.url).hostname;
                  const title = source.title || domain.replace('www.', '');
                  
                  return (
                    <a 
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center rounded-md p-2 ${
                        theme === 'dark' 
                          ? 'bg-white/5 hover:bg-white/10' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      } transition-colors`}
                      title={source.url}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                        theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'
                      }`}>
                        {getSourceIcon(source)}
                      </div>
                      <span className={`text-xs font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {title}
                      </span>
                    </a>
                  );
                } catch (e) {
                  return null;
                }
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const MessageContent = ({ content }) => {
    const { theme } = useContext(ThemeContext);
    const { text, imageUrls, musicUrls } = extractMediaUrls(content);
    
    // Extract sources from content
    const sources = extractSources(content);
    
    // Remove URLs at the end of text for clean display
    let cleanedText = text;
    if (sources.length > 0) {
      // Remove URLs from the end of the content
      sources.forEach(source => {
        cleanedText = cleanedText.replace(source.url, '');
      });
      
      // Remove "Sources:" section and bullet points completely
      cleanedText = cleanedText.replace(/\n\n\*\*Sources:\*\*\n(•.*\n?)+/g, '');
      cleanedText = cleanedText.replace(/Sources:(\s|\n)*(•\s*\n*)*$/g, '');
      
      // Clean up any empty lines at the end
      cleanedText = cleanedText.replace(/\n+$/g, '');
    }
    
    const handleImageDownload = (url) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = function() {
        if (this.status === 200) {
          const blob = new Blob([this.response], { type: 'image/jpeg' });
          
          const blobUrl = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = 'image-' + Date.now() + '.jpg';
          
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
          }, 100);
        }
      };
      xhr.send();
    };
    
    return (
      <div className={`message-content break-words ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        {cleanedText && (
          <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} prose-sm sm:prose-base max-w-none overflow-hidden`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  const [copied, setCopied] = useState(false);
                  
                  const copyToClipboard = (text) => {
                    navigator.clipboard.writeText(text)
                      .then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      })
                      .catch(err => {
                        console.error('Failed to copy code: ', err);
                      });
                  };

                  return !inline && match ? (
                    <div className="code-block">
                      <div className="code-header">
                        <span className="code-lang">{match[1]}</span>
                        <button 
                          onClick={() => copyToClipboard(codeString)}
                          className="code-copy-btn"
                          title={copied ? "Copied!" : "Copy code"}
                        >
                          {copied ? <TbCopyCheckFilled className="h-4 w-4" /> : <FaRegCopy className="h-4 w-4" />}
                          <span className="ml-1">Copy</span>
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={atomDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: '0',
                          padding: '0.75rem',
                          background: '#1e1e1e',
                          fontSize: '14px',
                          borderRadius: '0 0 6px 6px'
                        }}
                        codeTagProps={{
                          style: {
                            fontSize: 'inherit',
                            lineHeight: 1.5
                          }
                        }}
                        wrapLines={false}
                        wrapLongLines={false}
                        className="code-syntax"
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                a: ({ node, ...props }) => {
                  const href = props.href || '';
                  const isMediaUrl = /\.(jpg|jpeg|png|gif|webp|mp3|wav|ogg)$/i.test(href) || 
                                    href.includes('musicfy.lol') || 
                                    href.includes('replicate');
                  
                  if (isMediaUrl) {
                    return null;
                  }
                  
                  return (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-[#cc2b5e] underline" />
                  );
                },
                table: ({ node, ...props }) => (
                  <table {...props} className={`border-collapse ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} my-4 w-full`} />
                ),
                th: ({ node, ...props }) => (
                  <th {...props} className={`border ${theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'} px-4 py-2`} />
                ),
                td: ({ node, ...props }) => (
                  <td {...props} className={`border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} px-4 py-2`} />
                ),
              }}
            >
              {cleanedText}
            </ReactMarkdown>
          </div>
        )}
        
        {/* Replace SourceFavicons with SourcesDropdown */}
        {sources.length > 0 && <SourcesDropdown sources={sources} />}
        
        {imageUrls.length > 0 && (
          <div className="mt-2 space-y-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full max-w-full object-contain rounded-lg" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%23999999'%3EImage Failed to Load%3C/text%3E%3C/svg%3E";
                  }}
                />
                <button
                  onClick={() => handleImageDownload(url)}
                  className="absolute bottom-2 right-2 bg-[#cc2b5e]/80 hover:bg-[#cc2b5e] text-white rounded-full w-10 h-10 flex items-center justify-center transition-all shadow-md"
                  title="Download image"
                >
                  <FaDownload className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {musicUrls.length > 0 && (
          <div className="mt-3 space-y-4">
            {musicUrls.map((url, index) => (
              <ModernAudioPlayer key={index} url={url} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const sanitizeContent = (content) => {
    if (!content) return '';
    
    return content.replace(
      /(https?:\/\/\S+\.(jpg|jpeg|png|gif|webp|mp3|wav|ogg|m4a)(\?\S*)?)/gi, 
      '[media]'
    ).replace(
      /(https?:\/\/(?:api\.musicfy\.lol|replicate\.delivery|replicate\.com|\w+\.(?:r2\.cloudflarestorage|cloudfront|amazonaws))\.com\/\S+)/gi,
      '[media]'
    );
  };

  const MediaGenerationIndicator = () => {
    return (
      <div className="max-w-[95%] mr-auto mb-4">
        <div className="bg-white/10 text-white rounded-xl p-3 relative">
          <div className="flex items-center">
            <div className="mr-3">
              {generatingMediaType === 'image' ? (
                <div className="w-8 h-8 rounded-full border-2 border-[#cc2b5e] border-t-transparent animate-spin"></div>
              ) : (
                <div className="flex space-x-1 h-8 items-center">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i}
                      className="w-1.5 bg-[#cc2b5e] rounded-full animate-sound-wave"
                      style={{
                        height: `${15 + Math.sin(i * 0.8) * 10}px`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {generatingMediaType === 'image' 
                  ? 'Creating your image...' 
                  : 'Composing your music...'}
              </p>
              <p className="text-xs text-white/60">
                This may take a few moments
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MediaLoadingAnimation = () => {
    return (
      <div className="max-w-[95%] mr-auto mb-4">
        <div className="bg-white/10 text-white rounded-xl p-3 sm:p-4">
          <div className="flex flex-col items-center">
            {mediaType === 'image' ? (
              <>
                <div className="w-full h-40 sm:h-48 bg-white/5 rounded-lg relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" 
                         style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }}></div>
                  </div>
                  <div className="relative flex flex-col items-center z-10">
                    <svg className="animate-spin h-10 w-10 text-[#cc2b5e] mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-white/90 font-medium">Creating your image...</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-full h-24 sm:h-32 bg-white/5 rounded-lg relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" 
                         style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }}></div>
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1.5 bg-[#cc2b5e] rounded-full animate-sound-wave" 
                          style={{ 
                            height: `${15 + Math.sin(i * 0.8) * 10}px`,
                            animationDelay: `${i * 0.15}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                    <p className="text-sm text-white/90 font-medium">Composing your music...</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleMediaRequested = (mediaType) => {
    setIsGeneratingMedia(true);
    setGeneratingMediaType(mediaType);
  };

  const updateChatTitle = async (newTitle) => {
    if (!user || !threadId || threadId.startsWith('temp_') || isLoadingChat) return;
    
    try {
      const response = await axios.put(`${backend_url}/api/chat/${threadId}/update`, {
        title: newTitle,
        messages: messages
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setChatTitle(newTitle);
        fetchChatHistory();
      }
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
  };

  const handleModelChange = (newModel) => {
    setModel(newModel);
  };

  const handleInputOptionsChange = (options) => {
    if (options.use_agent !== undefined) setUseAgent(options.use_agent);
    if (options.deep_research !== undefined) setDeepResearch(options.deep_research);
  };

  return (
    <div className="flex flex-col h-screen">
      {isHistoryOpen && (
        <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'} z-50`}>
          <ChatHistory 
            isOpen={isHistoryOpen} 
            onClose={() => setIsHistoryOpen(false)} 
            conversations={conversations}
            onSelectConversation={loadChat}
          />
        </div>
      )}

      {isSettingsOpen && (
        <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-100'} z-50`}>
          <Settings 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            onClearConversation={clearConversation}
          />
        </div>
      )}

      <div className="flex h-full flex-1 overflow-hidden">
        <Sidebar 
          isVisible={isSidebarVisible} 
          onToggle={toggleSidebar}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onNewChat={clearConversation}
        />

        <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 
          ${isSidebarVisible ? 'ml-16 sm:ml-20 lg:ml-64' : 'ml-0'}`}>
          
          {/* Added logo header */}
          <div className="flex justify-between items-center py-2 px-4 ml-16">
            {/* Logo that shows only when sidebar is hidden or on small screens */}
            <div className={`flex items-center ${isSidebarVisible ? 'sm:hidden' : ''}`}>
              <img src="/vannipro.png" alt="Vaani.pro Logo" className="h-8 sm:h-9" />
              <h1 className="text-lg sm:text-xl font-bold ml-2 text-[#cc2b5e]">Vaani.pro</h1>
            </div>
            
            {/* Share button that shows when sidebar is visible on non-small screens */}
            <div className={`${!isSidebarVisible || window.innerWidth < 640 ? 'hidden' : 'flex'} items-center`}>
              <button className="flex items-center bg-transparent hover:bg-[#cc2b5e]/30 text-[#cc2b5e] px-3 py-1.5 rounded-full text-sm transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Share
              </button>
            </div>
            
            {/* User profile picture at top right */}
            <div className="flex items-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden">
                <img 
                  src={user?.profilePicture || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cc2b5e'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E"}
                  alt={user?.name || "Profile"} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cc2b5e'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                  }}
                />
              </div>
            </div>
          </div>
          
          {hasActiveConversation ? (
            <div className="h-full flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-0 py-4 mt-3 scroll-smooth" 
                style={{ 
                  msOverflowStyle: "none", 
                  scrollbarWidth: "none",
                  WebkitOverflowScrolling: "touch",
                  willChange: 'transform' // Add hardware acceleration
                }}
              >
                <style>{`
                  .messages-container::-webkit-scrollbar {
                    display: none;
                  }
                  
                  .message-content img {
                    max-width: 100%;
                    height: auto;
                  }
                  
                  .message-content pre {
                    max-width: 100%;
                    overflow-x: auto;
                    font-size: 18px;
                  }
                  
                  .react-syntax-highlighter-line {
                    white-space: pre-wrap !important;
                    word-break: break-word !important;
                  }
                  
                  /* Table responsive styles */
                  .message-content table {
                    width: 100%;
                    display: block;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: ;
                  }
                  
                  @media (min-width: 768px) {
                    .message-content table {
                      display: table;
                    }
                  }
                  
                  .message-content th,
                  .message-content td {
                    min-width: 100px;
                    white-space: normal;
                    word-break: break-word;
                  }
                  
                  @media (max-width: 640px) {
                    .message-content pre {
                      max-width: 100%;
                      font-size: 18px;
                    }
                    
                    .message-content th,
                    .message-content td {
                      padding: 4px;
                      font-size: 0.85rem;
                    }
                  }
                  
                  @keyframes pulse {
                    0%, 100% { transform: scaleY(1); }
                    50% { transform: scaleY(1.5); }
                  }
                  
                  @keyframes shimmer {
                    0% {
                      background-position: -200% 0;
                    }
                    100% {
                      background-position: 200% 0;
                    }
                  }
                  
                  .animate-shimmer {
                    animation: shimmer 2s infinite;
                  }
                  
                  @keyframes sound-wave {
                    0%, 100% {
                      height: 5px;
                    }
                    50% {
                      height: 30px;
                    }
                  }
                  
                  .animate-sound-wave {
                    animation: sound-wave 1s ease-in-out infinite;
                  }
                  
                  @keyframes audio-pulse {
                    0%, 100% { height: 6px; }
                    50% { height: 20px; }
                  }
                  
                  .animate-audio-pulse {
                    animation: audio-pulse 1.2s ease-in-out infinite;
                  }
                  
                  @keyframes wave {
                    0%, 100% {
                      transform: scaleY(0.5);
                    }
                    50% {
                      transform: scaleY(1);
                    }
                  }
                  
                  .animate-wave {
                    animation: wave 1.2s ease-in-out infinite;
                  }
                  
                  input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    background: #cc2b5e;
                    border-radius: 50%;
                    cursor: pointer;
                  }
                  
                  input[type="range"]::-moz-range-thumb {
                    width: 12px;
                    height: 12px;
                    background: #cc2b5e;
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                  }
                  
                  .loading-dots {
                    display: inline-flex;
                  }
                  
                  .loading-dots .dot {
                    animation: loadingDot 1.4s infinite;
                    animation-fill-mode: both;
                    font-size: 1.5em;
                    line-height: 0.5;
                    margin-left: 2px;
                    opacity: 0;
                  }
                  
                  .loading-dots .dot:nth-child(1) {
                    animation-delay: 0.2s;
                  }
                  
                  .loading-dots .dot:nth-child(2) {
                    animation-delay: 0.4s;
                  }
                  
                  .loading-dots .dot:nth-child(3) {
                    animation-delay: 0.6s;
                  }
                  
                  @keyframes loadingDot {
                    0% { opacity: 0; }
                    25% { opacity: 0; }
                    50% { opacity: 1; }
                    75% { opacity: 1; }
                    100% { opacity: 0; }
                  }
                  
                  /* Add these new styles */
                  .scroll-smooth {
                    scroll-behavior: smooth;
                  }
                  
                  /* Optimize rendering */
                  .message-content {
                    transform: translateZ(0);
                    backface-visibility: hidden;
                    perspective: 1000px;
                  }
                  
                  /* Reduce layout shifts */
                  .messages-container {
                    contain: content;
                  }
                  
                  /* Prevent text selection during scrolling */
                  .no-select {
                    user-select: none;
                  }
                `}</style>
                
                <div className="w-full max-w-[95%] xs:max-w-[90%] sm:max-w-3xl md:max-w-3xl mx-auto">
                  {messages.map((msg, index) => {
                    const displayContent = msg.role === 'assistant' 
                      ? msg.content 
                      : sanitizeContent(msg.content);
                    
                    return (
                      <div 
                        key={index} 
                        className={`mb-6 ${index === 0 ? 'mt-5' : ''} w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'user' ? (
                          <div className={`${
                            theme === 'dark'
                              ? 'bg-white/30 text-white' 
                              : 'bg-black/20 text-white'
                          } rounded-3xl p-3 px-4 overflow-hidden inline-block`} style={{maxWidth: '85%'}}>
                            <MessageContent content={displayContent} />
                          </div>
                        ) : (
                          <div className={`${
                            theme === 'dark'
                              ? 'text-white' 
                              : 'text-gray-800'
                          } rounded-xl p-0 overflow-hidden inline-block w-full max-w-[95%] xs:max-w-[90%] sm:max-w-3xl md:max-w-3xl`}>
                            <MessageContent content={displayContent} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                  
                  {isGeneratingMedia && <MediaGenerationIndicator />}
                  
                  {isLoading && !isGeneratingMedia && !messages.some(msg => msg.isTemporary) && !mediaType && (
                    <div className="mb-4 flex justify-start">
                      <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-800'} rounded-full p-2 sm:p-3 inline-block`}>
                        <div className="flex items-center">
                          <div className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-[#cc2b5e] rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-[#cc2b5e] rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                            <div className="w-1 h-1 bg-[#cc2b5e] rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`h-full flex-1 flex flex-col ${theme === 'dark' ? 'bg-black' : 'bg-white'} px-2 sm:px-4 md:px-6 py-2 sm:py-4 items-center overflow-hidden`}>
              {/* Welcome content with vertical centering but slightly lower */}
              <div className="w-full flex-1 flex flex-col items-center justify-center -mt-12">
                <div className="items-center text-center w-full transition-all duration-300 
                  max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#cc2b5e]">Welcome to Vaani.pro</h1>
                  <p className="text-[#cc2b5e] text-2xl sm:text-xl mt-2">How may I help you?</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
                    {predefinedPrompts.map((item) => (
                      <motion.div
                        key={item.id}
                        className={`group relative ${
                          theme === 'dark' 
                            ? 'bg-white/[0.05] backdrop-blur-xl border border-white/20 hover:bg-white/[0.08] shadow-[0_0_20px_rgba(204,43,94,0.3)] hover:shadow-[0_0_20px_rgba(204,43,94,0.5)]' 
                            : 'bg-gray-100 border border-gray-200 hover:bg-gray-200 shadow-md hover:shadow-lg'
                        } rounded-xl p-4 cursor-pointer transition-all duration-100`}
                        whileHover={{ 
                          scale: 1.03,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePromptClick(item)}
                      >
                        <div className="relative z-10">
                          <h3 className={`${theme === 'dark' ? 'text-white/90' : 'text-gray-800'} font-medium text-sm mb-2`}>
                            {item.title}
                          </h3>
                          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs line-clamp-2`}>
                            {item.prompt}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Desktop MessageInput below prompts with increased spacing */}
                  <div className="hidden md:block w-full max-w-3xl mx-auto mt-12">
                    <MessageInput 
                      onSendMessage={handleSendMessage}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                      onMediaRequested={handleMediaRequested}
                      onModelChange={handleModelChange}
                      onOptionsChange={handleInputOptionsChange}
                      selectedModel={model}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Fixed MessageInput at bottom with proper z-index */}
      <div className="fixed bottom-0 left-0 right-0 z-10 px-2 sm:px-4 pb-2 sm:pb-4">
        <MessageInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          onMediaRequested={handleMediaRequested}
          onModelChange={handleModelChange}
          onOptionsChange={handleInputOptionsChange}
          selectedModel={model}
        />
      </div>
    </div>
  )
}

export default ChatContainer