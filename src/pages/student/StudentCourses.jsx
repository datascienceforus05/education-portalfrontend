import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCourses, getMyCourses, enrollCourse, startConversation } from "../../api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { BookOpen, Users, Clock, Search, CheckCircle, Mail } from "lucide-react";

export default function StudentCourses() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [allCourses, setAllCourses] = useState([]);
    const [myCourseIds, setMyCourseIds] = useState(new Set());
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [viewingCourse, setViewingCourse] = useState(null);

    const CATEGORIES = ["All Categories", "IT", "Engineering", "Medical", "Skill Development", "Management", "General Science", "Languages", "Other"];

    useEffect(() => {
        Promise.all([getCourses(), getMyCourses()])
            .then(([all, my]) => {
                setAllCourses(all.data.courses || []);
                setMyCourseIds(new Set((my.data.courses || []).map((c) => c._id)));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleEnroll = async (courseId) => {
        setEnrolling(courseId);
        try {
            await enrollCourse(courseId);
            setMyCourseIds((prev) => new Set([...prev, courseId]));
            toast.success("Enrolled successfully! 🎉");
            setViewingCourse(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Enrollment failed");
        } finally {
            setEnrolling(null);
        }
    };

    const handleMessageTeacher = async (facultyId) => {
        if (!facultyId) return;
        try {
            await startConversation(facultyId);
            navigate(`/${user.role}/messages`);
        } catch {
            toast.error("Could not start conversation");
        }
    };


    const filtered = allCourses.filter((c) => {
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.category?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || (filter === "enrolled" && myCourseIds.has(c._id)) || (filter === "available" && !myCourseIds.has(c._id));
        const matchCategory = selectedCategory === "All Categories" || c.category === selectedCategory;
        return matchSearch && matchFilter && matchCategory;
    });

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h1 className="page-title">Explore Courses</h1>
                    <p className="text-slate-500 text-sm mt-1">{filtered.length} courses match your criteria</p>
                </div>
            </div>

            {/* Main Filters */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2 relative">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        placeholder="Search by title or topic..."
                        className="input-field pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {["all", "enrolled", "available"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 px-3 py-2.5 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${filter === f ? "bg-primary-600 text-white shadow-lg shadow-primary-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-primary-50"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <select 
                    className="input-field text-sm font-semibold"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Category Quick Chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? "bg-slate-900 text-white" : "bg-white text-slate-500 border border-slate-200 hover:border-primary-400"}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="card p-20 text-center text-slate-400">
                    <BookOpen size={60} className="mx-auto mb-4 opacity-20" />
                    <p className="text-xl font-black text-slate-800">No courses found</p>
                    <p className="text-sm mt-2">Adjust your filters to see more results</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((course) => {
                        const isEnrolled = myCourseIds.has(course._id);
                        const levelColors = { beginner: "badge-green", intermediate: "badge-yellow", advanced: "badge-red" };
                        return (
                            <div key={course._id} className="card card-hover overflow-hidden group flex flex-col">
                                <div className="h-40 bg-slate-900 relative overflow-hidden">
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt={course.title} />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center">
                                            <span className="text-white/20 text-9xl font-black select-none">{course.title[0]}</span>
                                            <span className="text-6xl font-black text-white/90 z-10">{course.title[0]}</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className={`badge ${levelColors[course.level] || "badge-blue"} !text-[10px] font-black uppercase tracking-tighter`}>{course.level}</span>
                                    </div>
                                    {isEnrolled && (
                                        <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                                            <CheckCircle size={16} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{course.category}</span>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.duration || "8 Weeks"}</span>
                                        </div>
                                        <h3 className="font-black text-slate-900 text-xl leading-tight mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{course.title}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 mb-6 font-medium leading-relaxed">{course.description}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between py-4 border-t border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-black text-xs border border-slate-200">
                                                {course.faculty?.name?.[0]}
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{course.faculty?.name}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleMessageTeacher(course.faculty?._id)}
                                            className="p-2 hover:bg-primary-50 text-slate-400 hover:text-primary-600 rounded-xl transition-all"
                                            title="Message Teacher"
                                        >
                                            <Mail size={18} />
                                        </button>
                                    </div>

                                    <div className="flex gap-3 mt-2">
                                        <button
                                            onClick={() => setViewingCourse(course)}
                                            className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                        >
                                            View Details
                                        </button>
                                        {!isEnrolled && (
                                            <button
                                                onClick={() => handleEnroll(course._id)}
                                                disabled={enrolling === course._id}
                                                className="flex-1 py-3 btn-primary text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-100"
                                            >
                                                {enrolling === course._id ? "..." : "Enroll Now"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Course Detail Modal */}
            {viewingCourse && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden animate-slide-up shadow-2xl">
                        <div className="h-64 bg-slate-900 relative">
                            {viewingCourse.thumbnail ? (
                                <img src={viewingCourse.thumbnail} className="w-full h-full object-cover opacity-70" alt={viewingCourse.title} />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-primary-600 to-indigo-800 flex items-center justify-center">
                                    <span className="text-white/10 text-[12rem] font-black select-none">{viewingCourse.title[0]}</span>
                                </div>
                            )}
                            <button onClick={() => setViewingCourse(null)} className="absolute top-6 right-6 p-3 bg-black/20 hover:bg-black/40 text-white rounded-2xl backdrop-blur-md transition-all">
                                <X size={20} />
                            </button>
                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="flex gap-3 mb-4">
                                    <span className="px-4 py-1.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">{viewingCourse.category}</span>
                                    <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white/20">{viewingCourse.level}</span>
                                </div>
                                <h2 className="text-4xl font-black text-white font-heading leading-tight tracking-tight">{viewingCourse.title}</h2>
                            </div>
                        </div>
                        
                        <div className="p-10">
                            <div className="grid grid-cols-3 gap-8 mb-10 pb-8 border-b border-slate-100 text-center">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-space">Duration</p>
                                    <p className="font-black text-slate-800 text-lg flex items-center justify-center gap-2"><Clock size={16} className="text-primary-600" /> {viewingCourse.duration || "Self-paced"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-space">Students</p>
                                    <p className="font-black text-slate-800 text-lg flex items-center justify-center gap-2"><Users size={16} className="text-primary-600" /> {viewingCourse.enrolledStudents?.length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-space">Category</p>
                                    <p className="font-black text-slate-800 text-lg">{viewingCourse.category}</p>
                                </div>
                            </div>

                            <div className="mb-10">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 font-space">Course Description</h4>
                                <p className="text-slate-600 leading-relaxed font-medium text-lg">{viewingCourse.description}</p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleMessageTeacher(viewingCourse.faculty?._id)}
                                    className="px-8 py-5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3"
                                >
                                    <Mail size={18} /> Contact Faculty
                                </button>
                                {myCourseIds.has(viewingCourse._id) ? (
                                    <button
                                        disabled
                                        className="flex-1 py-5 bg-green-50 text-green-600 rounded-3xl font-black text-xs uppercase tracking-widest border border-green-100 flex items-center justify-center gap-3"
                                    >
                                        <CheckCircle size={18} /> You are Enrolled
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleEnroll(viewingCourse._id)}
                                        disabled={enrolling === viewingCourse._id}
                                        className="flex-1 py-5 btn-primary rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary-200"
                                    >
                                        {enrolling === viewingCourse._id ? "Processing..." : "Enroll This Course"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import { X } from "lucide-react";

