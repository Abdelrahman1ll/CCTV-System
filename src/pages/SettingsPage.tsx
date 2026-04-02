import { useState, useEffect } from "react";
import { Save, Globe, ShieldCheck, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function SettingsPage() {
  const { dvrConfig, setupDvr, removeDvr } = useAuth();
  const [dvrIp, setDvrIp] = useState(dvrConfig?.ip || "");
  const [dvrUser, setDvrUser] = useState(dvrConfig?.user || "");
  const [dvrPass, setDvrPass] = useState(dvrConfig?.pass || "");
  const [channels, setChannels] = useState(String(dvrConfig?.channels || 4));
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (dvrConfig) {
      setDvrIp(dvrConfig.ip);
      setDvrUser(dvrConfig.user);
      setDvrPass(dvrConfig.pass);
      setChannels(String(dvrConfig.channels));
    }
  }, [dvrConfig]);

  const handleSaveDvr = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      await setupDvr({
        ip: dvrIp,
        user: dvrUser,
        pass: dvrPass,
        channels: parseInt(channels)
      });
      setMessage({
        text: "تم حفظ إعدادات الـ DVR وتحديث القنوات بنجاح.",
        type: "success",
      });
    } catch (err: any) {
      setMessage({
        text: err.message || "حدث خطأ أثناء الاتصال بالـ DVR",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  const handleDeleteDvr = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف بيانات الـ DVR المحفوظة؟")) {
      removeDvr();
      setDvrIp("");
      setDvrUser("");
      setDvrPass("");
      setChannels("4");
      setMessage({
        text: "تم حذف بيانات الـ DVR بنجاح.",
        type: "success",
      });
    }
  };

  return (
    <div
      className="h-full overflow-y-auto bg-[#0a0a0a] p-6 lg:p-8 text-zinc-100 scrollbar-hide"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
            إعدادات النظام
          </h1>
          <p className="text-zinc-500 mt-2">
            قم بتعديل بيانات الـ DVR الخاص بك وإدارة القنوات النشطة.
          </p>
        </div>

        {message.text && (
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
              message.type === "error" 
                ? "bg-red-500/10 border-red-500/20 text-red-500" 
                : "bg-green-500/10 border-green-500/20 text-green-500"
            }`}
          >
            {message.type === "error" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            ) : (
              <ShieldCheck size={20} />
            )}
            <span className="font-medium text-sm">{message.text}</span>
          </div>
        )}

        {/* DVR CONFIGURATION SECTION */}
        <div className="bg-[#111] border border-zinc-800 rounded-3xl p-8 space-y-8 shadow-xl">
           <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              <h2 className="text-xl font-bold">إعدادات الـ DVR المركزية</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 mr-1 tracking-widest">عنوان IP الخاص بالـ DVR</label>
                <div className="relative group">
                  <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text"
                    value={dvrIp}
                    onChange={(e) => setDvrIp(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl pr-12 pl-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 mr-1 tracking-widest">عدد القنوات النشطة</label>
                <select
                  value={channels}
                  onChange={(e) => setChannels(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all appearance-none"
                >
                  {[1, 2, 4, 8, 16, 32].map(num => (
                    <option key={num} value={num}>{num} قنوات</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 mr-1 tracking-widest">اسم المستخدم</label>
                <input
                  type="text"
                  value={dvrUser}
                  onChange={(e) => setDvrUser(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2 mr-1 tracking-widest">كلمة المرور</label>
                <input
                  type="password"
                  value={dvrPass}
                  onChange={(e) => setDvrPass(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                  dir="ltr"
                />
              </div>
           </div>

           <div className="pt-4 flex justify-between items-center w-full">
              {dvrConfig ? (
                <button
                  onClick={handleDeleteDvr}
                  className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold px-6 py-3 rounded-xl transition-all border border-red-500/20 active:scale-95"
                >
                  <Trash2 size={18} />
                  <span>حذف البيانات</span>
                </button>
              ) : (
                <div></div>
              )}
              <button
                onClick={handleSaveDvr}
                disabled={saving || !dvrIp || !dvrUser || !dvrPass}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                <span>حفظ وتحديث النظام</span>
              </button>
           </div>
        </div>

        {/* Placeholder for future features */}
        <div className="bg-[#111] border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-xl opacity-40 grayscale select-none">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <span className="w-2 h-8 bg-zinc-600 rounded-full"></span>
              إدارة السيرفرات المتقدمة (قيد التطوير)
            </h2>
          </div>
          <p className="text-xs text-zinc-600 italic">يتم تكوين السيرفرات حالياً بشكل آلي من خلال نظام الـ DVR المركزي.</p>
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
