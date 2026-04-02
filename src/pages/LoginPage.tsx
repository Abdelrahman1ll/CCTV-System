import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  ShieldCheck,
  AlertCircle,
  Loader2,
  Globe,
  Play,
  Lock,
  User,
  Hash,
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const { setupDvr } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [serverStatus, setServerStatus] = useState<'offline' | 'online' | 'checking'>('checking');
  const [error, setError] = useState<string | null>(null);

  // Connection components
  const [cameraIp, setCameraIp] = useState("");
  const [cameraUser, setCameraUser] = useState("admin");
  const [cameraPassword, setCameraPassword] = useState("");
  const [channels, setChannels] = useState("4");

  // Check server health on load
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/config").catch(() => null);
        setServerStatus(response ? 'online' : 'offline');
      } catch (e) {
        setServerStatus('offline');
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    if (!cameraIp || !cameraUser || !cameraPassword) {
      setError("يرجى إدخال كافة البيانات المطلوبة");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      await setupDvr({
        ip: cameraIp,
        user: cameraUser,
        pass: cameraPassword,
        channels: parseInt(channels)
      });
    } catch (err: any) {
      setError(err.message || "فشل الاتصال بالـ DVR. تأكد من صحة البيانات وتشغيل السيرفر.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* FULL PAGE LOADING OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-blue-600/30 blur-[60px] rounded-full animate-pulse"></div>
            <div className="relative w-32 h-32 flex items-center justify-center">
              <Loader2 className="text-blue-500 animate-spin" size={64} strokeWidth={1.5} />
              <div className="absolute inset-x-0 bottom-0 text-[10px] font-black tracking-[0.2em] text-blue-400 text-center translate-y-12 uppercase animate-pulse">
                INITIALIZING DVR ENGINE
              </div>
            </div>
          </div>
          <div className="space-y-4 text-center max-w-sm px-6">
            <p className="text-2xl font-black text-white tracking-tight">جاري تهيئة النظام...</p>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
              يتم الآن الربط مع الـ DVR وتجهيز قنوات البث لجميع الكاميرات. يرجى الانتظار للحظات.
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden p-6 lg:p-8 animate-in fade-in zoom-in duration-700">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="group relative">
             <div className="absolute inset-0 bg-blue-600/20 blur-xl group-hover:bg-blue-600/40 transition-all rounded-full"></div>
             <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center mb-4 shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all">
                <ShieldCheck className="text-white" size={32} />
             </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">تسجيل الدخول للنظام</h1>
          <p className="text-zinc-500 text-xs font-medium">أدخل بيانات الـ DVR الخاص بك للبدء</p>
          
          {/* Server Status Badge */}
          <div className="flex items-center gap-3 mt-4">
            <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 transition-all ${
              serverStatus === 'online' 
                ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                : serverStatus === 'offline'
                ? 'bg-red-500/10 border-red-500/20 text-red-500'
                : 'bg-zinc-800 border-zinc-700 text-zinc-500'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                serverStatus === 'online' ? 'bg-green-500 animate-pulse' : serverStatus === 'offline' ? 'bg-red-500' : 'bg-zinc-600'
              }`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest">
                Server Engine {serverStatus === 'online' ? 'Connected' : serverStatus === 'offline' ? 'Disconnected' : 'Checking'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertCircle className="text-red-500 shrink-0" size={18} />
            <p className="text-xs text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Main Form */}
        <div className="space-y-4" dir="rtl">
          
          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5 mr-1 tracking-widest">عنوان IP الخاص بالـ DVR</label>
            <div className="relative group">
              <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="192.168.1.10"
                value={cameraIp}
                onChange={(e) => setCameraIp(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pr-12 pl-6 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5 mr-1 tracking-widest">المستخدم</label>
              <div className="relative group">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="admin"
                  value={cameraUser}
                  onChange={(e) => setCameraUser(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pr-12 pl-6 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all text-left font-mono"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5 mr-1 tracking-widest">كلمة السر</label>
              <div className="relative group">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="********"
                  value={cameraPassword}
                  onChange={(e) => setCameraPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pr-12 pl-6 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all text-left"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1.5 mr-1 tracking-widest">عدد الكاميرات (القنوات)</label>
            <div className="relative group">
              <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
              <select
                value={channels}
                onChange={(e) => setChannels(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pr-12 pl-6 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-white/[0.05] transition-all appearance-none"
              >
                {[1, 2, 4, 8, 16, 32].map(num => (
                  <option key={num} value={num} className="bg-zinc-900">{num} قنوات</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleConnect}
            disabled={isProcessing || !cameraIp}
            className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2 mt-4"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 text-base tracking-tight">تشغيل النظام الآن</span>
            <Play className="relative z-10 fill-current" size={18} />
          </button>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-zinc-600 font-bold text-[9px] uppercase tracking-widest flex items-center justify-center gap-2">
          <ShieldCheck size={11} />
          النظام يعمل محلياً وآمن
        </p>
      </div>
    </div>
  );
};
