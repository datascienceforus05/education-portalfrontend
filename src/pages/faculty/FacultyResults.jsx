import { useState, useEffect } from "react";
import { getMyCourses, getCourseExams, getExamResults, getResult } from "../../api";
import { Award, BarChart2, CheckCircle, XCircle, TrendingUp, Search, X, Clock, FileText, Check, AlertCircle, Info } from "lucide-react";


export default function FacultyResults() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const [selectedResult, setSelectedResult] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const fetchResultDetails = async (id) => {
        setDetailLoading(true);
        setShowModal(true);
        try {
            const res = await getResult(id);
            setSelectedResult(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        getMyCourses().then((r) => {
            const c = r.data.courses || [];
            setCourses(c);
            if (c.length > 0) setSelectedCourse(c[0]._id);
        });
    }, []);


    useEffect(() => {
        if (!selectedCourse) return;
        getCourseExams(selectedCourse).then((r) => {
            const e = r.data.exams || [];
            setExams(e);
            setSelectedExam(e.length > 0 ? e[0]._id : "");
            setData(null);
        });
    }, [selectedCourse]);

    useEffect(() => {
        if (!selectedExam) return;
        setLoading(true);
        getExamResults(selectedExam)
            .then((r) => setData(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedExam]);

    const filtered = data?.results?.filter((r) =>
        r.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.student?.email?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="page-title">Exam Results</h1>
                    <p className="text-slate-500 text-sm mt-1">View student performance across exams</p>
                </div>
                {data && (
                    <div className="relative max-w-xs w-full sm:w-64">
                        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            placeholder="Filter by student..."
                            className="input-field pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="card p-4 grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="label">Course</label>
                    <select className="input-field" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                        {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                    </select>
                </div>
                <div>
                    <label className="label">Exam</label>
                    <select className="input-field" value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} disabled={exams.length === 0}>
                        {exams.length === 0 ? <option>No exams</option> : exams.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>
            ) : data ? (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        {[
                            { label: "Total", value: data.stats.total, icon: Award, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
                            { label: "Passed", value: data.stats.passed, icon: CheckCircle, iconBg: "bg-green-100", iconColor: "text-green-600" },
                            { label: "Failed", value: data.stats.failed, icon: XCircle, iconBg: "bg-red-100", iconColor: "text-red-600" },
                            { label: "Average", value: `${data.stats.avgPercentage}%`, icon: BarChart2, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
                            { label: "Highest", value: `${data.stats.highest}%`, icon: TrendingUp, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
                        ].map((s) => (
                            <div key={s.label} className="card p-4 flex items-center gap-3">
                                <div className={`w-10 h-10 ${s.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                    <s.icon size={18} className={s.iconColor} />
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-slate-800">{s.value}</div>
                                    <div className="text-slate-500 text-xs">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Results Table */}
                    {data.results.length === 0 ? (
                        <div className="card p-10 text-center text-slate-400">
                            <Award size={40} className="mx-auto mb-3 opacity-30" />
                            <p>No students have taken this exam yet</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="card p-12 text-center text-slate-400">
                            <Award size={40} className="mx-auto mb-3 opacity-30" />
                            <p>No students match your search</p>
                        </div>
                    ) : (
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            {["#", "Student", "Score", "Percentage", "Status", "Time", "Submitted"].map((h) => (
                                                <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filtered.map((r, i) => (
                                            <tr key={r._id} onClick={() => fetchResultDetails(r._id)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                                <td className="px-5 py-3 text-slate-400 text-sm font-medium">{i + 1}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                                            {r.student?.name?.[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800 text-sm">{r.student?.name}</p>
                                                            <p className="text-slate-400 text-xs">{r.student?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 font-bold text-slate-800 text-sm">{r.obtainedMarks}/{r.totalMarks}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${r.percentage >= 70 ? "bg-green-400" : r.percentage >= 40 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${r.percentage}%` }} />
                                                        </div>
                                                        <span className="text-sm font-semibold">{r.percentage}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`badge ${r.isPassed ? "badge-green" : "badge-red"}`}>{r.isPassed ? "Passed" : "Failed"}</span>
                                                </td>
                                                <td className="px-5 py-3 text-slate-500 text-sm">{Math.floor(r.timeTaken / 60)}m {r.timeTaken % 60}s</td>
                                                <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                                                    {new Date(r.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            ) : null}

            {/* Modal for Detailed Answers */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Student Response</h3>
                                    <p className="text-slate-500 text-sm">Detailed breakdown of answers</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-red-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {detailLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                                    <p className="text-slate-400 font-medium animate-pulse">Fetching details...</p>
                                </div>
                            ) : selectedResult ? (
                                <>
                                    {/* Student Header Info */}
                                    <div className="p-5 bg-slate-50 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</p>
                                            <p className="font-bold text-slate-800 truncate">{selectedResult.student?.name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                                            <p className="font-bold text-slate-800">{selectedResult.obtainedMarks} / {selectedResult.totalMarks}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Percentage</p>
                                            <p className={`font-bold ${selectedResult.isPassed ? "text-green-600" : "text-red-600"}`}>{selectedResult.percentage}%</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Taken</p>
                                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                                <Clock size={14} />
                                                {Math.floor(selectedResult.timeTaken / 60)}m {selectedResult.timeTaken % 60}s
                                            </div>
                                        </div>
                                    </div>

                                    {/* Questions List */}
                                    <div className="space-y-8">
                                        {selectedResult.exam?.questions.map((q, qidx) => {
                                                            const studentAnswer = selectedResult.answers.find(a => a.questionId === q._id);
                                                            const isCorrect = studentAnswer?.isCorrect;

                                                            return (
                                                                <div key={q._id} className="relative">
                                                                    <div className="flex items-start gap-4 mb-4">
                                                                        <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm flex-shrink-0">
                                                                            {qidx + 1}
                                                                        </span>
                                                                        <h4 className="font-bold text-slate-800 leading-relaxed pt-1 flex-1">{q.questionText}</h4>
                                                                        <div className={`px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${isCorrect ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                                                            {isCorrect ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                                            {isCorrect ? "Correct" : "Incorrect"}
                                                                        </div>
                                                                    </div>

                                                                    <div className="grid gap-3 ml-12">
                                                                        {q.options.map((opt, oidx) => {
                                                                            const isSelected = studentAnswer?.selectedOption === oidx;
                                                                            const isThisCorrect = opt.isCorrect;
                                                                            let borderClass = "border-slate-100 bg-slate-50/50";

                                                            if (isSelected) {
                                                                borderClass = isThisCorrect ? "border-green-500 bg-green-50/50 ring-1 ring-green-500" : "border-red-500 bg-red-50/50 ring-1 ring-red-500";
                                                            } else if (isThisCorrect) {
                                                                borderClass = "border-green-200 bg-green-50/10";
                                                            }


                                                            return (
                                                                <div key={oidx} className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4 ${borderClass}`}>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${isSelected ? (isThisCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white") : "bg-slate-200 text-slate-500"}`}>
                                                                            {String.fromCharCode(65 + oidx)}
                                                                        </span>
                                                                        <p className={`text-sm ${isSelected ? "font-bold text-slate-800" : "text-slate-600"}`}>{opt.text}</p>
                                                                    </div>
                                                                    {isSelected && (
                                                                        <div className={`p-1 rounded-full ${isThisCorrect ? "bg-green-500" : "bg-red-500"}`}>
                                                                            {isThisCorrect ? <Check size={12} className="text-white" /> : <X size={12} className="text-white" />}
                                                                        </div>
                                                                    )}
                                                                    {!isSelected && isThisCorrect && (
                                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-tight">
                                                                            <AlertCircle size={12} />
                                                                            Correct Ans
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {q.explanation && (
                                                        <div className="mt-4 p-4 bg-primary-50/50 rounded-2xl ml-12 border border-primary-100">
                                                            <div className="flex items-center gap-2 text-primary-600 mb-1">
                                                                <Info size={14} />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">Explanation</span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 italic">{q.explanation}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : null}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <button onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all shadow-lg active:scale-95">
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
