import { useEffect, useState } from "react";
import { getUpcomingSchedules } from "../../api";
import { Calendar, Clock, Video, ExternalLink, Search } from "lucide-react";

export default function StudentClasses() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getUpcomingSchedules()
            .then((r) => setSchedules(r.data.schedules || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = schedules.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.course?.title?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="page-title">Live Classes</h1>
                    <p className="text-slate-500 text-sm mt-1">{filtered.length} upcoming session{filtered.length !== 1 ? "s" : ""}</p>
                </div>
                {schedules.length > 0 && (
                    <div className="relative max-w-xs w-full sm:w-64">
                        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            placeholder="Search classes..."
                            className="input-field pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {schedules.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <Calendar size={50} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No classes scheduled</p>
                    <p className="text-sm mt-1">New sessions will appear here soon</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No classes match your search</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((s) => (
                        <div key={s._id} className="card p-5 border-l-4 border-l-primary-500">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                                    <Video size={18} className="text-primary-600" />
                                </div>
                                <span className={`badge ${s.status === "live" ? "badge-green animate-pulse" : "badge-blue"}`}>{s.status}</span>
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1">{s.title}</h3>
                            <p className="text-primary-600 text-sm font-semibold mb-3">{s.course?.title}</p>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                    <Calendar size={13} />
                                    {new Date(s.startTime).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                    <Clock size={13} />
                                    {new Date(s.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} ({s.duration} min)
                                </div>
                            </div>

                            <a
                                href={s.joinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`btn-primary w-full py-2 text-sm flex items-center justify-center gap-2 ${s.status !== "live" && "opacity-50 pointer-events-none"}`}
                            >
                                <ExternalLink size={14} /> {s.status === "live" ? "Join Now" : "Starting Soon"}
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
