import { useEffect, useState } from "react";
import { getAdminLeaderboard } from "../../api";
import { Users, Award, Trophy, TrendingUp, BookOpen, Search, ArrowUpRight, Crown } from "lucide-react";


export default function AdminLeaderboard() {
    const [facultyData, setFacultyData] = useState([]);
    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("faculty");
    const [search, setSearch] = useState("");

    useEffect(() => {
        getAdminLeaderboard()
            .then((res) => {
                setFacultyData(res.data.facultyLeaderboard);
                setStudentData(res.data.studentLeaderboard);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredFaculty = facultyData.filter(f => 
        f.name.toLowerCase().includes(search.toLowerCase()) || 
        f.department?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredStudents = studentData.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 animate-slide-up pb-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="page-title">Leaderboard & Analytics</h1>
                    <p className="text-slate-500 text-sm mt-1">Global performance rankings and statistics</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
                    <button 
                        onClick={() => setActiveTab("faculty")}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "faculty" ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Faculty Rankings
                    </button>
                    <button 
                        onClick={() => setActiveTab("students")}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "students" ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        Student Rankings
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    placeholder={`Search ${activeTab === 'faculty' ? 'faculty by name or department' : 'students by name or email'}...`}
                    className="input-field pl-12"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {activeTab === "faculty" ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Top 3 Faculty Cards */}
                        {filteredFaculty.slice(0, 3).map((f, i) => (
                            <div key={f._id} className={`card p-6 relative overflow-hidden group ${i === 0 ? 'ring-2 ring-amber-400' : ''}`}>
                                {i === 0 && (
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-400/10 rounded-full flex items-end justify-start p-6">
                                        <Crown size={24} className="text-amber-500" />
                                    </div>
                                )}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 font-black text-2xl overflow-hidden shadow-inner uppercase">
                                        {f.avatar ? <img src={`http://localhost:5000${f.avatar}`} className="w-full h-full object-cover" /> : f.name[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                                Rank #{i + 1}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 line-clamp-1">{f.name}</h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">{f.department || "No Department"}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-2 text-primary-600 mb-1">
                                            <Users size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Enrolled</span>
                                        </div>
                                        <p className="text-xl font-black text-slate-800">{f.totalEnrollments}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-2 text-violet-600 mb-1">
                                            <BookOpen size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Courses</span>
                                        </div>
                                        <p className="text-xl font-black text-slate-800">{f.courseCount}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table for the rest */}
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        {["Rank", "Faculty", "Department", "Courses", "Total Students", "Engagement"].map(h => (
                                            <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredFaculty.map((f, i) => (
                                        <tr key={f._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${i < 3 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    {i + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-bold overflow-hidden">
                                                        {f.avatar ? <img src={`http://localhost:5000${f.avatar}`} className="w-full h-full object-cover" /> : f.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{f.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{f.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{f.department || "N/A"}</span>
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-800 text-sm">{f.courseCount}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-slate-800 text-sm">{f.totalEnrollments}</span>
                                                    <TrendingUp size={14} className="text-green-500" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-full max-w-[100px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-primary-500 rounded-full" 
                                                        style={{ width: `${Math.min(100, (f.totalEnrollments / (facultyData[0]?.totalEnrollments || 1)) * 100)}%` }} 
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Top 3 Students Cards */}
                        {filteredStudents.slice(0, 3).map((s, i) => (
                            <div key={s._id} className={`card p-6 relative overflow-hidden group ${i === 0 ? 'ring-2 ring-violet-400' : ''}`}>
                                {i === 0 && (
                                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-violet-400/10 rounded-full flex items-end justify-start p-6">
                                        < Crown size={24} className="text-violet-500" />
                                    </div>
                                )}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 font-black text-2xl overflow-hidden shadow-inner uppercase">
                                        {s.avatar ? <img src={`http://localhost:5000${s.avatar}`} className="w-full h-full object-cover" /> : s.name[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${i === 0 ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-500'}`}>
                                                Elite Ranking
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 line-clamp-1">{s.name}</h3>
                                        <p className="text-xs text-slate-400 font-bold">{s.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center gap-2 text-violet-600 mb-1">
                                            <Award size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Avg. Score</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-800">{s.avgPercentage}%</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl flex flex-col justify-center">
                                        <div className="flex items-center gap-2 text-emerald-600 mb-1">
                                            <Trophy size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Efficiency</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-600">{s.examsPassed} / {s.totalExams} Passed</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        {["Rank", "Student", "Exams Taken", "Passed", "Average Performance", "Action"].map(h => (
                                            <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredStudents.map((s, i) => (
                                        <tr key={s._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 text-center">
                                                <span className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center font-black ${i < 3 ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    {i + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold overflow-hidden">
                                                        {s.avatar ? <img src={`http://localhost:5000${s.avatar}`} className="w-full h-full object-cover" /> : s.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{s.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-800 text-sm">{s.totalExams}</td>
                                            <td className="px-6 py-4">
                                                <span className="badge badge-green text-[10px]">{s.examsPassed} Correct</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${s.avgPercentage >= 75 ? 'bg-emerald-500' : s.avgPercentage >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                                                            style={{ width: `${s.avgPercentage}%` }} 
                                                        />
                                                    </div>
                                                    <span className="text-sm font-black text-slate-800">{s.avgPercentage}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-primary-600 transition-all">
                                                    <ArrowUpRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
