import { useEffect, useState } from "react";
import { getAllCourses } from "../../api";
import { BookOpen, Users, FileText, ClipboardList, Search } from "lucide-react";

export default function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getAllCourses().then((r) => setCourses(r.data.courses || [])).catch(console.error).finally(() => setLoading(false));
    }, []);

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
                    <h1 className="page-title">All Courses</h1>
                    <p className="text-slate-500 text-sm mt-1">{courses.length} courses on the platform</p>
                </div>
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
                                    {["Course", "Faculty", "Category", "Students", "Materials", "Exams", "Status"].map((h) => (
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
                                            <span className="flex items-center gap-1 text-sm text-slate-700"><ClipboardList size={14} className="text-slate-400" />{c.totalExams || 0}</span>
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
        </div>
    );
}
