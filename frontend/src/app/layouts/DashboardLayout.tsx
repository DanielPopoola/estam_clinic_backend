import { Outlet, NavLink, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Search, 
  Bell, 
  User,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Medical Records", href: "/patients", icon: FileText },
  { name: "Staff Management", href: "/staff", icon: ShieldCheck },
];

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-brand-navy text-white transition-all duration-300 flex flex-col fixed inset-y-0 z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <div className="size-8 bg-brand-blue rounded-md flex items-center justify-center shrink-0">
            <span className="font-bold text-lg">E</span>
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-3 font-semibold text-lg tracking-tight truncate"
            >
              ESTAM University
            </motion.span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => cn(
                  "flex items-center px-3 py-2.5 rounded-lg transition-colors group",
                  isActive 
                    ? "bg-brand-blue text-white" 
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className={cn("size-5 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-3 font-medium text-sm"
                  >
                    {item.name}
                  </motion.span>
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-16 bg-brand-navy border border-white/10 text-white px-2 py-1 rounded text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button className="flex items-center w-full px-3 py-2.5 text-slate-300 hover:bg-white/10 hover:text-white rounded-lg transition-colors">
            <LogOut className="size-5 shrink-0 text-slate-400" />
            {isSidebarOpen && (
              <span className="ml-3 font-medium text-sm text-left">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isSidebarOpen ? "ml-64" : "ml-20"
        )}
      >
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
              <input 
                type="text" 
                placeholder="Search patient by name or Matric No..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent border focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative text-gray-500 hover:text-brand-navy transition-colors">
              <Bell className="size-5" />
              <span className="absolute -top-1 -right-1 size-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>
            
            <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 leading-none">Dr. Sarah Johnson</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">Head of Clinic</p>
              </div>
              <div className="size-10 bg-brand-navy rounded-full border-2 border-gray-100 flex items-center justify-center text-white font-bold">
                SJ
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
