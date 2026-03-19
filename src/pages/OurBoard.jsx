import { useEffect, useState } from "react";
import { getBoardMembers } from "../api";
import { Briefcase, Mail, Linkedin, Twitter, Globe } from "lucide-react";
import Navbar from "../components/Navbar";

export default function OurBoard() {
    const [board, setBoard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        getBoardMembers()
            .then(res => setBoard(res.data.board || []))
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <h2 className="text-5xl lg:text-7xl font-black text-slate-900 font-heading leading-tight animate-slide-up">The Board of Directors</h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed animate-delay-1">Our leadership team brings together decades of expertise in global education, technology, and organizational growth to shape the future of COLLEGEMOBI EDU.</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {board.length > 0 ? board.map((member, i) => (
                        <div 
                            key={member._id} 
                            className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 group flex flex-col md:flex-row gap-8 items-center md:items-start animate-slide-up"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className="w-48 h-48 rounded-[2.5rem] overflow-hidden border-8 border-slate-50 flex-shrink-0 relative group-hover:scale-105 transition-transform duration-500">
                                {member.avatar ? (
                                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white font-black text-5xl">
                                        {member.name[0]}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6 text-center md:text-left flex-1">
                                <div className="space-y-2">
                                    <span className="px-4 py-1.5 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-full">{member.designation || 'Director'}</span>
                                    <h3 className="text-3xl font-black text-slate-900 font-heading leading-tight">{member.name}</h3>
                                </div>

                                <p className="text-slate-500 text-sm leading-relaxed font-medium line-clamp-4">
                                    {member.bio || "Dedicated leader with a passion for educational excellence and innovative technological integration in modern learning environments."}
                                </p>

                                <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                                    {[Linkedin, Twitter, Globe, Mail].map((Icon, idx) => (
                                        <button key={idx} className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all transform hover:-translate-y-1">
                                            <Icon size={18} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <Briefcase size={40} />
                             </div>
                             <p className="text-slate-400 font-bold">Board information will be listed soon.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Vision Section */}
            <section className="bg-slate-900 py-32 mt-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary-600/10 via-transparent to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-primary-400 text-xs font-black uppercase tracking-[0.2em]">Our Vision 2030</div>
                        <h3 className="text-5xl font-black text-white font-heading leading-tight italic">&quot;Empowering the next generation through ethical leadership and accessible innovation.&quot;</h3>
                        <p className="text-slate-400 text-xl leading-relaxed">The board is committed to steering COLLEGEMOBI EDU towards a future where quality education knows no boundaries, leveraging cutting-edge technology to create global impact.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { label: "Founded", val: "2020" },
                            { label: "Global Presence", val: "12+ Countries" },
                            { label: "Active Students", val: "50k+" },
                            { label: "Recognition", val: "A+ Global" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm">
                                <div className="text-3xl font-black text-white mb-2">{stat.val}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
