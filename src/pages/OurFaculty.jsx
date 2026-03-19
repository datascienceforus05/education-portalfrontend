import { useEffect, useState } from "react";
import { getFaculty } from "../api";
import { User, Briefcase, GraduationCap, Mail, Github, Linkedin, Twitter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function OurFaculty() {
    const navigate = useNavigate();
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        getFaculty()
            .then(res => setFaculties(res.data.faculties || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-100 selection:text-primary-700">
            {/* Navigation */}
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <h2 className="text-5xl lg:text-6xl font-black text-slate-900 font-heading leading-tight animate-slide-up">Meet Our Experts</h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed animate-delay-1">Our faculty members are world-class educators, researchers, and professionals dedicated to your academic and professional success.</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {faculties.length > 0 ? faculties.map((faculty, i) => (
                        <div 
                            key={faculty._id} 
                            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary-100/50 transition-all duration-300 group animate-slide-up"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className="relative mb-8">
                                <div className="w-32 h-32 mx-auto rounded-[2rem] overflow-hidden border-4 border-slate-50 relative z-10 group-hover:scale-105 transition-transform duration-500">
                                    {faculty.avatar ? (
                                        <img src={faculty.avatar} alt={faculty.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-600 font-black text-4xl">
                                            {faculty.name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary-50 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="text-center space-y-4 relative z-20">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 font-heading">{faculty.name}</h3>
                                    <p className="text-xs font-black uppercase tracking-widest text-primary-600 mt-1">{faculty.department || 'Board Faculty'}</p>
                                </div>

                                <div className="flex flex-col gap-3 py-6 border-y border-slate-50">
                                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium">
                                        <Briefcase size={16} className="text-slate-400" />
                                        <span>Expertise in {faculty.department || 'General'}</span>
                                    </div>
                                    {faculty.qualification && (
                                        <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium">
                                            <GraduationCap size={16} className="text-slate-400" />
                                            <span>{faculty.qualification}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-center gap-4 pt-4">
                                    {[Twitter, Linkedin, Github, Mail].map((Icon, idx) => (
                                        <button key={idx} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-all transform hover:-translate-y-1">
                                            <Icon size={18} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <User size={40} />
                             </div>
                             <p className="text-slate-400 font-bold">Academic Faculty will be listed soon.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary-600/20 via-transparent to-transparent" />
                    <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                        <h3 className="text-4xl lg:text-5xl font-black text-white font-heading leading-tight">Join Our Distinguished Academic Team</h3>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">Are you an expert in your field? Share your knowledge and shape the future of education by joining our global faculty network.</p>
                        <button onClick={() => navigate('/register/faculty')} className="px-10 py-5 bg-white text-slate-900 rounded-[1.5rem] font-black uppercase tracking-widest text-sm transition-all hover:scale-105 shadow-2xl">Register as Faculty</button>
                    </div>
                </div>
            </section>
        </div>
    );
}
