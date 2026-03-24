import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  ArrowLeft, 
  Save, 
  Printer, 
  CheckCircle, 
  Clipboard, 
  History,
  Activity,
  Droplet,
  Thermometer,
  Eye
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { motion } from "motion/react";

const patientData = {
  id: 1,
  name: "David Okoro",
  matric: "EUC/23/CS/042",
  dob: "15 May 2004 (21 yrs)",
  gender: "Male",
  phone: "+234 801 234 5678",
  email: "d.okoro@estam.edu",
  bloodGroup: "O+",
  weight: "72 kg",
  temp: "36.8°C",
  emergencyContact: "Mr. Samuel Okoro (+234 810 000 1111)",
  allergies: ["Penicillin", "Dust"],
  lastVisit: "20 Mar 2024",
};

export function ClinicalRecord() {
  const navigate = useNavigate();
  const { patientId } = useParams();

  const handleSave = () => {
    toast.success("Clinical record saved successfully!");
  };

  const handleFinalize = () => {
    toast.success("Visit finalized and patient cleared.");
    navigate("/appointments");
  };

  return (
    <div className="space-y-6 max-w-(--breakpoint-2xl) mx-auto pb-24">
      <header className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all"
          >
            <ArrowLeft className="size-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Record Entry</h1>
            <p className="text-slate-500 mt-1">Patient Encounter: {patientData.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded">
            Session Start: 10:32 AM
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Patient Profile Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-brand-navy text-white">
              <div className="flex items-center space-x-4">
                <div className="size-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/20">
                  DO
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-none mb-1">{patientData.name}</h3>
                  <p className="text-xs text-white/70 font-medium uppercase tracking-widest">{patientData.matric}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DOB / Age</p>
                  <p className="text-sm font-semibold text-slate-900">{patientData.dob}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</p>
                  <p className="text-sm font-semibold text-slate-900">{patientData.gender}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Phone className="size-4 text-slate-400 mr-3 shrink-0" />
                  <span className="text-slate-600 font-medium">{patientData.phone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="size-4 text-slate-400 mr-3 shrink-0" />
                  <span className="text-slate-600 font-medium">{patientData.email}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <History className="size-3 mr-1.5" /> Emergency Contact
                  </p>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                    {patientData.emergencyContact}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {patientData.allergies.map(allergy => (
                      <span key={allergy} className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-red-100">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vitals Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-50 pb-2">Pre-check Vitals</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center space-x-3">
                <Droplet className="size-4 text-brand-blue" />
                <div>
                  <p className="text-[9px] font-bold text-blue-500 uppercase">Blood</p>
                  <p className="text-sm font-bold text-brand-navy">{patientData.bloodGroup}</p>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center space-x-3">
                <Activity className="size-4 text-emerald-600" />
                <div>
                  <p className="text-[9px] font-bold text-emerald-500 uppercase">Weight</p>
                  <p className="text-sm font-bold text-brand-navy">{patientData.weight}</p>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 flex items-center space-x-3">
                <Thermometer className="size-4 text-orange-600" />
                <div>
                  <p className="text-[9px] font-bold text-orange-500 uppercase">Temp</p>
                  <p className="text-sm font-bold text-brand-navy">{patientData.temp}</p>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 flex items-center space-x-3">
                <Eye className="size-4 text-purple-600" />
                <div>
                  <p className="text-[9px] font-bold text-purple-500 uppercase">Last Visit</p>
                  <p className="text-sm font-bold text-brand-navy">Mar 20</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Forms */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[600px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center tracking-tight">
                <Clipboard className="size-5 mr-3 text-brand-blue" />
                Consultation Details
              </h3>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Session ID: #EN-2026-9842
              </div>
            </div>
            
            <div className="p-8 space-y-8 flex-1 overflow-y-auto">
              {/* Diagnosis */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                  Diagnosis / Chief Complaints
                </label>
                <textarea 
                  rows={4}
                  placeholder="Describe patient symptoms and initial diagnosis..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm leading-relaxed"
                />
              </div>

              {/* Treatment Plan */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Treatment Plan & Procedures</label>
                <textarea 
                  rows={4}
                  placeholder="Outline the medical procedure or immediate care provided..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm leading-relaxed"
                />
              </div>

              {/* Prescriptions */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Prescriptions (Medications)</label>
                <div className="bg-slate-50 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-blue/30 transition-colors">
                  <textarea 
                    rows={3}
                    placeholder="Enter medications, dosage, and frequency (e.g., Paracetamol 500mg - 2x daily)"
                    className="w-full bg-transparent border-none focus:ring-0 outline-none text-sm leading-relaxed resize-none"
                  />
                  <div className="mt-2 flex justify-end">
                    <button className="text-[11px] font-bold text-brand-blue uppercase hover:underline">
                      + Add Drug Template
                    </button>
                  </div>
                </div>
              </div>

              {/* Follow-up */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Follow-up Instructions</label>
                <input 
                  type="text" 
                  placeholder="E.g., Return in 7 days if symptoms persist"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <footer className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 h-20 shadow-2xl shadow-slate-900/10">
        <div className="max-w-(--breakpoint-2xl) mx-auto h-full px-8 flex items-center justify-between">
          <div className="flex items-center text-slate-500 text-xs font-medium">
            <span className="flex items-center animate-pulse mr-4">
              <span className="size-2 bg-emerald-500 rounded-full mr-2" />
              Auto-saving...
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Save className="size-4" />
              <span>Draft</span>
            </button>
            <button 
              className="flex items-center space-x-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Printer className="size-4" />
              <span>Print Rx</span>
            </button>
            <button 
              onClick={handleFinalize}
              className="flex items-center space-x-2 px-8 py-2.5 bg-brand-navy text-white rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-brand-navy/90 transition-all shadow-md active:scale-95"
            >
              <CheckCircle className="size-4" />
              <span>Finalize Visit</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
