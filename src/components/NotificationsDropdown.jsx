import { useEffect, useState } from "react";
import { getNotifications, markAsRead, markAllAsRead } from "../api";
import { Bell, Check, Clock, Circle, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const iconMap = {
    info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50" },
    success: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
    warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
    error: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
};

const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

export default function NotificationsDropdown({ onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const res = await getNotifications();
            setNotifications(res.data.notifications || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id, link) => {
        try {
            await markAsRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            if (link) {
                navigate(link);
                onClose();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-slide-up">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    {unreadCount > 0 && <span className="bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount} New</span>}
                </div>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllAsRead} className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
                        <Check size={14} />Mark all as read
                    </button>
                )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Bell size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((n) => {
                            const TypeIcon = iconMap[n.type]?.icon || iconMap.info.icon;
                            const typeColor = iconMap[n.type]?.color || iconMap.info.color;
                            const typeBg = iconMap[n.type]?.bg || iconMap.info.bg;
                            
                            return (
                                <div 
                                    key={n._id} 
                                    onClick={() => handleMarkAsRead(n._id, n.link)}
                                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors relative flex gap-3 ${!n.isRead ? "bg-primary-50/30" : ""}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${typeBg}`}>
                                        <TypeIcon size={18} className={typeColor} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm font-bold truncate ${!n.isRead ? "text-slate-900" : "text-slate-600"}`}>{n.title}</p>
                                            {!n.isRead && <Circle size={8} className="fill-primary-600 text-primary-600 flex-shrink-0 mt-1" />}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 font-medium">
                                            <Clock size={10} />
                                            {timeAgo(n.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <button 
                    onClick={() => { navigate("/student/notifications"); onClose(); }} 
                    className="text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors"
                >
                    View All Activity
                </button>
            </div>
        </div>
    );
}

NotificationsDropdown.propTypes = {
    onClose: PropTypes.func.isRequired,
};
