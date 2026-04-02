import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { CameraFeed } from "../components/cameras/CameraFeed";
import { CalendarDays, Play, Clock, MonitorOff, X } from "lucide-react";
import { cn } from "../utils/cn";
import { TimelineSlider } from "../components/cameras/TimelineSlider";

export function PlaybackPage() {
  const { activeServer, dvrConfig } = useAuth();
  
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("12:00:00");
  
  const [playbackData, setPlaybackData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showControls, setShowControls] = useState(false);

  const cameras = activeServer?.cameras || [];

  useEffect(() => {
    if (cameras.length > 0 && !selectedCameraId) {
      setSelectedCameraId(cameras[0].id);
    }
  }, [cameras, selectedCameraId]);

  const handlePlay = async (overrideTime?: string) => {
    if (!dvrConfig) {
      setError("إعدادات الـ DVR غير متوفرة. الرجاء التأكد من إضافة سيرفر عبر DVR لتشغيل النظام المركزي.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setPlaybackData(null);
    
    // Extracted channel number
    const channelMatch = selectedCameraId.match(/\d+/);
    const channel = channelMatch ? parseInt(channelMatch[0], 10) : 1;
    
    // Ensure accurate seek time
    const targetTime = overrideTime || time;
    const timeParam = targetTime + (targetTime.split(':').length === 2 ? ":00" : "");

    try {
      const response = await fetch("http://localhost:3000/api/playback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: dvrConfig.ip,
          user: dvrConfig.user,
          pass: dvrConfig.pass,
          channel: channel,
          date: date,
          time: timeParam
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setPlaybackData(result.camera);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message || "فشل الاتصال بسيرفر إعادة التشغيل");
    } finally {
      setIsLoading(false);
      // Auto-hide controls on mobile after hitting play if it succeeded (or even if it failed, to see the error)
      if (window.innerWidth < 1024 && dvrConfig) {
        setShowControls(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full bg-[#0a0a0a] overflow-hidden relative">
      
      {/* Mobile Drawer Overlay */}
      {showControls && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 z-30" 
          onClick={() => setShowControls(false)}
        />
      )}

      {/* Right Controls Panel (RTL) */}
      <div 
        className={cn(
          "w-full lg:w-80 bg-[#111] border-l border-zinc-800 p-4 md:p-6 flex flex-col gap-6 overflow-y-auto scrollbar-hide shrink-0 order-first lg:order-last",
          "fixed lg:static inset-y-0 right-0 top-0 bottom-0 z-40 max-w-[85vw] transition-transform duration-300",
          showControls ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
        dir="rtl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="text-blue-500" /> بحث التسجيلات
          </h2>
          <button 
            onClick={() => setShowControls(false)}
            className="lg:hidden p-2 hover:bg-zinc-800 text-zinc-400 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-zinc-400 mb-2">الكاميرا</label>
            <select 
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
            >
              {cameras.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              {cameras.length === 0 && <option value="">لا توجد كاميرات</option>}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-zinc-400 mb-2">التاريخ</label>
            <div className="relative">
              <input 
                type="date"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-zinc-400 mb-2">الوقت (صيغة 24 ساعة)</label>
            <div className="relative flex items-center">
              <Clock className="absolute right-4 text-zinc-500 pointer-events-none" size={16} />
              <input 
                type="time"
                step="1"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pr-10 pl-4 py-3 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ colorScheme: 'dark' }}
                dir="ltr"
              />
            </div>
          </div>
          
          <button 
            onClick={() => handlePlay()}
            disabled={isLoading || !dvrConfig || cameras.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-all mt-6 active:scale-[0.98] shadow-lg shadow-blue-600/20"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Play size={18} fill="currentColor" /> جلب التسجيل
              </>
            )}
          </button>

          <p className="text-[11px] text-zinc-500 text-center !mt-4 leading-relaxed px-2">
            يتم الاتصال بقاعدة بيانات الـ DVR لاستخراج ملفات الفيديو المطلوبة، قد يستغرق الاتصال بضع ثوانٍ.
          </p>
        </div>
      </div>

      {/* Main Playback View */}
      <div className="flex-1 p-2 pt-14 md:p-6 lg:p-10 flex flex-col items-center overflow-y-auto scrollbar-hide bg-[#0a0a0a] w-full">
        
        {/* Mobile FAB to open controls */}
        <button 
          onClick={() => setShowControls(true)}
          className="lg:hidden absolute top-4 right-4 z-20 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center gap-2 transition-transform active:scale-95"
        >
          <CalendarDays size={18} /> 
          <span className="font-bold text-sm tracking-wide">خيارات البحث</span>
        </button>

        {playbackData ? (
          <div className="w-full max-w-5xl flex flex-col gap-2 items-center animate-in zoom-in-95 duration-500">
            <div className="w-full aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-blue-900/40 bg-black flex items-center justify-center relative">
               <CameraFeed {...playbackData} />
            </div>
            
            {/* 24-Hour Timeline Scrubbing Bar */}
            <TimelineSlider 
              time={time} 
              setTime={setTime} 
              onSeek={(t) => handlePlay(t)} 
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center text-zinc-600 opacity-60 p-8 md:p-12 text-center border-2 border-dashed border-zinc-800 rounded-3xl animate-in fade-in duration-700 max-w-md bg-zinc-900/10 mt-10 lg:mt-20">
             <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
               <MonitorOff size={32} className="opacity-50" />
             </div>
             <h2 className="text-xl font-bold mb-3 text-zinc-300">نافذة مشاهدة التسجيلات</h2>
             <p className="text-sm leading-relaxed">
               استخدم القائمة الجانبية لتحديد الكاميرا المطلوبة واختيار التاريخ والوقت الدقيق (بالساعات والدقائق) لبدء تشغيل التسجيل المُخزَّن بالخادم.
             </p>
          </div>
        )}
      </div>
      
    </div>
  );
}
