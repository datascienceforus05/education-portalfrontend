import { useEffect, useState } from "react";
import { getMyCourses, createExam, getCourseExams, toggleExam } from "../../api";
import toast from "react-hot-toast";
import { ClipboardList, Plus, X, Trash2, Award, Clock, Power } from "lucide-react";

const emptyQuestion = () => ({ questionText: "", marks: 1, options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] });

export default function FacultyExams() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", duration: 30, instructions: "", shuffleQuestions: false, startTime: "", endTime: "" });
    const [questions, setQuestions] = useState([emptyQuestion()]);

    const [search, setSearch] = useState("");

    useEffect(() => {
        getMyCourses().then((r) => {
            const c = r.data.courses || [];
            setCourses(c);
            if (c.length > 0) setSelectedCourse(c[0]._id);
        }).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedCourse) return;
        getCourseExams(selectedCourse).then((r) => setExams(r.data.exams || [])).catch(console.error);
    }, [selectedCourse]);

    const filtered = exams.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase())
    );

    const addQuestion = () => setQuestions((q) => [...q, emptyQuestion()]);
    const removeQuestion = (i) => setQuestions((q) => q.filter((_, idx) => idx !== i));

    const updateQuestion = (qi, field, value) => setQuestions((q) => q.map((question, i) => i === qi ? { ...question, [field]: value } : question));
    const updateOption = (qi, oi, field, value) => {
        setQuestions((q) => q.map((question, i) => {
            if (i !== qi) return question;
            const opts = question.options.map((o, j) => {
                if (field === "isCorrect") return { ...o, isCorrect: j === oi };
                if (j === oi) return { ...o, [field]: value };
                return o;
            });
            return { ...question, options: opts };
        }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        for (const [i, q] of questions.entries()) {
            if (!q.questionText.trim()) { toast.error(`Question ${i + 1} is empty`); return; }
            if (q.options.some((o) => !o.text.trim())) { toast.error(`All options for Q${i + 1} must have text`); return; }
        }
        setSaving(true);
        try {
            const res = await createExam({ ...form, course: selectedCourse, questions });
            setExams((e) => [res.data.exam, ...e]);
            toast.success("Exam created! Activate it when ready.");
            setShowModal(false);
            setForm({ title: "", description: "", duration: 30, instructions: "", shuffleQuestions: false, startTime: "", endTime: "" });
            setQuestions([emptyQuestion()]);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create exam");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            const res = await toggleExam(id);
            setExams((e) => e.map((ex) => ex._id === id ? res.data.exam : ex));
            toast.success(res.data.message);
        } catch { toast.error("Failed to toggle"); }
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
                    <h1 className="page-title">Exams</h1>
                    <p className="text-slate-500 text-sm mt-1">Create and manage course exams</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative max-w-xs hidden sm:block">
                        <Plus size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-45" />
                        <input
                            placeholder="Search exams..."
                            className="input-field pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button onClick={() => setShowModal(true)} disabled={!selectedCourse} className="btn-primary flex items-center gap-2">
                        <Plus size={18} />Create Exam
                    </button>
                </div>
            </div>

            {/* Mobile Search */}
            <div className="relative sm:hidden">
                <Plus size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-45" />
                <input
                    placeholder="Search exams..."
                    className="input-field pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Course Tabs */}
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
                    <p className="text-lg font-medium">No exams yet</p>
                    <p className="text-sm mt-1">Create your first exam for this course</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No exams match your search</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((exam) => (
                        <div key={exam._id} className="card p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <ClipboardList size={20} className="text-amber-600" />
                                </div>
                                <span className={`badge ${exam.isActive ? "badge-green" : "badge-gray"}`}>{exam.isActive ? "Active" : "Inactive"}</span>
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1 line-clamp-2">{exam.title}</h3>
                            {exam.description && <p className="text-slate-500 text-sm line-clamp-2 mb-3">{exam.description}</p>}
                            <div className="grid grid-cols-3 gap-2 text-center mb-4">
                                <div className="bg-slate-50 rounded-lg p-2">
                                    <div className="font-bold text-slate-700 text-sm">{exam.questions?.length || 0}</div>
                                    <div className="text-xs text-slate-400">Questions</div>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2">
                                    <div className="font-bold text-slate-700 text-sm flex items-center justify-center gap-0.5"><Clock size={11} />{exam.duration}</div>
                                    <div className="text-xs text-slate-400">Minutes</div>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2">
                                    <div className="font-bold text-slate-700 text-sm flex items-center justify-center gap-0.5"><Award size={11} />{exam.totalMarks}</div>
                                    <div className="text-xs text-slate-400">Marks</div>
                                </div>
                            </div>
                            <button onClick={() => handleToggle(exam._id)} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${exam.isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                                <Power size={15} />{exam.isActive ? "Deactivate Exam" : "Activate Exam"}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Exam Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-slide-up">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="font-bold text-slate-800 text-lg">Create Exam</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreate} className="p-5 space-y-5">
                            {/* Exam Details */}
                            <div className="card p-4 space-y-3 border border-slate-100">
                                <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Exam Details</h3>
                                <div>
                                    <label className="label">Title *</label>
                                    <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mid-term Examination" required />
                                </div>
                                <div>
                                    <label className="label">Description</label>
                                    <textarea className="input-field resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Duration (minutes) *</label>
                                        <input type="number" min="5" className="input-field" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
                                    </div>
                                    <div className="flex items-end gap-3 pb-1">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <div onClick={() => setForm((f) => ({ ...f, shuffleQuestions: !f.shuffleQuestions }))} className={`w-10 h-5.5 rounded-full transition-colors relative ${form.shuffleQuestions ? "bg-primary-600" : "bg-slate-200"}`} style={{ height: "22px" }}>
                                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.shuffleQuestions ? "translate-x-5" : "translate-x-0.5"}`} />
                                            </div>
                                            <span className="text-sm text-slate-600">Shuffle questions</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className="label">Instructions (optional)</label>
                                    <textarea className="input-field resize-none" rows={2} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Read all questions carefully..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Start Time (optional)</label>
                                        <input type="datetime-local" className="input-field" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label">End Time (optional)</label>
                                        <input type="datetime-local" className="input-field" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Questions */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Questions ({questions.length})</h3>
                                    <button type="button" onClick={addQuestion} className="text-primary-600 text-sm font-semibold flex items-center gap-1 hover:underline"><Plus size={14} />Add Question</button>
                                </div>
                                <div className="space-y-4">
                                    {questions.map((q, qi) => (
                                        <div key={qi} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-primary-600">Q{qi + 1}</span>
                                                {questions.length > 1 && (
                                                    <button type="button" onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={15} /></button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-[1fr_auto] gap-3">
                                                <input className="input-field" value={q.questionText} onChange={(e) => updateQuestion(qi, "questionText", e.target.value)} placeholder="Enter your question..." required />
                                                <div className="w-20">
                                                    <input type="number" min="1" max="10" className="input-field" value={q.marks} onChange={(e) => updateQuestion(qi, "marks", parseInt(e.target.value))} title="Marks" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs text-slate-400 font-medium">Options (select correct answer)</p>
                                                {q.options.map((opt, oi) => (
                                                    <div key={oi} className={`flex items-center gap-2 p-2.5 rounded-lg border-2 transition-colors ${opt.isCorrect ? "border-green-400 bg-green-50" : "border-slate-200 bg-white"}`}>
                                                        <button type="button" onClick={() => updateOption(qi, oi, "isCorrect", true)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${opt.isCorrect ? "border-green-500 bg-green-500" : "border-slate-300 hover:border-green-400"}`}>
                                                            {opt.isCorrect && <div className="w-2 h-2 bg-white rounded-full" />}
                                                        </button>
                                                        <input className="flex-1 bg-transparent text-sm text-slate-700 outline-none" value={opt.text} onChange={(e) => updateOption(qi, oi, "text", e.target.value)} placeholder={`Option ${oi + 1}`} required />
                                                        {opt.isCorrect && <span className="text-xs text-green-600 font-semibold">✓ Correct</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? "Creating..." : `Create Exam (${questions.length} questions)`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
