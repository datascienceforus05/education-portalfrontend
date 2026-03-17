import { useEffect, useState } from "react";
import { getPendingMaterials, approveMaterial, deleteMaterial } from "../../api";
import toast from "react-hot-toast";
import { FileText, CheckCircle, Trash2, ExternalLink, Video, File, Image, Search } from "lucide-react";

const fileIcons = {
    pdf: { icon: FileText, color: "text-red-500", bg: "bg-red-50" },
    video: { icon: Video, color: "text-blue-500", bg: "bg-blue-50" },
    doc: { icon: File, color: "text-blue-600", bg: "bg-blue-50" },
    ppt: { icon: File, color: "text-orange-500", bg: "bg-orange-50" },
    image: { icon: Image, color: "text-green-500", bg: "bg-green-50" },
    other: { icon: File, color: "text-slate-400", bg: "bg-slate-50" },
};

export default function AdminMaterials() {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    useEffect(() => {
        getPendingMaterials()
            .then((r) => setMaterials(r.data.materials || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = materials.filter((m) =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.uploadedBy?.name?.toLowerCase().includes(search.toLowerCase()) ||
        m.course?.title?.toLowerCase().includes(search.toLowerCase())
    );

    const handleApprove = async (id) => {
        try {
            await approveMaterial(id);
            setMaterials((m) => m.filter((mat) => mat._id !== id));
            toast.success("Material approved! Students can now access it.");
        } catch { toast.error("Failed to approve"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this material?")) return;
        try {
            await deleteMaterial(id);
            setMaterials((m) => m.filter((mat) => mat._id !== id));
            toast.success("Material deleted");
        } catch { toast.error("Failed to delete"); }
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
                    <h1 className="page-title">Pending Materials</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {filtered.length > 0 ? `${filtered.length} material(s) found` : "All materials reviewed"}
                    </p>
                </div>
                <div className="relative max-w-xs w-full sm:w-64">
                    <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        placeholder="Search materials..."
                        className="input-field pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {materials.length === 0 ? (
                <div className="card p-16 text-center text-slate-400">
                    <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                        <CheckCircle size={36} className="text-green-500" />
                    </div>
                    <p className="text-lg font-medium text-slate-600">All caught up!</p>
                    <p className="text-sm mt-1">No materials pending review</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <FileText size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No materials match your search</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((m) => {
                        const fi = fileIcons[m.fileType] || fileIcons.other;
                        return (
                            <div key={m._id} className="card p-5 border-l-4 border-l-amber-400">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`w-12 h-12 ${fi.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                        <fi.icon size={22} className={fi.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm line-clamp-2">{m.title}</p>
                                        {m.description && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{m.description}</p>}
                                        <span className={`badge mt-2 ${m.fileType === "pdf" ? "badge-red" : m.fileType === "video" ? "badge-blue" : "badge-gray"}`}>
                                            {m.fileType?.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-xs text-slate-500 mb-4 bg-slate-50 rounded-xl p-3">
                                    <div><span className="font-semibold text-slate-600">Course:</span> {m.course?.title || "—"}</div>
                                    <div><span className="font-semibold text-slate-600">Uploaded by:</span> {m.uploadedBy?.name || "—"}</div>
                                    <div><span className="font-semibold text-slate-600">Email:</span> {m.uploadedBy?.email || "—"}</div>
                                    {m.chapter && <div><span className="font-semibold text-slate-600">Chapter:</span> {m.chapter}</div>}
                                </div>
                                <div className="flex gap-2">
                                    <a href={`http://localhost:5000${m.fileUrl}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-primary-600 hover:bg-primary-50 transition-colors">
                                        <ExternalLink size={13} />Preview
                                    </a>
                                    <button onClick={() => handleApprove(m._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-semibold transition-colors">
                                        <CheckCircle size={13} />Approve
                                    </button>
                                    <button onClick={() => handleDelete(m._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
