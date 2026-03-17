import { useEffect, useState } from "react";
import { getMyCourses, createSchedule, getUpcomingSchedules, updateScheduleStatus, deleteSchedule } from "../../api";
import toast from "react-hot-toast";
import { Calendar, Plus, X, Clock, ExternalLink, Trash2, Video, Search } from "lucide-react";

const PLATFORMS = [
    { value: "google_meet", label: "Google Meet" },
    { value: "zoom", label: "Zoom" },
    { value: "teams", label: "Microsoft Teams" },
    { value: "other", label: "Other" },
];

const statusColors = {
    upcoming: "badge-yellow",
    live: "badge-green",
    completed: "badge-gray",
    cancelled: "badge-red",
};

export default function FacultySchedule() {
    const [courses, setCourses] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: "", description: "", course: "", scheduledAt: "", duration: 60,
        meetingLink: "", meetingId: "", meetingPassword: "", platform: "google_meet", notes: "",
    });

    const [search, setSearch] = useState("");

    const fetchData = () => {
        Promise.all([getMyCourses(), getUpcomingSchedules()])
            .then(([c, s]) => {
                setCourses(c.data.courses || []);
                setSchedules(s.data.schedules || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const filtered = schedules.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.course?.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.platform?.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.course) return toast.error("Select a course");
        setSaving(true);
        try {
            await createSchedule(form);
            toast.success("Class scheduled! 📅");
            setShowModal(false);
            setForm({ title: "", description: "", course: "", scheduledAt: "", duration: 60, meetingLink: "", meetingId: "", meetingPassword: "", platform: "google_meet", notes: "" });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to schedule");
        } finally {
            setSaving(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateScheduleStatus(id, status);
            setSchedules((prev) => prev.map((s) => s._id === id ? { ...s, status } : s));
            toast.success(`Status updated to ${status}`);
        } catch { toast.error("Failed to update"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this scheduled class?")) return;
        try {
            await deleteSchedule(id);
            setSchedules((prev) => prev.filter((s) => s._id !== id));
            toast.success("Schedule deleted");
        } catch { toast.error("Failed to delete"); }
    };

    // Min datetime (now)
    const minDateTime = new Date().toISOString().slice(0, 16);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="page-title">Schedule Classes</h1>
                    <p className="text-slate-500 text-sm mt-1">{filtered.length} session{filtered.length !== 1 ? "s" : ""} found</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative max-w-xs hidden sm:block">
                        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            placeholder="Search schedules..."
                            className="input-field pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                        <Plus size={18} />Schedule Class
                    </button>
                </div>
            </div>

            {/* Mobile Search */}
            <div className="relative sm:hidden">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    placeholder="Search schedules..."
                    className="input-field pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {schedules.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <Calendar size={50} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No upcoming classes</p>
                    <p className="text-sm mt-1 mb-6">Schedule your first online class session</p>
                    <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2"><Plus size={18} />Schedule Now</button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No classes match your search</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((s) => {
                        const scheduledDate = new Date(s.scheduledAt);
                        const isLive = s.status === "live" || (new Date() >= scheduledDate && new Date() <= new Date(scheduledDate.getTime() + s.duration * 60000));
                        return (
                            <div key={s._id} className={`card overflow-hidden ${isLive ? "ring-2 ring-green-400" : ""}`}>
                                {isLive && (
                                    <div className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-2">
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />LIVE NOW
                                    </div>
                                )}
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                            <Video size={20} className="text-purple-600" />
                                        </div>
                                        <span className={`badge capitalize ${statusColors[s.status] || "badge-gray"}`}>{s.status}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{s.title}</h3>
                                    <p className="text-primary-600 text-sm font-medium mb-3">{s.course?.title}</p>
                                    <div className="space-y-1.5 text-sm text-slate-500 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-primary-400 flex-shrink-0" />
                                            {scheduledDate.toLocaleDateString("en-IN", { weekday: "short", month: "long", day: "numeric" })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-primary-400 flex-shrink-0" />
                                            {scheduledDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} • {s.duration} min
                                        </div>
                                    </div>
                                    {s.meetingLink && (
                                        <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary-600 text-xs font-semibold mb-3 hover:underline">
                                            <ExternalLink size={13} />Open Meeting Link
                                        </a>
                                    )}
                                    <div className="flex gap-2">
                                        <select
                                            value={s.status}
                                            onChange={(e) => handleStatusUpdate(s._id, e.target.value)}
                                            className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                                        >
                                            {["upcoming", "live", "completed", "cancelled"].map((st) => (
                                                <option key={st} value={st} className="capitalize">{st.charAt(0).toUpperCase() + st.slice(1)}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Schedule Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 text-lg">Schedule a Class</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-5 space-y-4">
                            <div>
                                <label className="label">Course *</label>
                                <select className="input-field" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required>
                                    <option value="">Select course</option>
                                    {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Class Title *</label>
                                <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Introduction to Variables" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Date & Time *</label>
                                    <input type="datetime-local" min={minDateTime} className="input-field" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="label">Duration (mins) *</label>
                                    <input type="number" min="15" max="360" className="input-field" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
                                </div>
                            </div>
                            <div>
                                <label className="label">Platform</label>
                                <select className="input-field" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                                    {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Meeting Link</label>
                                <input type="url" className="input-field" value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} placeholder="https://meet.google.com/..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Meeting ID</label>
                                    <input className="input-field" value={form.meetingId} onChange={(e) => setForm({ ...form, meetingId: e.target.value })} placeholder="Optional" />
                                </div>
                                <div>
                                    <label className="label">Password</label>
                                    <input className="input-field" value={form.meetingPassword} onChange={(e) => setForm({ ...form, meetingPassword: e.target.value })} placeholder="Optional" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Notes (optional)</label>
                                <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any notes for students..." />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? "Scheduling..." : "Schedule Class"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
