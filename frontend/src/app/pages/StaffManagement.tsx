import { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Calendar, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { usersApi } from '../../lib/api';
import type { User } from '../../lib/types';
import { useAuth } from '../context/AuthContext';
import { format, parseISO } from 'date-fns';

const ROLE_STYLES: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-600',
  DOCTOR: 'bg-blue-100 text-blue-600',
  RECEPTIONIST: 'bg-slate-100 text-slate-600',
};

export function StaffManagement() {
  const { isAdmin } = useAuth();
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    usersApi
      .list()
      .then((res) => setStaff(res.data.results ?? res.data))
      .catch(() => toast.error('Failed to load staff.'))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <ShieldCheck className="size-10 text-slate-300" />
        <p className="text-slate-400 font-medium text-sm">
          Staff management is only available to administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Staff Management
          </h1>
          <p className="text-slate-500 mt-1">
            Directory and access control for university clinic personnel.
          </p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-all shadow-md">
          <UserPlus className="size-4" />
          <span>Add New Staff</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-52 animate-pulse"
              />
            ))
          : staff.map((member) => {
              const displayName =
                [member.first_name, member.last_name].filter(Boolean).join(' ') ||
                member.username;
              const initials = displayName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
              const joinedDate = member.date_joined
                ? format(parseISO(member.date_joined), 'MMM yyyy')
                : '—';

              return (
                <div
                  key={member.id}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-brand-blue/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="size-12 bg-slate-100 rounded-xl flex items-center justify-center text-brand-navy font-bold text-lg border border-slate-200">
                      {initials}
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                        member.is_active
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-1 mb-6">
                    <h3 className="font-bold text-slate-900 leading-none group-hover:text-brand-blue transition-colors">
                      {displayName}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {member.username}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex items-center text-xs text-slate-500">
                      <ShieldCheck className="size-3.5 mr-2 text-slate-400" />
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ROLE_STYLES[member.role] ?? 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <Calendar className="size-3.5 mr-2 text-slate-400" />
                      Joined: {joinedDate}
                    </div>
                    {member.email && (
                      <div className="flex items-center text-xs text-slate-500 truncate">
                        <Mail className="size-3.5 mr-2 text-slate-400 shrink-0" />
                        {member.email}
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <button className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-brand-blue/5 hover:text-brand-blue hover:border-brand-blue/20 transition-all">
                      View Profile
                    </button>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}