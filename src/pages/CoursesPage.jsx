import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getPublicCourses } from "../api";
import { Users, Clock, Tag } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

export default function CoursesPage() {
    const [searchParams] = useSearchParams();
    const category = searchParams.get("category");
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const categories = ["All", "Engineering", "Medical", "Law", "Technology", "Fine Arts", "Social Science"];
    const [activeCategory, setActiveCategory] = useState(category || "All");

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const params = activeCategory !== "All" ? { category: activeCategory } : {};
                const res = await getPublicCourses(params);
                setCourses(res.data.courses || []);
            } catch (err) {
                console.error("Failed to load courses:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [activeCategory]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-100 selection:text-primary-700">
            {/* Header / Navbar */}
            <Navbar />

            {/* Banner Area */}
            <div className="bg-gradient-to-br from-primary-900 to-slate-900 py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Discover Your Path</h1>
                    <p className="text-primary-100 text-lg max-w-2xl mx-auto">Explore our wide range of professional programs and kick-starter courses.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                {/* Categories filtering bar */}
                <div className="flex flex-wrap gap-2 justify-center mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${activeCategory === cat ? "bg-primary-600 text-white shadow-primary-200/50 hover:bg-primary-700" : "bg-white text-slate-600 border border-slate-200 hover:border-primary-300 hover:text-primary-600"}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Course Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={course._id} 
                                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/40 hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full"
                            >
                                <div className="h-48 bg-slate-100 relative overflow-hidden group">
                                    <img 
                                        src={course.thumbnail || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop"} 
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-primary-700 shadow-sm capitalize border border-white/50">
                                        {course.category}
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight">{course.title}</h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10 leading-relaxed font-medium">
                                        {course.description}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5"><Clock size={16} className="text-blue-500"/> {course.duration || "Self-Paced"}</div>
                                        <div className="flex items-center gap-1.5"><Users size={16} className="text-emerald-500"/> {course.enrolledStudents?.length || 0} enrolled</div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs uppercase" title={course.faculty?.name}>
                                                {course.faculty?.name?.[0] || "F"}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-600 truncate max-w-[100px]">{course.faculty?.name || "System"}</span>
                                        </div>
                                        <Link 
                                            to={`/course/${course._id}`}
                                            className="px-4 py-2 bg-slate-900 hover:bg-primary-600 text-white text-sm font-black rounded-xl transition-colors shadow-md"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white p-12 rounded-3xl border border-slate-100 shadow-sm max-w-2xl mx-auto">
                        <Tag className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-slate-700 mb-2">No courses found</h3>
                        <p className="text-slate-500">We could not find any courses in the &quot;{activeCategory}&quot; category right now. Please check back later.</p>
                        <button onClick={() => setActiveCategory("All")} className="mt-6 px-6 py-2 bg-primary-50 text-primary-700 font-bold rounded-xl hover:bg-primary-100 transition-colors">View All Courses</button>
                    </div>
                )}
            </div>
        </div>
    );
}
