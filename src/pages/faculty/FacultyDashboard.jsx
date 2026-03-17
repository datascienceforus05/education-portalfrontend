import { useEffect, useState } from "react";
import { getMyCourses, getUpcomingSchedules } from "../../api";
import { Link } from "react-router-dom";
import { BookOpen, Users, Calendar, ClipboardList, ArrowRight, Plus, Video } from "lucide-react";

export default function FacultyDashboard() {
    const [courses, setCourses] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getMyCourses(), getUpcomingSchedules()])
            .then(([c, s]) => {
                setCourses(c.data.courses || []);
                setSchedules(s.data.schedules || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const totalStudents = courses.reduce((a, c) => a + (c.enrolledStudents?.length || 0), 0);

    const stats = [
        { label: "My Courses", value: courses.length, icon: BookOpen, iconBg: "bg-blue-100", iconColor: "text-blue-600", to: "/faculty/courses" },
        { label: "Total Students", value: totalStudents, icon: Users, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", to: "" },
        { label: "Scheduled Classes", value: schedules.length, icon: Calendar, iconBg: "bg-purple-100", iconColor: "text-purple-600", to: "/faculty/schedule" },
        { label: "Total Exams", value: courses.reduce((a, c) => a + (c.totalExams || 0), 0), icon: ClipboardList, iconBg: "bg-amber-100", iconColor: "text-amber-600", to: "/faculty/exams" },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="stat-card card card-hover">
                        <div className={`w-12 h-12 ${s.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <s.icon size={22} className={s.iconColor} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                            <div className="text-slate-500 text-sm">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
                <h2 className="section-title">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "New Course", icon: Plus, to: "/faculty/courses", color: "bg-primary-600 hover:bg-primary-700 text-white" },
                        { label: "Upload Material", icon: BookOpen, to: "/faculty/materials", color: "bg-emerald-500 hover:bg-emerald-600 text-white" },
                        { label: "Schedule Class", icon: Video, to: "/faculty/schedule", color: "bg-purple-500 hover:bg-purple-600 text-white" },
                        { label: "Create Exam", icon: ClipboardList, to: "/faculty/exams", color: "bg-amber-500 hover:bg-amber-600 text-white" },
                    ].map((a) => (
                        <Link key={a.label} to={a.to} className={`flex flex-col items-center gap-2 py-4 rounded-xl font-semibold text-sm transition-all active:scale-95 ${a.color}`}>
                            <a.icon size={22} />
                            {a.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* My Courses */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title mb-0">My Courses</h2>
                        <Link to="/faculty/courses" className="text-primary-600 text-sm font-semibold flex items-center gap-1">View all <ArrowRight size={14} /></Link>
                    </div>
                    {courses.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No courses yet. Create one!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {courses.slice(0, 5).map((c) => (
                                <div key={c._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                        {c.title[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm truncate">{c.title}</p>
                                        <p className="text-slate-400 text-xs">{c.enrolledStudents?.length || 0} students</p>
                                    </div>
                                    <span className={`badge capitalize ${c.level === "beginner" ? "badge-green" : c.level === "intermediate" ? "badge-yellow" : "badge-red"}`}>{c.level}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Classes */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title mb-0">Upcoming Classes</h2>
                        <Link to="/faculty/schedule" className="text-primary-600 text-sm font-semibold flex items-center gap-1">View all <ArrowRight size={14} /></Link>
                    </div>
                    {schedules.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Calendar size={36} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No upcoming classes</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {schedules.slice(0, 5).map((s) => (
                                <div key={s._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                        <Video size={18} className="text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 text-sm truncate">{s.title}</p>
                                        <p className="text-slate-400 text-xs">
                                            {new Date(s.scheduledAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} at{" "}
                                            {new Date(s.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
