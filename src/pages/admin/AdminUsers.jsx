import { useEffect, useState } from "react";
import { getAdminUsers, approveUser, toggleUserStatus, deleteUser } from "../../api";
import toast from "react-hot-toast";
import { Users, Search, CheckCircle, XCircle, Power, Trash2, Shield, UserCheck, UserX } from "lucide-react";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [approvalFilter, setApprovalFilter] = useState("all");

    const fetchUsers = () => {
        const params = {};
        if (roleFilter !== "all") params.role = roleFilter;
        if (approvalFilter === "pending") params.isApproved = false;
        if (approvalFilter === "approved") params.isApproved = true;
        getAdminUsers(params)
            .then((r) => setUsers(r.data.users || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUsers(); }, [roleFilter, approvalFilter]);

    const handleApprove = async (id, isApproved) => {
        try {
            const r = await approveUser(id, { isApproved });
            setUsers((u) => u.map((user) => user._id === id ? { ...user, isApproved } : user));
            toast.success(isApproved ? "Faculty approved!" : "Faculty rejected");
        } catch { toast.error("Failed"); }
    };

    const handleToggle = async (id) => {
        try {
            const r = await toggleUserStatus(id);
            setUsers((u) => u.map((user) => user._id === id ? { ...user, isActive: !user.isActive } : user));
            toast.success("Status updated");
        } catch { toast.error("Failed"); }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await deleteUser(id);
            setUsers((u) => u.filter((user) => user._id !== id));
            toast.success("User deleted");
        } catch { toast.error("Failed to delete"); }
    };

    const filtered = users.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    );

    const roleColor = { student: "badge-blue", faculty: "badge-green", admin: "bg-purple-100 text-purple-700 badge" };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6 animate-slide-up">
            <div>
                <h1 className="page-title">Manage Users</h1>
                <p className="text-slate-500 text-sm mt-1">{filtered.length} user{filtered.length !== 1 ? "s" : ""} found</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input placeholder="Search by name or email..." className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className="input-field w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admins</option>
                </select>
                <select className="input-field w-auto" value={approvalFilter} onChange={(e) => setApprovalFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Approved</option>
                </select>
            </div>

            {/* Pending Faculty Alert */}
            {users.filter((u) => u.role === "faculty" && !u.isApproved).length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <Shield size={20} className="text-amber-600 flex-shrink-0" />
                    <p className="text-amber-700 text-sm">
                        <strong>{users.filter((u) => u.role === "faculty" && !u.isApproved).length}</strong> faculty member(s) awaiting approval
                    </p>
                </div>
            )}

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                {["User", "Role", "Department", "Status", "Approval", "Actions"].map((h) => (
                                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                                    <Users size={36} className="mx-auto mb-3 opacity-30" />
                                    <p>No users found</p>
                                </td></tr>
                            ) : filtered.map((u) => (
                                <tr key={u._id} className={`hover:bg-slate-50 transition-colors ${!u.isActive ? "opacity-60" : ""}`}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                                                {u.name[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                                                <p className="text-slate-400 text-xs">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`badge capitalize ${roleColor[u.role] || "badge-gray"}`}>{u.role}</span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-500 text-sm">{u.department || "—"}</td>
                                    <td className="px-5 py-4">
                                        <span className={`badge ${u.isActive ? "badge-green" : "badge-red"} flex items-center gap-1 w-fit`}>
                                            {u.isActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                            {u.isActive ? "Active" : "Suspended"}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        {u.role === "faculty" ? (
                                            <span className={`badge ${u.isApproved ? "badge-green" : "badge-yellow"} flex items-center gap-1 w-fit`}>
                                                {u.isApproved ? "Approved" : "Pending"}
                                            </span>
                                        ) : <span className="text-slate-300 text-xs">N/A</span>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1">
                                            {u.role === "faculty" && !u.isApproved && (
                                                <>
                                                    <button onClick={() => handleApprove(u._id, true)} title="Approve" className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                                                        <UserCheck size={17} />
                                                    </button>
                                                    <button onClick={() => handleApprove(u._id, false)} title="Reject" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <UserX size={17} />
                                                    </button>
                                                </>
                                            )}
                                            {u.role !== "admin" && (
                                                <>
                                                    <button onClick={() => handleToggle(u._id)} title={u.isActive ? "Suspend" : "Activate"} className={`p-1.5 rounded-lg transition-colors ${u.isActive ? "text-amber-500 hover:bg-amber-50" : "text-green-500 hover:bg-green-50"}`}>
                                                        <Power size={17} />
                                                    </button>
                                                    <button onClick={() => handleDelete(u._id, u.name)} title="Delete" className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 size={17} />
                                                    </button>
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
        </div>
    );
}
