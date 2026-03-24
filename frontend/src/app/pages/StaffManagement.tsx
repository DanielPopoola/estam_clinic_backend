import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar 
} from "lucide-react";

const staff = [
  { id: 1, name: "Dr. Sarah Johnson", role: "Head of Clinic", department: "General Medicine", status: "Active", joined: "Jan 2021" },
  { id: 2, name: "Nurse Emily Chen", role: "Senior Nurse", department: "Nursing", status: "Active", joined: "Mar 2022" },
  { id: 3, name: "Dr. Marcus Thorne", role: "Specialist", department: "Cardiology", status: "On Leave", joined: "Jun 2020" },
  { id: 4, name: "Alice Weaver", role: "Administrator", department: "Admin", status: "Active", joined: "Feb 2023" },
];

export function StaffManagement() {
  return (
    <div className="space-y-6 max-w-(--breakpoint-2xl) mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 mt-1">Directory and access control for university clinic personnel.</p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-all shadow-md">
          <UserPlus className="size-4" />
          <span>Add New Staff</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-brand-blue/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="size-12 bg-slate-100 rounded-xl flex items-center justify-center text-brand-navy font-bold text-lg border border-slate-200">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                member.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {member.status}
              </span>
            </div>
            <div className="space-y-1 mb-6">
              <h3 className="font-bold text-slate-900 leading-none group-hover:text-brand-blue transition-colors">{member.name}</h3>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{member.role}</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center text-xs text-slate-500">
                <ShieldCheck className="size-3.5 mr-2 text-slate-400" />
                {member.department}
              </div>
              <div className="flex items-center text-xs text-slate-500">
                <Calendar className="size-3.5 mr-2 text-slate-400" />
                Joined: {member.joined}
              </div>
            </div>
            <div className="mt-6 flex space-x-2">
              <button className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-blue/5 hover:text-brand-blue hover:border-brand-blue/20 transition-all">
                Profile
              </button>
              <button className="p-2 border border-slate-100 bg-slate-50 text-slate-400 rounded-lg hover:text-slate-600 transition-all">
                <Mail className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
