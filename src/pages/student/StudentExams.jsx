import { useEffect, useState } from "react";
import { getMyCourses, getCourseExams, getExam, submitExam } from "../../api";
import toast from "react-hot-toast";
import { ClipboardList, Clock, Award, Play, CheckCircle, AlertTriangle, Search } from "lucide-react";

export default function StudentExams() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [exams, setExams] = useState([]);
    const [activeExam, setActiveExam] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [startTime, setStartTime] = useState(null);

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
        getCourseExams(selectedCourse).then((res) => setExams(res.data.exams || [])).catch(console.error);
    }, [selectedCourse]);

    const filtered = exams.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        if (!activeExam || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) { clearInterval(timer); handleSubmit(); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [activeExam, timeLeft]);

    const startExam = async (examId) => {
        try {
            const res = await getExam(examId);
            setActiveExam(res.data.exam);
            setTimeLeft(res.data.exam.duration * 60);
            setAnswers({});
            setResult(null);
            setStartTime(Date.now());
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load exam");
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({ questionId, selectedOption: parseInt(selectedOption) }));
            const timeTaken = Math.round((Date.now() - startTime) / 1000);
            const res = await submitExam(activeExam._id, { answers: formattedAnswers, timeTaken });
            setResult(res.data.result);
            setActiveExam(null);
            toast.success("Exam submitted successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

    // Show Result
    if (result) return (
        <div className="max-w-lg mx-auto mt-8 animate-slide-up">
            <div className="card p-8 text-center">
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${result.isPassed ? "bg-green-100" : "bg-red-100"}`}>
                    {result.isPassed ? <CheckCircle size={40} className="text-green-500" /> : <AlertTriangle size={40} className="text-red-500" />}
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{result.isPassed ? "Exam Passed! 🎉" : "Keep Practicing"}</h2>
                <p className="text-slate-500 mb-6">You scored {result.obtainedMarks} out of {result.totalMarks}</p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-slate-800">{result.percentage}%</div>
                        <div className="text-xs text-slate-500 mt-1">Score</div>
                    </div>
                    <div className={`rounded-xl p-4 ${result.isPassed ? "bg-green-50" : "bg-red-50"}`}>
                        <div className={`text-2xl font-bold ${result.isPassed ? "text-green-600" : "text-red-600"}`}>{result.isPassed ? "PASS" : "FAIL"}</div>
                        <div className="text-xs text-slate-500 mt-1">Result</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                        <div className="text-2xl font-bold text-slate-800">{Math.floor(result.timeTaken / 60)}m</div>
                        <div className="text-xs text-slate-500 mt-1">Time</div>
                    </div>
                </div>
                <button onClick={() => setResult(null)} className="btn-primary w-full">Back to Exams</button>
            </div>
        </div>
    );

    // Active Exam View
    if (activeExam) return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            {/* Exam Header */}
            <div className="card p-4 mb-6 flex items-center justify-between sticky top-0 z-10">
                <div>
                    <h2 className="font-bold text-slate-800">{activeExam.title}</h2>
                    <p className="text-sm text-slate-500">Answer all questions carefully</p>
                </div>
                <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-xl ${timeLeft < 120 ? "bg-red-100 text-red-600" : "bg-primary-100 text-primary-700"}`}>
                    <Clock size={20} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="space-y-5 mb-6">
                {activeExam.questions.map((q, qi) => (
                    <div key={q._id} className="card p-6 animate-fade-in">
                        <p className="font-semibold text-slate-800 mb-4">
                            <span className="text-primary-600 font-bold mr-2">Q{qi + 1}.</span>
                            {q.questionText}
                            <span className="text-slate-400 text-sm ml-2">({q.marks} mark{q.marks !== 1 ? "s" : ""})</span>
                        </p>
                        <div className="space-y-2">
                            {q.options.map((opt, oi) => (
                                <label
                                    key={oi}
                                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${answers[q._id] == oi
                                        ? "border-primary-500 bg-primary-50"
                                        : "border-slate-200 hover:border-primary-300 hover:bg-slate-50"
                                        }`}
                                >
                                    <input type="radio" name={q._id} value={oi} checked={answers[q._id] == oi} onChange={() => setAnswers({ ...answers, [q._id]: oi })} className="hidden" />
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${answers[q._id] == oi ? "border-primary-600 bg-primary-600" : "border-slate-300"}`}>
                                        {answers[q._id] == oi && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <span className="text-slate-700">{opt.text}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full py-4 text-base">
                {submitting ? "Submitting..." : `Submit Exam (${Object.keys(answers).length}/${activeExam.questions.length} answered)`}
            </button>
        </div>
    );

    // Exam List
    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="page-title">Exams</h1>
                    <p className="text-slate-500 text-sm mt-1">{filtered.length} exam{filtered.length !== 1 ? "s" : ""} available</p>
                </div>
                <div className="relative max-w-xs w-full sm:w-64">
                    <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        placeholder="Search exams..."
                        className="input-field pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {courses.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {courses.map((c) => (
                        <button key={c._id} onClick={() => setSelectedCourse(c._id)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${selectedCourse === c._id ? "bg-primary-600 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-primary-50"}`}>
                            {c.title}
                        </button>
                    ))}
                </div>
            )}

            {exams.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <ClipboardList size={50} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No exams available</p>
                    <p className="text-sm mt-1">Exams will appear here when your faculty schedules them</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No exams match your search</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((exam) => {
                        const isOpen = !exam.startTime || new Date(exam.startTime) <= new Date();
                        const isEnded = exam.endTime && new Date(exam.endTime) < new Date();
                        return (
                            <div key={exam._id} className="card card-hover p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <ClipboardList size={20} className="text-primary-600" />
                                    </div>
                                    <span className={`badge ${isEnded ? "badge-red" : isOpen ? "badge-green" : "badge-yellow"}`}>
                                        {isEnded ? "Ended" : isOpen ? "Open" : "Upcoming"}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1 line-clamp-2">{exam.title}</h3>
                                {exam.description && <p className="text-slate-500 text-sm mb-3 line-clamp-2">{exam.description}</p>}
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                    <span className="flex items-center gap-1"><Clock size={14} /> {exam.duration} min</span>
                                    <span className="flex items-center gap-1"><Award size={14} /> {exam.totalMarks} marks</span>
                                </div>
                                {exam.instructions && <p className="text-xs text-slate-400 bg-slate-50 rounded-lg p-2 mb-4 line-clamp-3">{exam.instructions}</p>}
                                <button
                                    onClick={() => startExam(exam._id)}
                                    disabled={!isOpen || isEnded}
                                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${!isOpen || isEnded ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "btn-primary"
                                        }`}
                                >
                                    <Play size={16} /> Start Exam
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
