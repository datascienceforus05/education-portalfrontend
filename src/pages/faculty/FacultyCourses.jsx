import { useEffect, useState } from "react";
import { getMyCourses, createCourse } from "../../api";
import toast from "react-hot-toast";
import { Plus, X, BookOpen, Users, ClipboardList, FileText, Mail, Phone, Calendar } from "lucide-react";

const CATEGORIES = ["IT", "Engineering", "Medical", "Skill Development", "Management", "General Science", "Languages", "Other"];

export default function FacultyCourses() {
    const [courses, setCourses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", code: "", category: "", level: "beginner", duration: "", price: 0, tags: "" });
    const [viewingStudents, setViewingStudents] = useState(null);

    const [search, setSearch] = useState("");

    const fetchCourses = () => {
        getMyCourses().then((r) => setCourses(r.data.courses || [])).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { fetchCourses(); }, []);

    const filtered = courses.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.code?.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await createCourse({ ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) });
            toast.success("Course created! 🎉");
            setShowModal(false);
            setForm({ title: "", description: "", code: "", category: "", level: "beginner", duration: "", price: 0, tags: "" });
            fetchCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create course");
        } finally {
            setSaving(false);
        }
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
                    <h1 className="page-title">My Courses</h1>
                    <p className="text-slate-500 text-sm mt-1">{filtered.length} course{filtered.length !== 1 ? "s" : ""} found</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative max-w-xs hidden sm:block">
                        <Plus size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-45" />
                        <input
                            placeholder="Search courses..."
                            className="input-field pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                        <Plus size={18} />Create Course
                    </button>
                </div>
            </div>

            {/* Mobile Search */}
            <div className="relative sm:hidden">
                <Plus size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-45" />
                <input
                    placeholder="Search courses..."
                    className="input-field pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {courses.length === 0 ? (
                <div className="card p-16 text-center text-slate-400">
                    <BookOpen size={56} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No courses yet</p>
                    <p className="text-sm mt-1 mb-6">Create your first course to get started</p>
                    <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2"><Plus size={18} />Create First Course</button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No courses match your search</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((c) => (
                        <div key={c._id} className="card card-hover overflow-hidden">
                            <div className="h-28 bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center relative overflow-hidden">
                                <div className="text-white/10 text-7xl font-black absolute -right-3 -bottom-3 select-none">{c.title[0]}</div>
                                <div className="text-4xl font-black text-white/80 z-10">{c.title[0]}</div>
                                <span className="absolute top-3 right-3 badge bg-white/20 text-white capitalize">{c.level}</span>
                            </div>
                            <div className="p-5">
                                <div className="mb-1">
                                    <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">{c.code}</span>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{c.title}</h3>
                                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{c.description}</p>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-slate-50 rounded-lg p-2 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setViewingStudents(c)}>
                                        <div className="flex items-center justify-center gap-1 text-slate-600 font-bold text-sm">
                                            <Users size={13} />{c.enrolledStudents?.length || 0}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">Students</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-2">
                                        <div className="flex items-center justify-center gap-1 text-slate-600 font-bold text-sm">
                                            <FileText size={13} />{c.totalMaterials || 0}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">Materials</div>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-2">
                                        <div className="flex items-center justify-center gap-1 text-slate-600 font-bold text-sm">
                                            <ClipboardList size={13} />{c.totalExams || 0}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">Exams</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Course Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-800 text-lg">Create New Course</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Course Title *</label>
                                    <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Python Basics" required />
                                </div>
                                <div>
                                    <label className="label">Course Code *</label>
                                    <input className="input-field uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CS101" required />
                                </div>
                            </div>
                            <div>
                                <label className="label">Description *</label>
                                <textarea className="input-field resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will students learn?" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Category *</label>
                                    <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                                        <option value="">Select category</option>
                                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Level</label>
                                    <select className="input-field" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Duration</label>
                                    <input className="input-field" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 3 months" />
                                </div>
                                <div>
                                    <label className="label">Price (₹)</label>
                                    <input type="number" min="0" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Tags (comma separated)</label>
                                <input className="input-field" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="python, programming, beginners" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? "Creating..." : "Create Course"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Students Modal */}
            {viewingStudents && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-slate-800 text-lg">Enrolled Students</h2>
                                <p className="text-sm text-slate-500">{viewingStudents.title}</p>
                            </div>
                            <button onClick={() => setViewingStudents(null)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4">
                            {!viewingStudents.enrolledStudents || viewingStudents.enrolledStudents.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">
                                    <Users size={40} className="mx-auto mb-3 opacity-30" />
                                    <p>No students enrolled yet</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {viewingStudents.enrolledStudents.map(student => (
                                        <div key={student._id} className="border border-slate-100 rounded-xl p-4 flex gap-4 items-start bg-slate-50 hover:bg-white transition-colors">
                                            <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                                                {student.avatar ? <img src={`http://localhost:5000${student.avatar}`} alt={student.name} className="w-full h-full rounded-full object-cover" /> : student.name[0]}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                                    {student.name}
                                                    {!student.isActive && <span className="badge badge-red text-[10px] px-1.5 py-0">Inactive</span>}
                                                </h4>
                                                <div className="mt-2 space-y-1">
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <Mail size={12} className="text-slate-400" />
                                                        <span className="truncate">{student.email}</span>
                                                    </div>
                                                    {student.phone && (
                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                            <Phone size={12} className="text-slate-400" />
                                                            <span>{student.phone}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <Calendar size={12} className="text-slate-400" />
                                                        <span>Joined: {new Date(student.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
