import { useEffect, useState, useCallback } from "react";
import { getMyCourses, getCourseMaterials, uploadMaterial, updateMaterial, deleteMaterial } from "../../api";
import toast from "react-hot-toast";
import { Upload, FileText, Search, X, Trash2, Edit2, ExternalLink, Video, File, CheckCircle } from "lucide-react";

const fileIcons = {
    pdf: { icon: FileText, color: "text-red-500", bg: "bg-red-50" },
    video: { icon: Video, color: "text-blue-500", bg: "bg-blue-50" },
    doc: { icon: File, color: "text-blue-600", bg: "bg-blue-50" },
    ppt: { icon: File, color: "text-orange-500", bg: "bg-orange-50" },
    image: { icon: File, color: "text-green-500", bg: "bg-green-50" },
    live: { icon: Video, color: "text-purple-500", bg: "bg-purple-50" },
    link: { icon: File, color: "text-blue-400", bg: "bg-blue-50" },
    other: { icon: File, color: "text-slate-400", bg: "bg-slate-50" },
};

export default function FacultyMaterials() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", chapter: "", order: 0, isLive: false, liveUrl: "", scheduledDate: "" });
    const [file, setFile] = useState(null);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const [search, setSearch] = useState("");

    useEffect(() => {
        getMyCourses()
            .then((r) => {
                const c = r.data.courses || [];
                setCourses(c);
                if (c.length > 0) setSelectedCourse(c[0]._id);
            })
            .finally(() => setLoading(false));
    }, []);

    const fetchMaterials = useCallback(() => {
        if (!selectedCourse) return;
        getCourseMaterials(selectedCourse)
            .then((r) => setMaterials(r.data.materials || []))
            .catch(console.error);
    }, [selectedCourse]);

    useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

    const filtered = materials.filter((m) =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.description?.toLowerCase().includes(search.toLowerCase()) ||
        m.chapter?.toLowerCase().includes(search.toLowerCase())
    );

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!form.isLive && !file && !editingMaterial) return toast.error("Please select a file");
        if (form.isLive && !form.liveUrl) return toast.error("Please provide a Live URL");
        if (!selectedCourse) return toast.error("Please select a course first");
        setUploading(true);
        try {
            const fd = new FormData();
            if (file && !form.isLive) fd.append("file", file);
            fd.append("title", form.title);
            fd.append("description", form.description);
            fd.append("chapter", form.chapter);
            fd.append("order", form.order);
            fd.append("course", selectedCourse);
            if (form.isLive) {
                fd.append("isLive", "true");
                fd.append("liveUrl", form.liveUrl);
                if (form.scheduledDate) fd.append("scheduledDate", form.scheduledDate);
            }

            if (editingMaterial) {
                await updateMaterial(editingMaterial._id, fd);
                toast.success("Material updated successfully!");
                setEditingMaterial(null);
            } else {
                await uploadMaterial(fd);
                toast.success("Material uploaded! Pending admin approval.");
            }
            setShowUpload(false);
            setFile(null);
            setForm({ title: "", description: "", chapter: "", order: 0, isLive: false, liveUrl: "", scheduledDate: "" });
            fetchMaterials();
        } catch (err) {
            toast.error(err.response?.data?.message || (editingMaterial ? "Update failed" : "Upload failed"));
        } finally {
            setUploading(false);
        }
    };

    const openEdit = (m) => {
        setEditingMaterial(m);
        setForm({
            title: m.title,
            description: m.description || "",
            chapter: m.chapter || "",
            order: m.order || 0,
            isLive: m.fileType === "live" || m.fileType === "link",
            liveUrl: m.liveUrl || (m.fileType === "link" ? m.fileUrl : ""),
            scheduledDate: m.scheduledDate ? new Date(m.scheduledDate).toISOString().slice(0, 16) : ""
        });
        setFile(null);
        setShowUpload(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this material?")) return;
        try {
            await deleteMaterial(id);
            setMaterials((prev) => prev.filter((m) => m._id !== id));
            toast.success("Material deleted");
        } catch {
            toast.error("Delete failed");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            if (!form.title) setForm((f) => ({ ...f, title: droppedFile.name.replace(/\.[^.]+$/, "") }));
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
                    <h1 className="page-title">Study Materials</h1>
                    <p className="text-slate-500 text-sm mt-1">Upload and manage course materials</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative max-w-xs hidden sm:block">
                        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            placeholder="Search materials..."
                            className="input-field pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setShowUpload(true)} className="btn-primary flex items-center gap-2" disabled={!selectedCourse}>
                        <Upload size={18} />Upload Material
                    </button>
                </div>
            </div>

            {/* Course Selector */}
            {courses.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {courses.map((c) => (
                        <button key={c._id} onClick={() => setSelectedCourse(c._id)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${selectedCourse === c._id ? "bg-primary-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-primary-50"}`}>
                            {c.title}
                        </button>
                    ))}
                </div>
            )}

            {/* Search for Mobile */}
            <div className="relative sm:hidden">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    placeholder="Search materials..."
                    className="input-field pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {materials.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <FileText size={50} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No materials yet</p>
                    <p className="text-sm mt-1">Select a course and upload your first material</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <FileText size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No materials match your search</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((m) => {
                        const fi = fileIcons[m.fileType] || fileIcons.other;
                        return (
                            <div key={m._id} className="card p-5 group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 ${fi.bg} rounded-xl flex items-center justify-center`}>
                                        <fi.icon size={24} className={fi.color} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openEdit(m)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary-600"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(m._id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{m.title}</h3>
                                <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{m.description || "No description provided."}</p>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <span className={`badge ${m.status === "approved" ? "badge-green" : m.status === "pending" ? "badge-yellow" : "badge-red"}`}>{m.status}</span>
                                        {m.chapter && <span className="text-xs text-slate-400">Ch. {m.chapter}</span>}
                                    </div>
                                    <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1">View<ExternalLink size={14} /></a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">{editingMaterial ? "Edit Material" : "Upload Material"}</h2>
                            <button onClick={() => { setShowUpload(false); setEditingMaterial(null); setFile(null); }} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleUpload} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="label">Title</label>
                                    <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter material title" />
                                </div>
                                <div>
                                    <label className="label">Chapter</label>
                                    <input className="input-field" value={form.chapter} onChange={(e) => setForm({ ...form, chapter: e.target.value })} placeholder="e.g. 1" />
                                </div>
                                <div>
                                    <label className="label">Order</label>
                                    <input type="number" className="input-field" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
                                </div>
                            </div>

                            {!editingMaterial && (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${dragOver ? "border-primary-500 bg-primary-50" : file ? "border-green-400 bg-green-50" : "border-slate-200 hover:border-primary-300"}`}
                                >
                                    <input type="file" onChange={(e) => setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <div className="flex flex-col items-center">
                                        {file ? <CheckCircle size={32} className="text-green-500 mb-2" /> : <Upload size={32} className="text-slate-300 mb-2" />}
                                        <p className="text-sm font-semibold text-slate-700">{file ? file.name : "Click or drag to upload file"}</p>
                                        <p className="text-xs text-slate-400 mt-1">PDF, DOC, PPT, Images up to 10MB</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="label">Description</label>
                                <textarea className="input-field min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Provide a brief description of the material..." />
                            </div>

                            <button type="submit" disabled={uploading} className="btn-primary w-full h-12 text-base">
                                {uploading ? "Uploading..." : editingMaterial ? "Update Material" : "Schedule Upload"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
