import { useEffect, useState } from "react";
import { getAllCourses, getAdminUsers, createCourse } from "../../api";
import { BookOpen, Users, FileText, Search, Plus, X } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        code: "",
        category: "IT",
        faculty: ""
    });

    const categories = ["IT", "Medical", "Engineering", "Law", "Nursing", "Skill Development"];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cRes, fRes] = await Promise.all([
                getAllCourses(),
                getAdminUsers({ role: "faculty", isApproved: true })
            ]);
            setCourses(cRes.data.courses || []);
            setFaculties(fRes.data.users || []);
            if (fRes.data.users?.length > 0) {
                setFormData(prev => ({ ...prev, faculty: fRes.data.users[0]._id }));
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.faculty) return toast.error("Please select a faculty");
        
        setSubmitting(true);
        try {
            await createCourse(formData);
            toast.success("Course created successfully!");
            setShowModal(false);
            setFormData({ title: "", code: "", category: "IT", faculty: faculties[0]?._id });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create course");
        } finally {
            setSubmitting(false);
        }
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
                    <h1 className="page-title text-2xl font-black text-slate-800">All Courses</h1>
                    <p className="text-slate-500 text-sm mt-1">{courses.length} courses on the platform</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> Add New Course
                </button>
            </div>

            <div className="relative max-w-md">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input placeholder="Search by title, code, faculty..." className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {filtered.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <BookOpen size={50} className="mx-auto mb-4 opacity-30" />
                    <p>No courses found</p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {["Course", "Faculty", "Category", "Students", "Materials", "Status"].map((h) => (
                                        <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((c) => (
                                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {c.title[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">{c.title}</p>
                                                    <p className="text-slate-400 text-xs font-mono">{c.code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">{c.faculty?.name?.[0]}</div>
                                                <span className="text-sm text-slate-600">{c.faculty?.name || "—"}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4"><span className="badge badge-blue">{c.category}</span></td>
                                        <td className="px-5 py-4">
                                            <span className="flex items-center gap-1 text-sm text-slate-700"><Users size={14} className="text-slate-400" />{c.enrolledStudents?.length || 0}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="flex items-center gap-1 text-sm text-slate-700"><FileText size={14} className="text-slate-400" />{c.totalMaterials || 0}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`badge ${c.isActive ? "badge-green" : "badge-red"}`}>{c.isActive ? "Active" : "Inactive"}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Course Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-scale-in">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-800">Add New Program</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Course Title</label>
                                <input 
                                    required
                                    className="input-field"
                                    placeholder="e.g. Mechanical Engineering"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Course Code</label>
                                    <input 
                                        required
                                        className="input-field"
                                        placeholder="e.g. ENG101"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Category</label>
                                    <select 
                                        className="input-field"
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Assign Faculty</label>
                                <select 
                                    required
                                    className="input-field"
                                    value={formData.faculty}
                                    onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                                >
                                    {faculties.map(f => (
                                        <option key={f._id} value={f._id}>{f.name} ({f.department})</option>
                                    ))}
                                </select>
                            </div>

                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full btn-primary py-4 mt-4"
                            >
                                {submitting ? "Creating..." : "Launch Program"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
