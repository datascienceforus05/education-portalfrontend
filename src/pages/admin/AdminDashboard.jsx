import { useEffect, useState } from "react";
import { getAdminStats, seedAdmin } from "../../api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Users, BookOpen, FileText, ClipboardList, Calendar, BarChart2, Shield, ArrowRight, Trophy } from "lucide-react";


export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        getAdminStats()
            .then((r) => setStats(r.data.stats))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSeed = async () => {
        setSeeding(true);
        try {
            await seedAdmin();
            toast.success("Admin user created: admin@collegemobi.com / Admin@123");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed");
        } finally {
            setSeeding(false);
        }
    };

    const statCards = stats ? [
        { label: "Total Students", value: stats.students, icon: Users, color: "text-blue-600", bg: "bg-blue-100", gradient: "from-blue-500 to-blue-600", to: "/admin/users?role=student" },
        { label: "Faculty Members", value: stats.faculty, icon: Shield, color: "text-emerald-600", bg: "bg-emerald-100", gradient: "from-emerald-500 to-emerald-600", to: "/admin/users?role=faculty" },
        { label: "Active Courses", value: stats.courses, icon: BookOpen, color: "text-purple-600", bg: "bg-purple-100", gradient: "from-purple-500 to-purple-600", to: "/admin/courses" },
        { label: "Materials", value: stats.materials, icon: FileText, color: "text-amber-600", bg: "bg-amber-100", gradient: "from-amber-500 to-amber-600", to: "/admin/materials" },
        { label: "Exams", value: stats.exams, icon: ClipboardList, color: "text-rose-600", bg: "bg-rose-100", gradient: "from-rose-500 to-rose-600", to: "/" },
        { label: "Upcoming Classes", value: stats.schedules, icon: Calendar, color: "text-cyan-600", bg: "bg-cyan-100", gradient: "from-cyan-500 to-cyan-600", to: "/admin/schedules" },
        { label: "Total Results", value: stats.results, icon: BarChart2, color: "text-indigo-600", bg: "bg-indigo-100", gradient: "from-indigo-500 to-indigo-600", to: "/" },
        { label: "Leaderboard", value: "Ranking", icon: Trophy, color: "text-amber-600", bg: "bg-amber-100", gradient: "from-amber-400 to-amber-600", to: "/admin/leaderboard" },
    ] : [];


    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">CollegeMobi Edu</h2>
                            <p className="text-slate-500 text-sm mt-1">Manage the entire online campus</p>
                        </div>
                <button onClick={handleSeed} disabled={seeding} className="btn-secondary text-sm flex items-center gap-2">
                    <Shield size={16} />{seeding ? "Creating..." : "Seed Admin User"}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {statCards.map((s) => (
                    <Link to={s.to} key={s.label} className="card card-hover p-5 group">
                        <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                            <s.icon size={22} className={s.color} />
                        </div>
                        <div className="text-3xl font-bold text-slate-800 mb-1">{s.value}</div>
                        <div className="text-slate-500 text-sm flex items-center justify-between">
                            {s.label}
                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-primary-500 transition-opacity" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Links */}
            <div className="card p-6">
                <h2 className="section-title">Quick Management</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Approve Faculty", desc: "Review pending faculty registrations", to: "/admin/users", icon: Shield, color: "bg-emerald-500" },
                        { label: "Manage Users", desc: "View, activate, or suspend accounts", to: "/admin/users", icon: Users, color: "bg-blue-500" },
                        { label: "Approve Materials", desc: "Review uploaded study materials", to: "/admin/materials", icon: FileText, color: "bg-amber-500" },
                        { label: "View Courses", desc: "Manage all courses on the platform", to: "/admin/courses", icon: BookOpen, color: "bg-purple-500" },
                    ].map((item) => (
                        <Link key={item.label} to={item.to} className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 group">
                            <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                                <item.icon size={18} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
                                <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{item.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
