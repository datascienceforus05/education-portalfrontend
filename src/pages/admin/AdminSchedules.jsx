import { useEffect, useState } from "react";
import API from "../../api";
import { Calendar, Clock, Video, ExternalLink, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";

const statusColors = { upcoming: "badge-yellow", live: "badge-green", completed: "badge-gray", cancelled: "badge-red" };

export default function AdminSchedules() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        API.get("/schedules/upcoming")
            .then((r) => setSchedules(r.data.schedules || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = schedules.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.course?.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.faculty?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (!confirm("Delete this schedule?")) return;
        try {
            await API.delete(`/schedules/${id}`);
            setSchedules((s) => s.filter((sc) => sc._id !== id));
            toast.success("Schedule deleted");
        } catch { toast.error("Failed"); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="page-title">Scheduled Classes</h1>
                    <p className="text-slate-500 text-sm mt-1">{filtered.length} upcoming session(s)</p>
                </div>
                <div className="relative max-w-xs w-full sm:w-64">
                    <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        placeholder="Search schedules..."
                        className="input-field pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            {schedules.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <Calendar size={50} className="mx-auto mb-4 opacity-30" />
                    <p>No upcoming classes scheduled</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {schedules.map((s) => (
                        <div key={s._id} className="card p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Video size={20} className="text-purple-600" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`badge capitalize ${statusColors[s.status] || "badge-gray"}`}>{s.status}</span>
                                    <button onClick={() => handleDelete(s._id)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{s.title}</h3>
                            <p className="text-primary-600 text-sm font-medium mb-2">{s.course?.title}</p>
                            <div className="space-y-1.5 text-sm text-slate-500 mb-3">
                                <div className="flex items-center gap-2"><Calendar size={13} className="text-primary-400" />{new Date(s.scheduledAt).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}</div>
                                <div className="flex items-center gap-2"><Clock size={13} className="text-primary-400" />{new Date(s.scheduledAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} • {s.duration} min</div>
                                {s.faculty && <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">{s.faculty.name?.[0]}</div>{s.faculty.name}</div>}
                            </div>
                            {s.meetingLink && (
                                <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary-600 font-semibold hover:underline">
                                    <ExternalLink size={12} />Open Meeting Link
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
