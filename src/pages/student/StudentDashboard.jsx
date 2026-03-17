import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCourses, getUpcomingSchedules, getMyResults } from "../../api";
import { BookOpen, Video, Award, TrendingUp, Clock, ArrowRight, Play } from "lucide-react";

export default function StudentDashboard() {
    const [courses, setCourses] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getMyCourses(), getUpcomingSchedules(), getMyResults()])
            .then(([c, s, r]) => {
                setCourses(c.data.courses || []);
                setSchedules(s.data.schedules || []);
                setResults(r.data.results || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const avgScore = results.length
        ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length)
        : 0;

    const stats = [
        { label: "Enrolled Courses", value: courses.length, icon: BookOpen, color: "bg-blue-50 text-blue-600", iconBg: "bg-blue-100" },
        { label: "Upcoming Classes", value: schedules.length, icon: Video, color: "bg-emerald-50 text-emerald-600", iconBg: "bg-emerald-100" },
        { label: "Exams Taken", value: results.length, icon: Award, color: "bg-purple-50 text-purple-600", iconBg: "bg-purple-100" },
        { label: "Avg. Score", value: `${avgScore}%`, icon: TrendingUp, color: "bg-amber-50 text-amber-600", iconBg: "bg-amber-100" },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 animate-slide-up">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                    <div key={s.label} className="stat-card card-hover">
                        <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <s.icon size={22} className={s.color.split(" ")[1]} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                            <div className="text-slate-500 text-sm">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* My Courses */}
                <div className="lg:col-span-2 card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title mb-0">My Courses</h2>
                        <Link to="/student/courses" className="text-primary-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                            View all <ArrowRight size={14} />
                        </Link>
                    </div>
                    {courses.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
                            <p>No courses enrolled yet.</p>
                            <Link to="/student/courses" className="btn-primary inline-block mt-4 text-sm">Browse Courses</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {courses.slice(0, 4).map((c) => (
                                <div key={c._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors group">
                                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl flex-shrink-0">
                                        {c.title[0]}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-slate-800 truncate">{c.title}</p>
                                        <p className="text-slate-500 text-sm">{c.faculty?.name || "Instructor"} • {c.level}</p>
                                    </div>
                                    <Link to={`/student/courses/${c._id}`} className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Classes */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title mb-0">Upcoming Classes</h2>
                        <Link to="/student/classes" className="text-primary-600 text-sm font-semibold">View all</Link>
                    </div>
                    {schedules.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <Video size={36} className="mx-auto mb-3 opacity-40" />
                            <p className="text-sm">No upcoming classes</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {schedules.slice(0, 4).map((s) => (
                                <div key={s._id} className="p-3 bg-primary-50 border border-primary-100 rounded-xl">
                                    <p className="font-semibold text-slate-800 text-sm leading-tight">{s.title}</p>
                                    <p className="text-slate-500 text-xs mt-1">{s.course?.title}</p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <Clock size={12} className="text-primary-500" />
                                        <span className="text-primary-600 text-xs font-medium">
                                            {new Date(s.scheduledAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} • {new Date(s.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                    {s.meetingLink && (
                                        <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1.5 text-xs text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg transition-colors w-fit">
                                            <Play size={12} />Join Class
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Results */}
            {results.length > 0 && (
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="section-title mb-0">Recent Results</h2>
                        <Link to="/student/results" className="text-primary-600 text-sm font-semibold flex items-center gap-1">View all <ArrowRight size={14} /></Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    {["Exam", "Course", "Score", "Status", "Date"].map((h) => (
                                        <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide pb-3 pr-4">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {results.slice(0, 5).map((r) => (
                                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-3 pr-4 font-medium text-slate-800 text-sm">{r.exam?.title || "—"}</td>
                                        <td className="py-3 pr-4 text-slate-500 text-sm">{r.course?.title || "—"}</td>
                                        <td className="py-3 pr-4">
                                            <span className="font-bold text-slate-800">{r.percentage}%</span>
                                            <span className="text-slate-400 text-xs ml-1">({r.obtainedMarks}/{r.totalMarks})</span>
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className={`badge ${r.isPassed ? "badge-green" : "badge-red"}`}>
                                                {r.isPassed ? "Passed" : "Failed"}
                                            </span>
                                        </td>
                                        <td className="py-3 text-slate-500 text-xs">
                                            {new Date(r.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
