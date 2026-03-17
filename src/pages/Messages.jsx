import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { getConversations, getMessages, sendMessage, getFaculty, startConversation } from "../api";
import {
    Send, Paperclip, FileText,
    Mic, X, Smile, MoreVertical, Search, Phone,
    Video, Circle, CheckCheck, File, BookOpen, User, Plus
} from "lucide-react";

import toast from "react-hot-toast";

export default function Messages() {
    const { user } = useAuth();
    const socket = useSocket();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [allFaculty, setAllFaculty] = useState([]);
    const [showFacultyList, setShowFacultyList] = useState(false);

    
    const messagesEndRef = useRef(null);

    const fileInputRef = useRef(null);
    const recordingInterval = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [convRes, facultyRes] = await Promise.all([
                    getConversations(),
                    user?.role === "student" || user?.role === "admin" ? getFaculty() : Promise.resolve({ data: { faculty: [] } })

                ]);
                setConversations(convRes.data.conversations || []);
                setAllFaculty(facultyRes.data.faculty || []);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleSelectTeacher = async (teacherId) => {
        try {
            const res = await startConversation(teacherId);
            const conv = res.data.conversation;
            if (!conversations.find(c => c._id === conv._id)) {
                setConversations(prev => [conv, ...prev]);
            }
            setSelectedConv(conv);
            setShowFacultyList(false);
            setSearchQuery("");
        } catch (err) {
            console.error("Start conversation error:", err);
            toast.error("Could not start conversation");
        }

    };


    useEffect(() => {
        if (selectedConv) {
            const fetchMsgs = async () => {
                setMsgLoading(true);
                try {
                    const res = await getMessages(selectedConv._id);
                    setMessages(res.data.messages || []);
                    setTimeout(scrollToBottom, 100);
                } catch (err) {
                    console.error("Fetch msgs error:", err);
                } finally {
                    setMsgLoading(false);
                }
            };
            fetchMsgs();
        }
    }, [selectedConv]);

    useEffect(() => {
        if (socket) {
            socket.on("receiveMessage", (msg) => {
                if (selectedConv && msg.conversation === selectedConv._id) {
                    setMessages(prev => [...prev, msg]);
                    setTimeout(scrollToBottom, 100);
                }
                // Update conversation list last message
                setConversations(prev => prev.map(c => 
                    c._id === msg.conversation ? { ...c, lastMessage: msg, updatedAt: new Date() } : c
                ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
            });

            return () => socket.off("receiveMessage");
        }
    }, [socket, selectedConv]);

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() && attachments.length === 0 && !audioBlob) return;

        const receiver = selectedConv.participants.find(p => p._id !== user._id);
        const fd = new FormData();
        fd.append("conversationId", selectedConv._id);
        fd.append("receiverId", receiver._id);
        fd.append("content", newMessage);
        
        attachments.forEach(file => {
            fd.append("attachments", file);
        });

        if (audioBlob) {
            fd.append("attachments", audioBlob, "voice_message.webm");
            fd.append("messageType", "voice");
        }

        try {
            const res = await sendMessage(fd);
            setMessages(prev => [...prev, res.data.message]);
            setNewMessage("");
            setAttachments([]);
            setAudioBlob(null);
            setTimeout(scrollToBottom, 100);
            
            // Update conv list
            setConversations(prev => prev.map(c => 
                c._id === selectedConv._id ? { ...c, lastMessage: res.data.message, updatedAt: new Date() } : c
            ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
        } catch (err) {
            console.error("Send error:", err);
            toast.error("Failed to send message");
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setAttachments(prev => [...prev, ...files]);
    };

    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1 || items[i].kind === "file") {
                const blob = items[i].getAsFile();
                if (blob) setAttachments(prev => [...prev, blob]);
            }
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            let chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                setAudioBlob(blob);
                chunks = [];
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);
            recordingInterval.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Recording error:", err);
            toast.error("Microphone access denied");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(t => t.stop());
            setIsRecording(false);
            clearInterval(recordingInterval.current);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getOtherUser = (conv) => {
        return conv.participants.find(p => p._id !== user._id);
    };

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-slide-up">
            {/* Sidebar */}
            <div className="w-full sm:w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
                <div className="p-4 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            Messages
                            <span className="bg-primary-100 text-primary-600 text-[10px] px-2 py-0.5 rounded-full">{conversations.length}</span>
                        </h2>
                        <button 
                            onClick={() => setShowFacultyList(!showFacultyList)}
                            className={`p-2 rounded-xl transition-all ${showFacultyList ? "bg-primary-600 text-white shadow-lg" : "bg-primary-50 text-primary-600 hover:bg-primary-100"}`}
                            title="New Message"
                        >
                            {showFacultyList ? <X size={20} /> : <Plus size={20} />}
                        </button>
                    </div>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            placeholder={showFacultyList ? "Search teachers..." : "Search chats..."} 
                            className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 ring-primary-500/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-8 text-center flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                            <p className="text-xs text-slate-400 font-medium">Loading...</p>
                        </div>
                    ) : showFacultyList ? (
                        <div className="p-2 space-y-1">
                            <h3 className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Teachers</h3>
                            {allFaculty.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(teacher => (
                                <div 
                                    key={teacher._id}
                                    onClick={() => handleSelectTeacher(teacher._id)}
                                    className="p-3 flex items-center gap-3 cursor-pointer hover:bg-white hover:shadow-sm rounded-xl transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                                        {teacher.avatar ? <img src={`http://localhost:5000${teacher.avatar}`} className="w-full h-full object-cover" alt="avatar" /> : teacher.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 text-sm truncate">{teacher.name}</h4>
                                        <p className="text-[10px] text-primary-600 font-bold bg-primary-50 px-2 py-0.5 rounded-full w-fit">Faculty</p>
                                    </div>
                                    <Plus size={16} className="text-slate-300 group-hover:text-primary-600" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        conversations.filter(c => getOtherUser(c).name.toLowerCase().includes(searchQuery.toLowerCase())).map(conv => {
                            const other = getOtherUser(conv);
                            return (
                                <div 
                                    key={conv._id} 
                                    onClick={() => setSelectedConv(conv)}
                                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white transition-all border-l-4 ${selectedConv?._id === conv._id ? "border-primary-600 bg-white shadow-sm" : "border-transparent"}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold overflow-hidden shadow-sm">
                                            {other.avatar ? <img src={`http://localhost:5000${other.avatar}`} className="w-full h-full object-cover" alt="avatar" /> : other.name[0]}
                                        </div>
                                        <Circle size={10} className="absolute -bottom-0.5 -right-0.5 fill-green-500 text-white border-2 border-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <h3 className="font-bold text-slate-800 text-sm truncate">{other.name}</h3>
                                            <span className="text-[10px] text-slate-400 font-medium">{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">
                                            {conv.lastMessage?.content || (conv.lastMessage?.attachments?.length ? "Shared an attachment" : "Start a conversation")}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>

            {/* Chat Area */}
            {selectedConv ? (
                <div className="flex-1 flex flex-row bg-slate-50/20 overflow-hidden">
                    {/* Main Chat Window */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setShowProfile(!showProfile)}>
                                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold overflow-hidden shadow-sm group-hover:ring-2 ring-primary-300 transition-all">
                                    {getOtherUser(selectedConv).avatar ? <img src={`http://localhost:5000${getOtherUser(selectedConv).avatar}`} className="w-full h-full object-cover" alt="avatar" /> : getOtherUser(selectedConv).name[0]}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="font-bold text-slate-800 truncate group-hover:text-primary-600 transition-colors">{getOtherUser(selectedConv).name}</h2>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                                        <span className={`w-2 h-2 rounded-full ${getOtherUser(selectedConv) ? "bg-green-500 animate-pulse" : "bg-slate-300"}`} />
                                        {getOtherUser(selectedConv).role}
                                    </div>

                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Phone size={18} /></button>
                                <button className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Video size={18} /></button>
                                <button className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><MoreVertical size={18} /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4" onPaste={handlePaste}>
                            {msgLoading ? (
                                <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
                            ) : (
                                messages.map((msg) => {
                                    const isMine = msg.sender._id === user._id;
                                    return (
                                        <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[75%] sm:max-w-[60%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                                                <div className={`rounded-2xl p-3.5 shadow-sm text-sm relative ${isMine ? "bg-primary-600 text-white rounded-tr-none" : "bg-white text-slate-700 rounded-tl-none border border-slate-100"}`}>
                                                    {msg.attachments?.map((att, idx) => (
                                                        <div key={idx} className={`mb-2 p-2 rounded-xl flex items-center gap-3 ${isMine ? "bg-white/10" : "bg-slate-50"}`}>
                                                            {att.fileType === "image" ? (
                                                                <div className="rounded-lg overflow-hidden border border-white/20">
                                                                    <img src={`http://localhost:5000${att.url}`} className="max-w-full h-auto cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(`http://localhost:5000${att.url}`)} alt="attachment" />
                                                                </div>
                                                            ) : att.fileType === "audio" ? (
                                                                <audio controls className="h-8 max-w-full">
                                                                    <source src={`http://localhost:5000${att.url}`} type="audio/webm" />
                                                                </audio>
                                                            ) : (
                                                                <div className="flex items-center gap-3 w-full">
                                                                    <div className="p-2 bg-primary-100 rounded-lg text-primary-600"><File size={16} /></div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-xs font-bold truncate underline cursor-pointer" onClick={() => window.open(`http://localhost:5000${att.url}`)}>{att.name}</p>
                                                                        <p className="text-[10px] opacity-70">{(att.size / 1024).toFixed(1)} KB</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
                                                </div>

                                                <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                                    <span className="text-[10px] text-slate-400 font-medium">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    {isMine && <CheckCheck size={12} className="text-primary-500" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100 space-y-3 shadow-sm">
                            {/* Selected Files Preview */}
                            {attachments.length > 0 && (
                                <div className="flex flex-wrap gap-3 animate-fade-in p-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    {attachments.map((file, i) => (
                                        <div key={i} className="relative group p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                                            <div className="flex items-center gap-3">
                                                {file.type.startsWith("image/") ? (
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                )}
                                                <div className="min-w-0 pr-2">
                                                    <p className="text-[10px] font-bold text-slate-700 truncate max-w-[100px]">{file.name}</p>
                                                    <p className="text-[9px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} 
                                                className="absolute -top-2 -right-2 p-1 bg-white shadow-md rounded-full text-slate-400 hover:text-red-500 hover:scale-110 transition-all border border-slate-100"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}


                            <form onSubmit={handleSend} className="flex items-center gap-3">
                                <button type="button" onClick={() => fileInputRef.current.click()} className="p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-2xl transition-all"><Paperclip size={20} /></button>
                                <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                
                                <div className="flex-1 relative">
                                    <input 
                                        className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 text-sm focus:ring-2 ring-primary-500/20 pr-12"
                                        placeholder="Type your message here..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={isRecording}
                                    />
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-amber-500 transition-colors"><Smile size={20} /></button>
                                </div>

                                {isRecording ? (
                                    <div className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-3.5 rounded-2xl animate-pulse">
                                        <div className="flex items-center gap-2 font-black text-sm">
                                            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                                            {formatTime(recordingTime)}
                                        </div>
                                        <button type="button" onClick={stopRecording} className="p-1 bg-red-600 text-white rounded-lg hover:scale-110"><X size={16} /></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        {newMessage || attachments.length > 0 || audioBlob ? (
                                            <button type="submit" className="p-3.5 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-200 hover:scale-105 hover:bg-primary-700 active:scale-95 transition-all"><Send size={20} /></button>
                                        ) : (
                                            <button type="button" onClick={startRecording} className="p-3.5 bg-slate-100 text-slate-500 rounded-2xl hover:bg-primary-50 hover:text-primary-600 transition-all"><Mic size={20} /></button>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Contact Profile Sidebar (WhatsApp Style) */}
                    {showProfile && (
                        <div className="w-full sm:w-80 bg-white border-l border-slate-100 flex flex-col animate-slide-left z-20">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm">
                                <h3 className="font-black text-slate-800 tracking-tight uppercase text-xs opacity-50">Contact Info</h3>
                                <button onClick={() => setShowProfile(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-all"><X size={18} /></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-6 text-center space-y-4">
                                    <div className="w-32 h-32 mx-auto rounded-3xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-4xl overflow-hidden shadow-xl border-4 border-white">
                                        {getOtherUser(selectedConv).avatar ? <img src={`http://localhost:5000${getOtherUser(selectedConv).avatar}`} className="w-full h-full object-cover" alt="avatar" /> : getOtherUser(selectedConv).name[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-800 mb-1">{getOtherUser(selectedConv).name}</h2>
                                        <p className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full w-fit mx-auto capitalize">{getOtherUser(selectedConv).role}</p>
                                    </div>
                                </div>

                                <div className="px-6 py-4 space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">About / Bio</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed italic">
                                            {getOtherUser(selectedConv).bio || "No bio information provided."}
                                        </p>
                                    </div>

                                    {getOtherUser(selectedConv).department && (
                                        <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary-600 shadow-sm"><BookOpen size={16} /></div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Department</p>
                                                    <p className="text-sm font-bold text-slate-700">{getOtherUser(selectedConv).department}</p>
                                                </div>
                                            </div>
                                            {getOtherUser(selectedConv).qualification && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary-600 shadow-sm"><User size={16} /></div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Qualification</p>
                                                        <p className="text-sm font-bold text-slate-700">{getOtherUser(selectedConv).qualification}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-2 border-t border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><Phone size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Phone</p>
                                                <p className="text-sm font-semibold text-slate-700">{getOtherUser(selectedConv).phone || "Not provided"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><Send size={16} /></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Email</p>
                                                <p className="text-sm font-semibold text-slate-700 truncate">{getOtherUser(selectedConv).email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (

                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/10">
                    <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-3xl flex items-center justify-center mb-6 animate-bounce">
                        <Send size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Your Conversations</h3>
                    <p className="text-slate-500 max-w-sm">Select a conversation from the sidebar to start chatting with your teachers and peers.</p>
                </div>
            )}
        </div>
    );
}
