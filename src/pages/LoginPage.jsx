import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, BookOpen, Users, Award, ArrowLeft } from "lucide-react";

export default function LoginPage() {
    const [form, setForm] = useState({ email: "", password: "", role: "student" });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginUser({ email: form.email, password: form.password });
            const { token, user } = res.data;
            if (user.role !== form.role) {
                toast.error(`This account is a ${user.role} account. Please select the correct role.`);
                setLoading(false);
                return;
            }
            login(token, user);
            toast.success(`Welcome back, ${user.name}! 👋`);
            if (user.role === "admin") navigate("/admin");
            else if (user.role === "faculty") navigate("/faculty");
            else navigate("/student");
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { icon: <Users size={20} />, value: "1,200+", label: "Students Enrolled" },
        { icon: <BookOpen size={20} />, value: "50+", label: "Active Courses" },
        { icon: <Award size={20} />, value: "95%", label: "Pass Rate" },
    ];

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 transition-opacity duration-1000"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Gradient overlay for better depth and visibility */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary-900/50 via-transparent to-primary-900/80" />
            </div>

            <div className="w-full max-w-6xl bg-white shadow-2xl rounded-[3rem] overflow-hidden flex relative z-10 animate-fade-in border border-white/20">
                {/* Back to Home Button */}
                <button
                    onClick={() => navigate("/")}
                    className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md hover:bg-white text-slate-700 hover:text-primary-600 rounded-xl text-xs font-black transition-all border border-slate-200 hover:border-primary-400 group z-30 shadow-xl"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    BACK TO HOME
                </button>

                {/* Left Panel (Visual) */}
                <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white bg-primary-900/70 backdrop-blur-xl border-r border-white/10 relative">
                    <div className="flex items-center gap-3">
                        <img src="https://www.collegemobi.com/images/logo.png" alt="CollegeMobi Logo" className="h-14 w-auto object-contain" />
                    </div>

                    <div className="space-y-10">
                        <div className="animate-slide-up">
                            <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-4 text-white drop-shadow-md">
                                Unlock Your <br />
                                <span className="text-blue-400">Learning Potential</span>
                            </h2>
                            <p className="text-slate-100 text-lg leading-relaxed font-medium">
                                Access quality education, expert faculty, and interactive learning tools — all in one professional place.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                            {stats.map((s) => (
                                <div key={s.label} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-xl">
                                    <div className="text-blue-400 mb-2">{s.icon}</div>
                                    <div className="text-2xl font-black text-white">{s.value}</div>
                                    <div className="text-slate-300 text-xs font-bold uppercase tracking-wider mt-1">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-slate-400 text-sm font-medium">
                        © 2026 CollegeMobi Edu. All rights reserved.
                    </p>
                </div>

                {/* Right Panel */}
                <div className="flex-1 flex items-center justify-center p-6 bg-white lg:rounded-l-3xl relative">
                    <div className="w-full max-w-md animate-slide-up">
                        <div className="lg:hidden flex items-center gap-2 mb-8">
                            <img src="https://www.collegemobi.com/images/logo.png" alt="CollegeMobi Logo" className="h-10 w-auto object-contain" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back</h2>
                        <p className="text-slate-500 mb-8">Sign in to continue your learning journey</p>

                        {/* Role Selector */}
                        <div className="grid grid-cols-3 gap-2 mb-6 bg-slate-100 rounded-xl p-1">
                            {["student", "faculty", "admin"].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setForm({ ...form, role })}
                                    className={`py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${form.role === role
                                        ? "bg-white text-primary-700 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Email address</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="input-field"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="input-field pr-12"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full mt-6 py-3 text-base">
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        Signing in...
                                    </span>
                                ) : ("Sign In")}
                            </button>
                        </form>

                        <div className="mt-6 text-center space-y-2">
                            <p className="text-slate-500 text-sm">
                                New student?{" "}
                                <Link to="/register" className="text-primary-600 font-semibold hover:underline">
                                    Create account
                                </Link>
                            </p>
                            <p className="text-slate-500 text-sm">
                                Faculty?{" "}
                                <Link to="/register/faculty" className="text-primary-600 font-semibold hover:underline">
                                    Register as Faculty
                                </Link>
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <div className="bg-slate-50 rounded-2xl p-4 overflow-hidden">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Demo Credentials</p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-600">Admin:</span>
                                        <code className="bg-white px-2 py-1 rounded border border-slate-200 text-primary-600">admin@onorg.com</code>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-600">Faculty:</span>
                                        <code className="bg-white px-2 py-1 rounded border border-slate-200 text-primary-600">robert@faculty.com</code>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-600">Student:</span>
                                        <code className="bg-white px-2 py-1 rounded border border-slate-200 text-primary-600">alice@student.com</code>
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic text-center mt-2">Password for all: <span className="font-bold">Admin@123</span> or <span className="font-bold">Password@123</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
