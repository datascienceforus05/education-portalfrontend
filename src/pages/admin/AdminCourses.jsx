import { useEffect, useState } from "react";
import { getAllCourses, getAdminUsers, createCourse, updateCourse, deleteCourse } from "../../api";
import { BookOpen, Users, FileText, Search, Plus, X, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        code: "",
        category: "Engineering",
        duration: "12 Weeks",
        faculty: "",
        description: ""
    });

    const categories = ["Engineering", "Medical", "Law", "Technology", "Fine Arts", "Social Science"];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cRes, fRes] = await Promise.all([
                getAllCourses(),
                getAdminUsers({ role: "faculty", isApproved: true })
            ]);
            setCourses(cRes.data.courses || []);
            setFaculties(fRes.data.users || []);
            if (fRes.data.users?.length > 0 && !editId) {
                setFormData(prev => ({ ...prev, faculty: fRes.data.users[0]._id }));
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.faculty) return toast.error("Please select a faculty");
        
        setSubmitting(true);
        try {
            if (editId) {
                await updateCourse(editId, formData);
                toast.success("Course updated!");
            } else {
                await createCourse(formData);
                toast.success("Course created!");
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save course");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
        try {
            await deleteCourse(id);
            toast.success("Course deleted");
            setCourses(courses.filter(c => c._id !== id));
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    const openEdit = (course) => {
        setEditId(course._id);
        setFormData({
            title: course.title,
            code: course.code,
            category: course.category,
            duration: course.duration || "12 Weeks",
            faculty: course.faculty?._id || "",
            description: course.description || ""
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditId(null);
        setFormData({ title: "", code: "", category: "Engineering", duration: "12 Weeks", faculty: faculties[0]?._id || "", description: "" });
    };

    const filtered = courses.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.code?.toLowerCase().includes(search.toLowerCase()) ||
        c.faculty?.name?.toLowerCase().includes(search.toLowerCase())
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
                    <h1 className="page-title text-2xl font-black text-slate-800">Program Management</h1>
                    <p className="text-slate-500 text-sm mt-1">{courses.length} educational programs live</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl"
                >
                    <Plus size={18} /> Add New Program
                </button>
            </div>

            <div className="relative max-w-md">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input placeholder="Search programs..." className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                {["Course Info", "Faculty", "Category", "Status", "Actions"].map((h) => (
                                    <th key={h} className="text-left text-xs font-black uppercase tracking-widest text-slate-400 px-6 py-4">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-300 font-bold">No programs found</td></tr>
                            ) : filtered.map((c) => (
                                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 font-black flex-shrink-0">
                                                {c.title[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{c.title}</p>
                                                <p className="text-slate-400 text-xs font-black uppercase tracking-tighter">{c.code}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px]">{c.faculty?.name?.[0]}</div>
                                            <span className="text-sm font-bold text-slate-600 truncate max-w-[120px]">{c.faculty?.name || "—"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5"><span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">{c.category}</span></td>
                                    <td className="px-6 py-5">
                                        <span className={`flex items-center gap-1.5 text-xs font-bold ${c.isActive ? "text-emerald-500" : "text-slate-400"}`}>
                                            {c.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />} {c.isActive ? "Active" : "Archived"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(c)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(c._id, c.title)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl animate-scale-in">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-800 font-heading">{editId ? "Update Program" : "Launch New Program"}</h2>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Course Title</label>
                                    <input required className="input-field" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Code</label>
                                    <input required className="input-field" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Category</label>
                                    <select className="input-field" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Duration</label>
                                    <input className="input-field" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Faculty Expert</label>
                                <select required className="input-field" value={formData.faculty} onChange={(e) => setFormData({...formData, faculty: e.target.value})}>
                                    <option value="">Select Faculty</option>
                                    {faculties.map(f => <option key={f._id} value={f._id}>{f.name} ({f.department})</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Program Description</label>
                                <textarea rows={4} required className="input-field py-3 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe what students will learn..." />
                            </div>

                            <button type="submit" disabled={submitting} className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary-600/20">
                                {submitting ? "Processing..." : (editId ? "Confirm Changes" : "Create Official Program")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
