import { useEffect, useState } from "react";
import { getMyResults } from "../../api";
import { Award, TrendingUp, CheckCircle, XCircle, Clock, BarChart2, Search } from "lucide-react";

export default function StudentResults() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getMyResults()
            .then((res) => setResults(res.data.results || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = results.filter((r) =>
        r.exam?.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.course?.title?.toLowerCase().includes(search.toLowerCase())
    );

    const passed = results.filter((r) => r.isPassed).length;
    const avgScore = results.length ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length) : 0;
    const highest = results.length ? Math.max(...results.map((r) => r.percentage)) : 0;

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="page-title">My Results</h1>
                    <p className="text-slate-500 text-sm mt-1">{filtered.length} result{filtered.length !== 1 ? "s" : ""} found</p>
                </div>
                {results.length > 0 && (
                    <div className="relative max-w-xs w-full sm:w-64">
                        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            placeholder="Search results..."
                            className="input-field pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Exams", value: results.length, icon: Award, bg: "bg-blue-50", iconColor: "text-blue-600", iconBg: "bg-blue-100" },
                    { label: "Passed", value: passed, icon: CheckCircle, bg: "bg-green-50", iconColor: "text-green-600", iconBg: "bg-green-100" },
                    { label: "Avg Score", value: `${avgScore}%`, icon: TrendingUp, bg: "bg-purple-50", iconColor: "text-purple-600", iconBg: "bg-purple-100" },
                    { label: "Highest Score", value: `${highest}%`, icon: BarChart2, bg: "bg-amber-50", iconColor: "text-amber-600", iconBg: "bg-amber-100" },
                ].map((s) => (
                    <div key={s.label} className="card p-5 flex items-center gap-4">
                        <div className={`w-12 h-12 ${s.iconBg} rounded-xl flex items-center justify-center`}>
                            <s.icon size={22} className={s.iconColor} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
                            <div className="text-slate-500 text-sm">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {results.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <Award size={50} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No results yet</p>
                    <p className="text-sm mt-1">Take exams to see your results here</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <Award size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No results match your search</p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="section-title mb-0">Exam History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    {["Exam", "Course", "Score", "Percentage", "Status", "Time Taken", "Date"].map((h) => (
                                        <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map((r) => (
                                    <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-800 text-sm">{r.exam?.title || "—"}</p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 text-sm">{r.course?.title || "—"}</td>
                                        <td className="px-5 py-4 text-sm font-bold text-slate-800">{r.obtainedMarks}/{r.totalMarks}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${r.percentage >= 70 ? "bg-green-400" : r.percentage >= 40 ? "bg-yellow-400" : "bg-red-400"}`}
                                                        style={{ width: `${r.percentage}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700">{r.percentage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`badge ${r.isPassed ? "badge-green" : "badge-red"} flex items-center gap-1 w-fit`}>
                                                {r.isPassed ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                                {r.isPassed ? "Passed" : "Failed"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 text-sm">
                                            <span className="flex items-center gap-1"><Clock size={12} />{Math.floor(r.timeTaken / 60)}m {r.timeTaken % 60}s</span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                                            {new Date(r.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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
