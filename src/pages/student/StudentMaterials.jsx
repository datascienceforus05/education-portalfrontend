import { useEffect, useState } from "react";
import { getMyCourses, getCourseMaterials } from "../../api";
import { FileText, Download, Video, File, Image, BookOpen, Search } from "lucide-react";

const fileIcons = {
    pdf: { icon: FileText, color: "text-red-500", bg: "bg-red-50" },
    video: { icon: Video, color: "text-blue-500", bg: "bg-blue-50" },
    doc: { icon: File, color: "text-blue-600", bg: "bg-blue-50" },
    ppt: { icon: File, color: "text-orange-500", bg: "bg-orange-50" },
    image: { icon: Image, color: "text-green-500", bg: "bg-green-50" },
    other: { icon: File, color: "text-slate-500", bg: "bg-slate-50" },
};

export default function StudentMaterials() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getMyCourses().then((res) => {
            const c = res.data.courses || [];
            setCourses(c);
            if (c.length > 0) setSelectedCourse(c[0]._id);
        });
    }, []);

    useEffect(() => {
        if (!selectedCourse) return;
        setLoading(true);
        getCourseMaterials(selectedCourse)
            .then((res) => setMaterials(res.data.materials || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedCourse]);

    const filtered = materials.filter((m) => m.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6 animate-slide-up">
            <div>
                <h1 className="page-title">Study Materials</h1>
                <p className="text-slate-500 text-sm mt-1">Access all your course materials</p>
            </div>

            {courses.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <BookOpen size={50} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No courses enrolled</p>
                    <p className="text-sm mt-1">Enroll in courses to access materials</p>
                </div>
            ) : (
                <>
                    {/* Course Selector */}
                    <div className="flex flex-wrap gap-2">
                        {courses.map((c) => (
                            <button
                                key={c._id}
                                onClick={() => setSelectedCourse(c._id)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${selectedCourse === c._id ? "bg-primary-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-primary-50"
                                    }`}
                            >
                                {c.title}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative max-w-md">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input placeholder="Search materials..." className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="card p-10 text-center text-slate-400">
                            <FileText size={40} className="mx-auto mb-3 opacity-30" />
                            <p>No materials found</p>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filtered.map((m) => {
                                const fi = fileIcons[m.fileType] || fileIcons.other;
                                return (
                                    <div key={m._id} className="card card-hover p-5 flex gap-4">
                                        <div className={`w-12 h-12 ${fi.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                            <fi.icon size={22} className={fi.color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2">{m.title}</p>
                                            {m.description && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{m.description}</p>}
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`badge badge-${m.fileType === "pdf" ? "red" : m.fileType === "video" ? "blue" : "gray"}`}>
                                                        {m.fileType.toUpperCase()}
                                                    </span>
                                                    {m.chapter && <span className="text-xs text-slate-400">{m.chapter}</span>}
                                                </div>
                                                <a
                                                    href={`http://localhost:5000${m.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-xs font-semibold p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                                                >
                                                    <Download size={14} />
                                                    Open
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
