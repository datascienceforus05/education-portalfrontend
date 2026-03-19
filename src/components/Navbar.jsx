import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const scrollToSection = (id) => {
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTo: id } });
            return;
        }
        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
        }
    };

    return (
        <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="fixed w-full z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 sm:h-22">
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-2 group cursor-pointer" 
                        onClick={() => {
                            if (location.pathname !== '/') navigate('/');
                            else window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        <img src="https://www.collegemobi.com/images/logo.png" alt="CollegeMobi Logo" className="h-14 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105" />
                    </motion.div>

                    <div className="hidden md:flex items-center gap-10">
                        {['Features', 'About', 'Faculty', 'Board Members'].map((item) => (
                            <button
                                key={item}
                                onClick={() => {
                                    if (item === 'Faculty') navigate('/faculty-list');
                                    else if (item === 'Board Members') navigate('/board-list');
                                    else scrollToSection(item.toLowerCase());
                                }}
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
    );
}
