import { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { registerStudent, registerFaculty } from "../api";
import toast from "react-hot-toast";
import { Eye, EyeOff, User, BookOpen, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function RegisterPage({ type = "student" }) {
    const [form, setForm] = useState({
        name: "", email: "", password: "", phone: "",
        department: "", qualification: "", bio: "",
    });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isFaculty = type === "faculty";
    const courseId = searchParams.get("courseId");
    const courseName = searchParams.get("courseName");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isFaculty) {
                await registerFaculty(form);
                toast.success("Registration submitted! Awaiting admin approval.");
                navigate("/login");
            } else {
                const submitData = courseId ? { ...form, courseId } : form;
                await registerStudent(submitData);
                toast.success("Account created! Please login.");
                navigate("/login");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=2070&auto=format&fit=crop")',
                }}
            >
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary-900/50 via-transparent to-primary-900/80" />
            </div>

            <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-[2.5rem] p-10 shadow-2xl animate-slide-up relative z-10 border border-white/20">
                {/* Header row with Logo and Back Button */}
                <div className="flex justify-between items-center mb-6">
                    <img src="https://www.collegemobi.com/images/logo.png" alt="CollegeMobi Logo" className="h-10 sm:h-12 w-auto object-contain" />
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-primary-600 rounded-xl text-xs font-black transition-all border border-slate-100 hover:border-primary-100 group z-30 shadow-sm shrink-0"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">BACK</span>
                    </button>
                </div>

                <div className="mb-8">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                        {isFaculty ? "Faculty Registration" : "Student Registration"}
                    </h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                        Create your account
                    </p>
                </div>

                {/* Toggle */}
                <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-100 rounded-xl p-1">
                    <Link to="/register" className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${!isFaculty ? "bg-white text-primary-700 shadow-sm" : "text-slate-500"}`}>
                        <User size={16} />Student
                    </Link>
                    <Link to="/register/faculty" className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isFaculty ? "bg-white text-primary-700 shadow-sm" : "text-slate-500"}`}>
                        <BookOpen size={16} />Faculty
                    </Link>
                </div>

                {!isFaculty && courseName && (
                    <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-xl flex items-start gap-3">
                        <CheckCircle2 className="text-primary-600 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-bold text-slate-800">You are enrolling in:</p>
                            <p className="text-primary-700 font-medium">{courseName}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="label">Full Name *</label>
                            <input className="input-field" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="label">Phone</label>
                            <input className="input-field" placeholder="+91 9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="label">Email *</label>
                        <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div>
                        <label className="label">Password *</label>
                        <div className="relative">
                            <input type={showPass ? "text" : "password"} className="input-field pr-11" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {isFaculty && (
                        <>
                            <div>
                                <label className="label">Department *</label>
                                <input className="input-field" placeholder="e.g. Computer Science" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />
                            </div>
                            <div>
                                <label className="label">Qualification</label>
                                <input className="input-field" placeholder="e.g. M.Tech, PhD" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">Bio</label>
                                <textarea className="input-field resize-none" rows={3} placeholder="Brief introduction about yourself..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                            </div>
                        </>
                    )}

                    {isFaculty && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-700 text-sm">
                            ⚠️ Faculty accounts require admin approval before you can log in.
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Creating account...
                            </span>
                        ) : (`Register as ${isFaculty ? "Faculty" : "Student"}`)}
                    </button>

                    <p className="text-center text-slate-500 text-sm mt-4">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

RegisterPage.propTypes = {
    type: PropTypes.string,
};
