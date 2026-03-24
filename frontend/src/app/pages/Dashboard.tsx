import { motion } from "motion/react";
import { 
  Users, 
  Calendar, 
  FlaskConical, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";

const stats = [
  { label: "Today's Appointments", value: "24", icon: Calendar, color: "bg-blue-500", trend: "+12%" },
  { label: "New Patients", value: "8", icon: Users, color: "bg-emerald-500", trend: "+5%" },
  { label: "Pending Lab Tests", value: "12", icon: FlaskConical, color: "bg-amber-500", trend: "-2%" },
];

const activity = [
  { id: 1, name: "David Okoro", matric: "EUC/23/CS/042", time: "10:30 AM", type: "Check-in", status: "Waiting" },
  { id: 2, name: "Blessing Adebayo", matric: "EUC/24/ACC/115", time: "09:45 AM", type: "Lab Result", status: "Ready" },
  { id: 3, name: "Samuel Mensah", matric: "EUC/22/ENG/089", time: "09:15 AM", type: "Follow-up", status: "Completed" },
  { id: 4, name: "Aisha Mohammed", matric: "EUC/23/NUR/201", time: "08:30 AM", type: "Check-in", status: "Consulting" },
];

const chartData = [
  { name: "Mon", patients: 40 },
  { name: "Tue", patients: 30 },
  { name: "Wed", patients: 65 },
  { name: "Thu", patients: 45 },
  { name: "Fri", patients: 55 },
  { name: "Sat", patients: 20 },
  { name: "Sun", patients: 15 },
];

export function Dashboard() {
  return (
    <div className="space-y-8 max-w-(--breakpoint-2xl) mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinic Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, Dr. Johnson. Here's what's happening today.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            Download Report
          </button>
          <button className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90 transition-colors shadow-sm">
            + New Appointment
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center group hover:border-brand-blue/30 transition-colors"
          >
            <div className={`size-12 rounded-lg ${stat.color} flex items-center justify-center text-white shrink-0 shadow-md`}>
              <stat.icon className="size-6" />
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider leading-none mb-2">{stat.label}</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-slate-900 leading-none">{stat.value}</span>
                <span className={`text-xs font-bold leading-none ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 tracking-tight">Patient Traffic (Weekly)</h3>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase">
              <span className="size-2 bg-brand-blue rounded-full"></span>
              <span>Total Visits</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3182CE" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3182CE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="patients" 
                  stroke="#3182CE" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorPatients)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 tracking-tight">Recent Activity</h3>
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <MoreVertical className="size-4" />
            </button>
          </div>
          <div className="p-2 flex-1 overflow-y-auto max-h-[380px]">
            {activity.map((item) => (
              <div 
                key={item.id} 
                className="p-4 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 last:border-0 group"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-blue transition-colors">
                    {item.name}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded leading-none">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{item.matric}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center">
                    <Clock className="size-3 mr-1" />
                    {item.type}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    item.status === 'Waiting' && "bg-amber-100 text-amber-600",
                    item.status === 'Ready' && "bg-emerald-100 text-emerald-600",
                    item.status === 'Completed' && "bg-blue-100 text-blue-600",
                    item.status === 'Consulting' && "bg-purple-100 text-purple-600",
                  )}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="p-4 text-center text-xs font-bold text-brand-blue hover:text-brand-blue/80 transition-colors uppercase tracking-widest border-t border-slate-100">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
