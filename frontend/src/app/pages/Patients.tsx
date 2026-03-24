import { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Edit2, 
  Trash2, 
  Plus, 
  Download,
  Mail,
  Phone
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";

const initialPatients = [
  { id: 1, name: "David Okoro", matric: "EUC/23/CS/042", phone: "+234 801 234 5678", email: "d.okoro@estam.edu", category: "Student", lastVisit: "2024-03-20" },
  { id: 2, name: "Blessing Adebayo", matric: "EUC/24/ACC/115", phone: "+234 802 345 6789", email: "b.adebayo@estam.edu", category: "Student", lastVisit: "2024-03-21" },
  { id: 3, name: "Dr. Samuel Mensah", matric: "EUC/STAFF/ENG/089", phone: "+234 803 456 7890", email: "s.mensah@estam.edu", category: "Staff", lastVisit: "2024-03-22" },
  { id: 4, name: "Aisha Mohammed", matric: "EUC/23/NUR/201", phone: "+234 804 567 8901", email: "a.mohammed@estam.edu", category: "Student", lastVisit: "2024-03-23" },
  { id: 5, name: "John Doe", matric: "EUC/21/BIT/010", phone: "+234 805 678 9012", email: "j.doe@estam.edu", category: "Student", lastVisit: "2024-03-19" },
  { id: 6, name: "Sarah Williams", matric: "EUC/STAFF/ADM/002", phone: "+234 806 789 0123", email: "s.williams@estam.edu", category: "Staff", lastVisit: "2024-03-18" },
  { id: 7, name: "Kelechi Iheanacho", matric: "EUC/22/PHY/055", phone: "+234 807 890 1234", email: "k.iheanacho@estam.edu", category: "Student", lastVisit: "2024-03-17" },
  { id: 8, name: "Esther Uzoma", matric: "EUC/23/MCB/120", phone: "+234 808 901 2345", email: "e.uzoma@estam.edu", category: "Recent", lastVisit: "2024-03-24" },
];

export function Patients() {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const categories = ["All", "Recent", "Staff", "Students"];

  const filteredPatients = initialPatients.filter(patient => {
    const matchesFilter = filter === "All" || 
                         (filter === "Students" && patient.category === "Student") || 
                         (filter === "Staff" && patient.category === "Staff") ||
                         (filter === "Recent" && patient.category === "Recent");
    
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         patient.matric.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-(--breakpoint-2xl) mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-slate-500 mt-1">Manage and access all patient records centrally.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="size-4" />
            <span>Export CSV</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90 transition-colors shadow-sm">
            <Plus className="size-4" />
            <span>Add New Patient</span>
          </button>
        </div>
      </header>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === cat 
                  ? "bg-brand-navy text-white shadow-md" 
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or matric no..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Matric Number</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Phone</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredPatients.map((patient) => (
                  <motion.tr 
                    key={patient.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-brand-navy group-hover:text-brand-blue transition-colors">
                        {patient.matric}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="size-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs mr-3 border border-slate-200">
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="size-3.5 mr-2 text-slate-400" />
                        {patient.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <Mail className="size-3.5 mr-2 text-slate-400" />
                        {patient.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        patient.category === 'Staff' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {patient.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => navigate(`/records/${patient.id}`)}
                          className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                          title="View Records"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button 
                          className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                          title="Edit Profile"
                        >
                          <Edit2 className="size-4" />
                        </button>
                        <button 
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Showing <span className="text-slate-900">{filteredPatients.length}</span> of <span className="text-slate-900">{initialPatients.length}</span> results
          </p>
          <div className="flex items-center space-x-2">
            <button className="p-2 border border-slate-200 rounded-lg bg-white text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="size-4" />
            </button>
            <button className="p-2 border border-slate-200 rounded-lg bg-white text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
