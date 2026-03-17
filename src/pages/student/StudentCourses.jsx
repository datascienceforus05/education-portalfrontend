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
        } catch (err) {
            toast.error("Could not start conversation");
        }
    };


    const filtered = allCourses.filter((c) => {
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.category?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || (filter === "enrolled" && myCourseIds.has(c._id)) || (filter === "available" && !myCourseIds.has(c._id));
        return matchSearch && matchFilter;
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
                    <h1 className="page-title">Courses</h1>
                    <p className="text-slate-500 text-sm mt-1">{allCourses.length} courses available</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        placeholder="Search courses..."
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
                            className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${filter === f ? "bg-primary-600 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-primary-50"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="card p-12 text-center text-slate-400">
                    <BookOpen size={50} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No courses found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map((course) => {
                        const isEnrolled = myCourseIds.has(course._id);
                        const levelColors = { beginner: "badge-green", intermediate: "badge-yellow", advanced: "badge-red" };
                        return (
                            <div key={course._id} className="card card-hover overflow-hidden group">
                                <div className="h-36 bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center relative overflow-hidden">
                                    <div className="text-white/10 text-8xl font-black absolute -right-4 -bottom-4 select-none">{course.title[0]}</div>
                                    <div className="text-5xl font-black text-white/80 z-10">{course.title[0]}</div>
                                    {isEnrolled && (
                                        <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1">
                                            <CheckCircle size={16} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-bold text-slate-800 leading-tight line-clamp-2 flex-1">{course.title}</h3>
                                        <span className={`badge ${levelColors[course.level] || "badge-blue"} flex-shrink-0`}>{course.level}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">{course.description}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                                        <span className="flex items-center gap-1"><Users size={12} /> {course.enrolledStudents?.length || 0} students</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {course.duration || "Self-paced"}</span>
                                        <span className="badge-blue badge">{course.category}</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                                                {course.faculty?.name?.[0]}
                                            </div>
                                            <span className="text-sm text-slate-600">{course.faculty?.name}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleMessageTeacher(course.faculty?._id)}
                                            className="p-1.5 hover:bg-primary-50 text-slate-400 hover:text-primary-600 rounded-lg transition-colors"
                                            title="Message Teacher"
                                        >
                                            <Mail size={16} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => !isEnrolled && handleEnroll(course._id)}
                                        disabled={isEnrolled || enrolling === course._id}
                                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${isEnrolled
                                                ? "bg-green-50 text-green-600 border border-green-200 cursor-default"
                                                : "btn-primary"
                                            }`}
                                    >
                                        {enrolling === course._id ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                Enrolling...
                                            </span>
                                        ) : isEnrolled ? "✓ Enrolled" : "Enroll Now"}
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

