import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import PropTypes from "prop-types";
import {
    GraduationCap, LayoutDashboard, BookOpen, FileText, Video,
    ClipboardList, BarChart2, Users, LogOut, ChevronLeft,
    ChevronRight, Bell, Menu, Award, Calendar, ArrowLeft,
    MessageSquare
} from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";

const studentNav = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/student" },
    { label: "My Courses", icon: BookOpen, to: "/student/courses" },
    { label: "Study Materials", icon: FileText, to: "/student/materials" },
    { label: "Live Classes", icon: Video, to: "/student/classes" },
    { label: "Exams", icon: ClipboardList, to: "/student/exams" },
    { label: "My Results", icon: Award, to: "/student/results" },
    { label: "Messages", icon: MessageSquare, to: "/student/messages" },
];

const facultyNav = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/faculty" },
    { label: "My Courses", icon: BookOpen, to: "/faculty/courses" },
    { label: "Upload Materials", icon: FileText, to: "/faculty/materials" },
    { label: "Schedule Classes", icon: Calendar, to: "/faculty/schedule" },
    { label: "Create Exams", icon: ClipboardList, to: "/faculty/exams" },
    { label: "Results", icon: BarChart2, to: "/faculty/results" },
    { label: "Messages", icon: MessageSquare, to: "/faculty/messages" },
];

const adminNav = [
    { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
    { label: "Manage Users", icon: Users, to: "/admin/users" },
    { label: "Courses", icon: BookOpen, to: "/admin/courses" },
    { label: "Materials", icon: FileText, to: "/admin/materials" },
    { label: "Schedules", icon: Calendar, to: "/admin/schedules" },
    { label: "Messages", icon: MessageSquare, to: "/admin/messages" },
];


export default function DashboardLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const navItems = user?.role === "admin" ? adminNav : user?.role === "faculty" ? facultyNav : studentNav;

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        navigate("/login");
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center gap-3 p-5 border-b border-primary-700/50 ${collapsed ? "justify-center" : ""}`}>
                <div className="bg-white/20 rounded-xl p-2 flex-shrink-0">
                    <GraduationCap size={22} className="text-white" />
                </div>
                {!collapsed && (
                    <div className="animate-fade-in">
                        <div className="text-white font-black text-xl leading-none tracking-tighter">COLLEGEMOBI<span className="text-primary-300">EDU</span></div>
                    </div>
                )}
            </div>

            {/* User Info */}
            {!collapsed && (
                <div className="px-4 py-4 border-b border-primary-700/50 animate-fade-in cursor-pointer hover:bg-white/5 transition-colors" onClick={() => navigate(`/${user?.role}/profile`)}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                            {user?.avatar ? <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                            <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${user?.role === "admin" ? "bg-purple-500/30 text-purple-200" :
                                user?.role === "faculty" ? "bg-green-500/30 text-green-200" :
                                    "bg-blue-500/30 text-blue-200"
                                }`}>{user?.role}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav Links */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map(({ label, icon: Icon, to }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to.split("/").length <= 2}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium text-sm
              ${collapsed ? "justify-center" : ""}
              ${isActive
                                ? "bg-white text-primary-700 shadow-lg"
                                : "text-primary-200 hover:bg-white/10 hover:text-white"
                            }`
                        }
                    >
                        <Icon size={19} className="flex-shrink-0" />
                        {!collapsed && <span className="animate-fade-in">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-primary-700/50 space-y-1">
                <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-primary-200 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 text-sm ${collapsed ? "justify-center" : ""}`}
                >
                    <LogOut size={19} className="flex-shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex flex-col bg-gradient-to-b from-primary-900 to-primary-800 transition-all duration-300 flex-shrink-0 relative ${collapsed ? "w-16" : "w-64"
                    }`}
            >
                <SidebarContent />
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-8 bg-white text-primary-600 border border-slate-200 rounded-full p-1 shadow-md hover:scale-110 transition-all z-20"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </aside>

            {/* Mobile Sidebar Drawer */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
                    <aside className="relative w-72 bg-gradient-to-b from-primary-900 to-primary-800 flex flex-col">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                        >
                            <Menu size={20} />
                        </button>

                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-primary-600 transition-all active:scale-95"
                            title="Go Back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="font-bold text-slate-800 text-base sm:text-lg leading-tight">
                                Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, {user?.name?.split(" ")[0]}! 👋
                            </h1>
                            <p className="text-xs text-slate-400">
                                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`p-2 rounded-xl transition-all ${showNotifications ? "bg-primary-100 text-primary-600" : "text-slate-500 hover:bg-primary-50 hover:text-primary-600"}`}
                            >
                                <Bell size={20} />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                            </button>
                            {showNotifications && <NotificationsDropdown onClose={() => setShowNotifications(false)} />}
                        </div>
                        <div 
                            onClick={() => navigate(`/${user?.role}/profile`)}
                            className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:ring-2 ring-primary-300 transition-all overflow-hidden"
                        >
                            {user?.avatar ? <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}

DashboardLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
