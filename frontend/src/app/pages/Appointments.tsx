import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Clock3, 
  X 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

const appointments = [
  { id: 1, patient: "David Okoro", matric: "EUC/23/CS/042", time: "10:30 AM", date: "Today", status: "Scheduled", type: "General Consultation" },
  { id: 2, patient: "Blessing Adebayo", matric: "EUC/24/ACC/115", time: "11:15 AM", date: "Today", status: "Completed", type: "Lab Test Follow-up" },
  { id: 3, patient: "Dr. Samuel Mensah", matric: "EUC/STAFF/ENG/089", time: "12:00 PM", date: "Today", status: "Cancelled", type: "Health Clearance" },
  { id: 4, patient: "Aisha Mohammed", matric: "EUC/23/NUR/201", time: "01:30 PM", date: "Today", status: "Scheduled", type: "Immunization" },
  { id: 5, patient: "John Doe", matric: "EUC/21/BIT/010", time: "09:00 AM", date: "Tomorrow", status: "Scheduled", type: "Mental Health Session" },
];

export function Appointments() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Today");

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Appointment scheduled successfully!");
    setIsPanelOpen(false);
  };

  return (
    <div className="space-y-6 max-w-(--breakpoint-2xl) mx-auto relative">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointment Scheduler</h1>
          <p className="text-slate-500 mt-1">View and manage all upcoming patient visits.</p>
        </div>
        <button 
          onClick={() => setIsPanelOpen(true)}
          className="flex items-center space-x-2 px-6 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90 transition-all shadow-md active:scale-95"
        >
          <Plus className="size-4" />
          <span>New Appointment</span>
        </button>
      </header>

      {/* Scheduler Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {["Today", "Tomorrow", "This Week", "Next Week"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab 
                  ? "bg-white text-brand-navy shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <ChevronLeft className="size-5" />
            </button>
            <div className="text-sm font-bold text-slate-900 min-w-32 text-center select-none uppercase tracking-widest">
              March 24, 2026
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <ChevronRight className="size-5" />
            </button>
          </div>
          <div className="hidden md:block w-px h-6 bg-slate-200" />
          <button className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors">
            <Calendar className="size-5" />
          </button>
        </div>
      </div>

      {/* Appointment List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {appointments.filter(a => activeTab === 'This Week' || a.date === activeTab).map((appointment) => (
          <div key={appointment.id} className="p-6 hover:bg-slate-50/50 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="size-12 bg-slate-100 rounded-xl flex flex-col items-center justify-center shrink-0 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">MAR</span>
                <span className="text-lg font-bold text-brand-navy leading-none">24</span>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors">
                  {appointment.patient}
                </h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center">
                    <Clock className="size-3.5 mr-1.5 text-slate-400" />
                    {appointment.time}
                  </span>
                  <span className="flex items-center">
                    <span className="size-1.5 bg-slate-300 rounded-full mr-2" />
                    {appointment.matric}
                  </span>
                  <span className="flex items-center">
                    <span className="size-1.5 bg-slate-300 rounded-full mr-2" />
                    {appointment.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 self-end md:self-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                appointment.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                'bg-red-100 text-red-700'
              }`}>
                {appointment.status === 'Scheduled' && <Clock3 className="size-3 mr-1.5" />}
                {appointment.status === 'Completed' && <CheckCircle className="size-3 mr-1.5" />}
                {appointment.status === 'Cancelled' && <XCircle className="size-3 mr-1.5" />}
                {appointment.status}
              </span>
              <div className="h-8 w-px bg-slate-100 hidden md:block" />
              <div className="flex items-center space-x-2">
                <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:border-brand-blue/30 hover:text-brand-blue transition-colors shadow-sm">
                  Reschedule
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreVertical className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-out Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 bg-brand-navy/30 backdrop-blur-sm z-50 cursor-pointer"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[60] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Schedule Appointment</h3>
                  <p className="text-sm text-slate-500 mt-1">Fill in the details for the new patient visit.</p>
                </div>
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="size-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAddAppointment} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Patient Name</label>
                  <input 
                    type="text" 
                    placeholder="Search patient or enter name"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time</label>
                    <input 
                      type="time" 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Visit Type</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm">
                    <option>General Consultation</option>
                    <option>Lab Test / Diagnostics</option>
                    <option>Follow-up Appointment</option>
                    <option>Immunization / Vaccination</option>
                    <option>Emergency Clearance</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notes (Optional)</label>
                  <textarea 
                    rows={4}
                    placeholder="Add any specific concerns or medical context..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm resize-none"
                  />
                </div>
              </form>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center space-x-3">
                <button 
                  onClick={() => setIsPanelOpen(false)}
                  type="button"
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddAppointment}
                  className="flex-1 px-4 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90 transition-colors shadow-md shadow-brand-blue/20"
                >
                  Confirm Schedule
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
