import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Users, Award, ArrowRight, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { getPublicCourses } from "../api";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HomePage() {
    const heroRef = useRef(null);
    const titleRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedCat, setSelectedCat] = useState("All");
    const [publicCourses, setPublicCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);
    const categories = ["All", "Engineering", "Medical", "Law", "Technology", "Fine Arts", "Social Science"];

    const fallbackCourses = [
        { _id: "f1", title: "Advanced Aerospace Engineering", category: "Engineering" },
        { _id: "f2", title: "MBBS Specialisations", category: "Medical" },
        { _id: "f3", title: "Corporate Law", category: "Law" },
        { _id: "f4", title: "Full Stack Development", category: "Technology" }
    ];

    useEffect(() => {
        const fetchPublicCourses = async () => {
            try {
                const res = await getPublicCourses();
                setPublicCourses(res.data.courses?.slice(0, 8) || []); // Corrected mapping to .courses
            } catch (err) {
                console.error("Error fetching courses:", err);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchPublicCourses();
    }, []);

    useEffect(() => {
        if (!dropdownRef.current) return;
        if (dropdownOpen) {
            gsap.fromTo(dropdownRef.current, 
                { opacity: 0, y: -10, display: "none" }, 
                { opacity: 1, y: 0, duration: 0.3, display: "block", ease: "power2.out" }
            );
        } else {
            gsap.to(dropdownRef.current, { 
                opacity: 0, 
                y: -10, 
                duration: 0.2, 
                ease: "power2.in",
                onComplete: () => {
                    if (dropdownRef.current) dropdownRef.current.style.display = "none";
                }
            });
        }
    }, [dropdownOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                triggerRef.current && !triggerRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Scroll logic removed for new banner design

    useEffect(() => {
        // Hero Section Animation
        if (titleRef.current) {
            gsap.fromTo(titleRef.current, 
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", delay: 0.5 }
            );
        }

        // Section Entrances
        const sections = document.querySelectorAll('section:not(.hero-trigger)');
        sections.forEach(section => {
            gsap.fromTo(section, 
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                }
            );
        });

        // Ensure Hero is visible immediately
        gsap.to('.hero-trigger', { opacity: 1, duration: 0.5 });
        
        // Refresh ScrollTrigger after a short delay
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 1000);
        
        return () => {
            clearTimeout(timer);
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div ref={containerRef} className="relative min-h-screen bg-white font-sans selection:bg-primary-100 selection:text-primary-700 overflow-x-hidden">
            {/* Custom Fonts Applied via Class */}
            <style dangerouslySetInnerHTML={{ __html: `
                .font-heading { font-family: 'Outfit', sans-serif; }
                .font-space { font-family: 'Space Grotesk', sans-serif; }
                .text-gradient {
                    background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #db2777 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}} />

            {/* Navigation */}
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="fixed w-full z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-3 group cursor-pointer" 
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            <img src="https://www.collegemobi.com/images/logo.png" alt="CollegeMobi Logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
                        </motion.div>

                        <div className="hidden md:flex items-center gap-10">
                            {['Features', 'Stats', 'About', 'Faculty'].map((item) => (
                                <button
                                    key={item}
                                    onClick={() => item === 'Faculty' ? navigate('/faculty-list') : scrollToSection(item.toLowerCase())}
                                    className="text-sm font-bold text-slate-600 hover:text-primary-600 transition-colors uppercase tracking-widest font-space"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <Link to="/login" className="hidden sm:block px-6 py-2.5 text-sm font-bold text-slate-700 hover:text-primary-600 transition-colors font-space">
                                Sign In
                            </Link>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/register" className="px-7 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-black shadow-2xl shadow-slate-200 transition-all font-space">
                                    Join Now
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Banner Section */}
            <section ref={heroRef} className="hero-trigger relative min-h-[500px] sm:min-h-[600px] flex items-center justify-center bg-slate-900 pt-20">
                {/* Background Image Layer with Blur */}
                <div className="absolute inset-0 z-0">
                    <img 
                        src="/image.png" 
                        alt="Hero Banner" 
                        className="w-full h-full object-cover opacity-80" 
                    />
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent z-10" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 pt-44 pb-32">
                    <div className="flex flex-col items-center text-center">
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8"
                        >
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-ping" />
                            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] font-space">Your Future Starts Here</span>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-3xl sm:text-5xl lg:text-[4.5rem] font-black text-white leading-[1.1] tracking-tight mb-8 font-heading drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                        >
                            Explore Professional <br />
                            <span className="text-primary-400">Programs & Courses</span>
                        </motion.h1>

                        <motion.form 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            onSubmit={(e) => {
                                e.preventDefault();
                                navigate(`/courses?category=${selectedCat}`);
                            }}
                            className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-2xl bg-white/10 backdrop-blur-md p-3 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 relative z-50"
                        >
                            <div 
                                ref={triggerRef}
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex-1 w-full bg-transparent px-8 py-5 text-white/90 font-bold outline-none border-none cursor-pointer flex justify-between items-center group font-sans"
                            >
                                <span className="text-white text-[16px]">{selectedCat === "All" ? "All Categories" : selectedCat}</span>
                                <svg className={`w-5 h-5 text-white/50 transition-transform duration-300 ${dropdownOpen ? 'rotate-180 text-primary-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                            
                            <div 
                                ref={dropdownRef} 
                                data-lenis-prevent="true"
                                onWheel={(e) => e.stopPropagation()}
                                className="absolute top-[110%] left-0 right-0 sm:left-4 sm:right-auto sm:w-[300px] max-h-[300px] overflow-y-auto overscroll-contain bg-white rounded-3xl shadow-2xl border border-slate-100 z-[70] py-3 hidden custom-scrollbar"
                            >
                                {categories.map(cat => (
                                    <div 
                                        key={cat}
                                        onClick={() => {
                                            setSelectedCat(cat);
                                            setDropdownOpen(false);
                                        }}
                                        className={`px-6 py-4 cursor-pointer text-[15px] transition-all duration-200 ${selectedCat === cat ? 'bg-primary-600 text-white font-bold tracking-wide' : 'text-slate-600 font-semibold hover:bg-slate-50 hover:text-primary-600 hover:pl-8'}`}
                                    >
                                        {cat === "All" ? "Select Category" : cat}
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="w-full sm:w-auto px-12 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[2rem] font-black text-base shadow-xl shadow-primary-700/20 transition-all font-sans tracking-wide shrink-0 z-10 relative flex items-center justify-center gap-3 group">
                                Search Now
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.form>

                        {/* Stats counters removed */}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-40 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-24 max-w-4xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="text-primary-600 font-black uppercase tracking-[0.4em] text-xs mb-6 font-space"
                        >
                            The Future of Education
                        </motion.div>
                        <h2 className="text-5xl lg:text-5xl font-black text-slate-900 mb-8 font-heading">Powerful Tools for Growth</h2>
                        <p className="text-xl text-slate-500 font-medium leading-relaxed">Experience a seamless integration of learning and management in one ultra-responsive dashboard.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 mb-32">
                        {[
                            {
                                title: "Smart Course Library",
                                desc: "High-definition course materials with categorized modules and interactive study guides.",
                                img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop",
                                icon: BookOpen,
                                color: "from-blue-600 to-cyan-500",
                                tags: ["PDFs", "Videos", "Docs"]
                            },
                            {
                                title: "Automated Exams",
                                desc: "Timed testing environment with automatic grading and comprehensive performance analytics.",
                                img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop",
                                icon: Award,
                                color: "from-purple-600 to-pink-500",
                                tags: ["Real-time", "Secure", "Instant"]
                            },
                            {
                                title: "Live Collaboration",
                                desc: "Real-time communication tools connecting students directly with subject matter experts.",
                                img: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=2071&auto=format&fit=crop",
                                icon: Users,
                                color: "from-emerald-500 to-teal-400",
                                tags: ["Chat", "Video", "Screen"]
                            },
                        ].map((feature, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -15 }}
                                className="group relative bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 h-full flex flex-col"
                            >
                                <div className="h-72 overflow-hidden relative">
                                    <motion.img 
                                        whileHover={{ scale: 1.15 }}
                                        transition={{ duration: 1 }}
                                        src={feature.img} 
                                        alt={feature.title} 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                                    <div className="absolute top-8 right-8">
                                        <div className={`bg-gradient-to-tr ${feature.color} rounded-2xl p-4 shadow-2xl`}>
                                            <feature.icon className="text-white" size={28} />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-8 left-8 flex gap-3">
                                        {feature.tags.map(tag => (
                                            <span key={tag} className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-10 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-primary-600 transition-colors font-heading">{feature.title}</h3>
                                    <p className="text-slate-500 leading-relaxed font-medium mb-8 flex-1 text-base">{feature.desc}</p>
                                    <button className="flex items-center gap-3 text-xs font-black text-primary-600 group-hover:gap-5 transition-all uppercase tracking-[0.2em] font-space text-left">
                                        Explore System <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Course Tiles Grid */}
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-4xl font-black text-slate-900 mb-4 font-heading">Popular Programs</h2>
                        <p className="text-lg text-slate-500 font-medium">Find your path by exploring our most in-demand course offerings.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
                        {!loadingCourses ? (publicCourses.length > 0 ? publicCourses : fallbackCourses).map((course, i) => (
                            <motion.div 
                                key={course._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ y: -10 }}
                                className="bg-slate-50 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 text-center flex flex-col group cursor-pointer"
                                onClick={() => navigate(`/course/${course._id}`)}
                            >
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-all text-primary-600 transition-colors">
                                    <BookOpen size={20} className="sm:w-6 sm:h-6" />
                                </div>
                                <h4 className="font-black text-slate-900 text-sm sm:text-lg mb-2 sm:mb-3 line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem] font-heading">{course.title}</h4>
                                <p className="text-[10px] sm:text-xs font-black text-primary-600 uppercase tracking-widest font-space mb-4 sm:mb-6">{course.category}</p>
                                <div className="mt-auto">
                                    <span className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary-600 transition-colors">
                                        View <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
                                    </span>
                                </div>
                            </motion.div>
                        )) : (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="bg-slate-50 h-[300px] rounded-[2.5rem] animate-pulse" />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section id="stats" className="py-32 bg-slate-900 overflow-hidden relative">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-slate-900 to-slate-900" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8">
                        {[
                            { value: "12,480", label: "Active Students", icon: Users },
                            { value: "580+", label: "Expert Faculty", icon: BookOpen },
                            { value: "95.4%", label: "Average Growth", icon: Award },
                            { value: "24/7", label: "Global Support", icon: Globe },
                        ].map((stat, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="text-center group"
                            >
                                <div className="flex justify-center mb-6">
                                    <motion.div 
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.8, ease: "backOut" }}
                                        className="p-5 bg-white/5 border border-white/10 rounded-3xl text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all shadow-2xl"
                                    >
                                        <stat.icon size={32} />
                                    </motion.div>
                                </div>
                                <div className="text-5xl lg:text-6xl font-black text-white mb-3 tracking-tighter font-heading uppercase">{stat.value}</div>
                                <div className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs font-space">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-40 bg-slate-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-32">
                        <div className="flex-1 space-y-12">
                            <motion.div 
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="text-primary-600 font-black uppercase tracking-[0.4em] text-xs font-space"
                            >
                                About CollegeMobi
                            </motion.div>
                            <h2 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1] font-heading">Quality Beyond <br /> Measures</h2>
                            
                            <div className="space-y-8 text-xl text-slate-600 leading-relaxed font-medium">
                                <p>
                                    CollegeMobi Online Education provides quality education to enhance the standard of living of the student and achieve their goals. CollegeMobi contribute their service to all the students providing better education with experienced faculty.
                                </p>
                                <p className="bg-white p-8 rounded-[2rem] border-l-8 border-primary-600 shadow-sm italic text-slate-900">
                                    &ldquo;The guiding mission of CollegeMobi is deliver the absolute best experience and results for the students. We are not the company ourselves, but we fill a role that can be even more valuable in your life as the all-in-one resource to educate, connect, and facilitate your education.&rdquo;
                                </p>
                                <p>
                                    We believe that clear and efficient planning is critical to the well-being of an student and school. Our unique ability to take this philosophy and turn it into a superior set of services for our students is a result of our deep understanding of our student needs and concerns.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Link to="/register" className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl">Start Your Journey</Link>
                                <button className="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-primary-600 transition-all">Learn More</button>
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            <div className="relative z-10 grid grid-cols-2 gap-8">
                                <div className="space-y-8 pt-16">
                                    <motion.div 
                                        whileHover={{ scale: 0.95, rotate: -2 }}
                                        className="bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-center border border-slate-100"
                                    >
                                        <p className="text-slate-500 font-bold mb-4">We believe that clear and efficient planning is critical to the well-being of an student and school.</p>
                                        <div className="w-12 h-1 bg-primary-600" />
                                    </motion.div>
                                    <motion.div 
                                        whileHover={{ scale: 0.95, rotate: 2 }}
                                        className="rounded-[3rem] overflow-hidden shadow-2xl h-[300px]"
                                    >
                                        <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop" alt="Edu" className="w-full h-full object-cover" />
                                    </motion.div>
                                </div>
                                <div className="space-y-8">
                                    <motion.div 
                                        whileHover={{ scale: 0.95, rotate: 2 }}
                                        className="rounded-[3rem] overflow-hidden shadow-2xl h-[300px]"
                                    >
                                        <img src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2074&auto=format&fit=crop" alt="Edu" className="w-full h-full object-cover" />
                                    </motion.div>
                                    <motion.div 
                                        whileHover={{ scale: 0.95, rotate: -2 }}
                                        className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-center text-white"
                                    >
                                        <p className="font-bold mb-4 opacity-80">CollegeMobi is following the best and updated curriculum of all the subjects.</p>
                                        <div className="w-12 h-1 bg-primary-400" />
                                    </motion.div>
                                </div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary-600 rounded-full -z-10 blur-[150px] opacity-10" />
                        </div>
                    </div>

                    <div className="mt-40 bg-white rounded-[4rem] p-12 lg:p-24 shadow-2xl border border-slate-50">
                        <div className="max-w-4xl mx-auto space-y-10">
                            <h3 className="text-4xl font-black text-slate-900 font-heading">Our Philosophy</h3>
                            <div className="grid md:grid-cols-2 gap-16 text-lg text-slate-500 font-medium leading-relaxed">
                                <p>
                                    We believe that clear and efficient planning is critical to the well-being of an student and school. Our unique ability to take this philosophy and turn it into a superior set of services for our students is a result of our deep understanding of our student needs and concerns, our unique organizational structure, technological capabilities, and our passion for the task at hand.
                                </p>
                                <p>
                                    We believed that the student and conflicts of interest were not acceptable. We knew you wanted better. We wanted better for all of us. We put a lot of minds, technology, and late nights together to deliver this solution. It’s for you. It’s your site; clear, efficient, and organized.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-40 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        whileHover={{ scale: 0.99 }}
                        className="bg-slate-900 rounded-[4.5rem] p-16 lg:p-32 text-center relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
                    >
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/30 rounded-full blur-[150px] group-hover:scale-125 transition-transform duration-1000" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[150px] group-hover:scale-125 transition-transform duration-1000" />

                        <div className="relative z-10 w-full max-w-5xl mx-auto">
                            <h2 className="text-6xl lg:text-[7.5rem] font-black text-white mb-10 tracking-[ -0.05em] leading-[0.9] font-heading">
                                Start Your <br /> Evolution Today
                            </h2>
                            <p className="text-2xl text-slate-400 mb-16 max-w-3xl mx-auto font-medium leading-relaxed font-space">
                                Join the world&apos;s most innovative educational ecosystem. No limits, just potential.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-full sm:w-auto">
                                    <Link to="/register" className="w-full sm:w-auto px-16 py-6 bg-white hover:bg-slate-50 text-slate-900 rounded-[2.5rem] font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-3 font-space">
                                        Join for Free <ArrowRight size={24} />
                                    </Link>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-full sm:w-auto">
                                    <Link to="/login" className="w-full sm:w-auto px-16 py-6 bg-transparent border-2 border-slate-700 hover:border-slate-500 text-white rounded-[2.5rem] font-black text-xl transition-all flex items-center justify-center gap-2 font-space">
                                        Partner Portal
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-32 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-20 mb-20">
                        <div className="col-span-2 space-y-10">
                            <div className="flex items-center gap-4">
                                <img src="https://www.collegemobi.com/images/logo.png" alt="CollegeMobi Logo" className="h-16 w-auto object-contain" />
                            </div>
                            <p className="text-slate-500 max-w-md font-medium text-xl leading-relaxed">
                                Redefining digital pedagogy through intelligent design and seamless user experience.
                            </p>
                            <div className="flex gap-6">
                                {['tw', 'fb', 'ig', 'li'].map(social => (
                                    <motion.div 
                                        key={social} 
                                        whileHover={{ y: -5, scale: 1.1 }}
                                        className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-200 cursor-pointer transition-all shadow-lg"
                                    >
                                        <Globe size={24} />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 uppercase tracking-[0.3em] text-xs mb-10 font-space">Explore</h4>
                            <ul className="space-y-6">
                                {['Features', 'Stats', 'About', 'Pricing'].map(l => (
                                    <li key={l}>
                                        <button onClick={() => scrollToSection(l.toLowerCase())} className="text-slate-500 font-bold hover:text-primary-600 transition-colors uppercase tracking-[0.2em] text-[10px] font-space text-left">{l}</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 uppercase tracking-[0.3em] text-xs mb-10 font-space">Contact</h4>
                            <ul className="space-y-6 font-space">
                                <li className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">support@eduportal.com</li>
                                <li className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">+1 (555) 0123 4567</li>
                                <li className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">Tech District, Global</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] font-space">
                            © 2026 COLLEGEMOBI EDU. Engineered for Excellence.
                        </p>
                        <div className="flex gap-10">
                            <span className="text-[10px] font-black text-slate-400 hover:text-primary-600 uppercase tracking-[0.3em] font-space cursor-pointer transition-colors">Privacy</span>
                            <span className="text-[10px] font-black text-slate-400 hover:text-primary-600 uppercase tracking-[0.3em] font-space cursor-pointer transition-colors">Terms</span>
                            <span className="text-[10px] font-black text-slate-400 hover:text-primary-600 uppercase tracking-[0.3em] font-space cursor-pointer transition-colors">Legal</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
