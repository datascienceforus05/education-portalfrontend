import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword } from "../api";
import toast from "react-hot-toast";
import { User, Mail, Phone, Camera, Save, Lock, Shield, MapPin, GraduationCap, FileText } from "lucide-react";

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        bio: user?.bio || "",
        department: user?.department || "",
        qualification: user?.qualification || "",
    });
    const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(user?.avatar ? `http://localhost:5000${user.avatar}` : null);
    const fileInputRef = useRef();

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            Object.keys(form).forEach(key => fd.append(key, form[key]));
            if (avatar) fd.append("avatar", avatar);

            const res = await updateProfile(fd);
            setUser(res.data.user);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            toast.success("Profile updated successfully! ✨");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwdForm.newPassword !== pwdForm.confirmPassword) return toast.error("Passwords do not match");
        setLoading(true);
        try {
            await changePassword(pwdForm);
            toast.success("Password changed successfully! 🔐");
            setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-slide-up pb-12">
            <div>
                <h1 className="page-title text-3xl font-black">My Profile</h1>
                <p className="text-slate-500 mt-1">Manage your account information and security</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left: Avatar & Basic Info */}
                <div className="md:col-span-1 space-y-6">
                    <div className="card p-6 text-center group">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <div className="w-full h-full rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 font-black text-4xl overflow-hidden shadow-inner border-4 border-white">
                                {preview ? (
                                    <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.[0]?.toUpperCase()
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="absolute -right-2 -bottom-2 p-2.5 bg-white text-primary-600 border border-slate-200 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all group-hover:rotate-6"
                                title="Change Avatar"
                            >
                                <Camera size={18} />
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">{user?.name}</h2>
                        <p className="text-sm text-slate-400 capitalize bg-slate-100 w-fit mx-auto px-3 py-0.5 rounded-full mt-1 font-semibold">{user?.role}</p>
                        
                        <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail size={16} className="text-slate-400" />
                                <span className="truncate">{user?.email}</span>
                            </div>
                            {user?.phone && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone size={16} className="text-slate-400" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card p-6 bg-primary-600 text-white overflow-hidden relative">
                        <div className="relative z-10">
                            <Shield className="mb-3 opacity-50" size={32} />
                            <h3 className="font-bold text-lg mb-1">Account Security</h3>
                            <p className="text-primary-100 text-sm">Keep your password strong and update it regularly to stay safe.</p>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    </div>
                </div>

                {/* Right: Edit Forms */}
                <div className="md:col-span-2 space-y-6">
                    <div className="card">
                        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                            <User size={20} className="text-primary-600" />
                            <h2 className="font-bold text-slate-800">Edit Profile Details</h2>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Full Name</label>
                                    <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Phone Number</label>
                                    <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 00000 00000" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="label">Email Address</label>
                                    <input required type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                </div>
                            </div>

                            {user?.role === "faculty" && (
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Department</label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input className="input-field pl-10" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label">Qualification</label>
                                        <div className="relative">
                                            <GraduationCap size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input className="input-field pl-10" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="label">Bio / About Me</label>
                                <div className="relative">
                                    <FileText size={16} className="absolute left-3.5 top-3 text-slate-400" />
                                    <textarea className="input-field min-h-[100px] pl-10 pt-2.5" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell us a bit about yourself..." />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full sm:w-fit px-8 py-3 flex items-center justify-center gap-2">
                                {loading ? "Saving..." : <><Save size={18} />Save Changes</>}
                            </button>
                        </form>
                    </div>

                    <div className="card">
                        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
                            <Lock size={20} className="text-primary-600" />
                            <h2 className="font-bold text-slate-800">Change Password</h2>
                        </div>
                        <form onSubmit={handleChangePassword} className="p-6 space-y-5">
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="label text-xs">Current Password</label>
                                    <input required type="password" className="input-field" value={pwdForm.currentPassword} onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label text-xs">New Password</label>
                                    <input required type="password" className="input-field" value={pwdForm.newPassword} onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label text-xs">Confirm New Password</label>
                                    <input required type="password" className="input-field" value={pwdForm.confirmPassword} onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full sm:w-fit px-8 py-3 flex items-center justify-center gap-2">
                                {loading ? "Updating..." : <><Lock size={18} />Update Password</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
