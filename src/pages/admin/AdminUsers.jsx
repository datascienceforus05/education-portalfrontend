import { useEffect, useState, useCallback } from "react";
import { getAdminUsers, approveUser, toggleUserStatus, deleteUser, createUser, updateUser } from "../../api";
import toast from "react-hot-toast";
import { Search, CheckCircle, XCircle, Power, Trash2, UserCheck, UserX, Plus, X, Briefcase, Mail, Edit2 } from "lucide-react";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [approvalFilter, setApprovalFilter] = useState("all");
    
    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ 
        name: "", 
        email: "", 
        password: "Default@123", 
        designation: "", 
        bio: "", 
        role: "board_member",
        department: "" 
    });

    const fetchUsers = useCallback(() => {
        setLoading(true);
        const params = {};
        if (roleFilter !== "all") params.role = roleFilter;
        if (approvalFilter === "pending") params.isApproved = false;
        if (approvalFilter === "approved") params.isApproved = true;

        getAdminUsers(params)
            .then((r) => setUsers(r.data.users || []))
            .catch(err => {
                console.error(err);
                toast.error("Failed to fetch users");
            })
            .finally(() => setLoading(false));
    }, [roleFilter, approvalFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleApprove = async (id, isApproved) => {
        try {
            await approveUser(id, { isApproved });
            setUsers((u) => u.map((user) => user._id === id ? { ...user, isApproved } : user));
            toast.success(isApproved ? "Faculty approved!" : "Faculty rejected");
        } catch { toast.error("Action failed"); }
    };

    const handleToggle = async (id) => {
        try {
            await toggleUserStatus(id);
            setUsers((u) => u.map((user) => user._id === id ? { ...user, isActive: !user.isActive } : user));
            toast.success("Account status toggled");
        } catch { toast.error("Status update failed"); }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Permanently delete account for "${name}"?`)) return;
        try {
            await deleteUser(id);
            setUsers((u) => u.filter((user) => user._id !== id));
            toast.success("User deleted");
        } catch { toast.error("Failed to delete user"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editId) {
                const submitData = { ...formData };
                if (!submitData.password) delete submitData.password;
                await updateUser(editId, submitData);
                toast.success("Profile updated successfully!");
            } else {
                await createUser(formData);
                toast.success("Member added successfully!");
            }
            setShowAddModal(false);
            resetForm();
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${editId ? 'update' : 'add'} member`);
        } finally {
            setSubmitting(false);
        }
    };

    const openEdit = (user) => {
        setEditId(user._id);
        setFormData({
            name: user.name,
            email: user.email,
            password: "", // leave empty to not change
            role: user.role,
            designation: user.designation || "",
            department: user.department || "",
            bio: user.bio || ""
        });
        setShowAddModal(true);
    };

    const resetForm = () => {
        setEditId(null);
        setFormData({ name: "", email: "", password: "Default@123", designation: "", bio: "", role: "board_member", department: "" });
    };

    const filtered = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    );

    const roleColor = { 
        student: "bg-blue-50 text-blue-600", 
        faculty: "bg-emerald-50 text-emerald-600", 
        board_member: "bg-slate-900 text-white",
        admin: "bg-purple-100 text-purple-700" 
    };

    if (loading && users.length === 0) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 animate-slide-up pb-20">
            <div className="flex justify-between items-end gap-4 flex-wrap">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">User Management</h2>
                    <p className="text-slate-500 text-sm mt-1">{filtered.length} active directory profiles found</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setShowAddModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl"
                >
                    <Plus size={18} /> Add Faculty / Board
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input placeholder="Search directory..." className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    <select className="input-field w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="all">All Roles</option>
                        <option value="student">Students</option>
                        <option value="faculty">Faculty</option>
                        <option value="board_member">Board Members</option>
                        <option value="admin">Admins</option>
                    </select>
                    <select className="input-field w-auto" value={approvalFilter} onChange={(e) => setApprovalFilter(e.target.value)}>
                        <option value="all">Any Status</option>
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved</option>
                    </select>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                {["Member Info", "Institutional Role", "Affiliation", "Status", "Actions"].map((h) => (
                                    <th key={h} className="text-left text-xs font-black uppercase tracking-widest text-slate-400 px-6 py-4">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold">No users in this view</td></tr>
                            ) : filtered.map((u) => (
                                <tr key={u._id} className={`hover:bg-slate-50 transition-colors ${!u.isActive ? "bg-slate-100/30" : ""}`}>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-[0.8rem] bg-primary-100 flex items-center justify-center text-primary-600 font-black text-sm overflow-hidden">
                                                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm leading-tight">{u.name}</p>
                                                <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5"><Mail size={10} /> {u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${roleColor[u.role] || "bg-slate-100 text-slate-600"}`}>
                                            {u.role.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                            <Briefcase size={12} className="text-slate-300" />
                                            {u.role === 'board_member' ? (u.designation || 'Director') : (u.department || "General")}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${u.isActive ? "text-emerald-500" : "text-red-400"}`}>
                                                {u.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />} {u.isActive ? "Active" : "Suspended"}
                                            </span>
                                            {u.role === "faculty" && (
                                                <span className={`text-[9px] font-black uppercase border border-current px-1.5 rounded-sm w-fit ${u.isApproved ? "text-blue-500" : "text-amber-500"}`}>
                                                    {u.isApproved ? "Verified" : "Pending"}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(u)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="Edit Profile">
                                                <Edit2 size={18} />
                                            </button>
                                            {u.role === "faculty" && !u.isApproved && (
                                                <>
                                                    <button onClick={() => handleApprove(u._id, true)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl" title="Approve"><UserCheck size={18} /></button>
                                                    <button onClick={() => handleApprove(u._id, false)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl" title="Reject"><UserX size={18} /></button>
                                                </>
                                            )}
                                            {u.role !== "admin" && (
                                                <>
                                                    <button onClick={() => handleToggle(u._id)} className={`p-2 rounded-xl transition-all ${u.isActive ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"}`} title={u.isActive ? "Suspend" : "Activate"}>
                                                        <Power size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(u._id, u.name)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl" title="Delete"><Trash2 size={18} /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl animate-scale-in">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-800">{editId ? "Update Profile" : "Add Institutional Member"}</h2>
                            <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                                    <input required className="input-field" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Dr. John Doe" />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                    <input required type="email" className="input-field" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                                    <input required={!editId} className="input-field" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={editId ? "Leave blank to keep unchanged" : ""} />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Institutional Role</label>
                                    <select className="input-field" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                                        <option value="board_member">Board Member</option>
                                        <option value="faculty">Academic Faculty</option>
                                        <option value="student">Student</option>
                                    </select>
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">{formData.role === 'board_member' ? 'Designation' : 'Department'}</label>
                                    <input required className="input-field" value={formData.role === 'board_member' ? formData.designation : formData.department} onChange={(e) => setFormData({...formData, [formData.role === 'board_member' ? 'designation' : 'department']: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Bio</label>
                                <textarea rows={3} className="input-field py-3 resize-none" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Short professional background..." />
                            </div>
                            <button type="submit" disabled={submitting} className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all shadow-xl">
                                {submitting ? "Processing..." : (editId ? "Save Changes" : "Create Member Profile")}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
