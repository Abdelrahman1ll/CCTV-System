import React, { useState, useCallback, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  X,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Camera,
  LogIn,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface ServerConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServerConnectionModal: React.FC<ServerConnectionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { loginViaQR } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [serverHost, setServerHost] = useState("");
  const [serverPort, setServerPort] = useState("3000");
  const [serverName, setServerName] = useState("");
  const [manualCode, setManualCode] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = async (host: string, port: string, code: string, name?: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      await loginViaQR(host, parseInt(port), code, name);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const processDecodedText = useCallback(
    async (decodedText: string) => {
      try {
        const data = JSON.parse(decodedText);
        if (data.host && data.port && data.code) {
          setServerHost(data.host);
          setServerPort(String(data.port));
          setManualCode(data.code);
          if (data.name) setServerName(data.name);
          await handleLogin(data.host, String(data.port), data.code, data.name);
          return;
        }
      } catch (e) {}
      await handleLogin(serverHost, serverPort, decodedText, serverName);
    },
    [serverHost, serverPort, serverName, loginViaQR]
  );

  const handleImageFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setError(null);
      const tempId = "qr-file-reader-modal";
      let tempElem = document.getElementById(tempId);
      if (!tempElem) {
        tempElem = document.createElement("div");
        tempElem.id = tempId;
        tempElem.style.display = "none";
        document.body.appendChild(tempElem);
      }
      try {
        const html5QrCode = new Html5Qrcode(tempId);
        const decodedText = await html5QrCode.scanFile(file, false);
        await processDecodedText(decodedText);
        html5QrCode.clear();
      } catch (err: any) {
        setError("لم نتمكن من العثور على رمز QR.");
      } finally {
        setIsProcessing(false);
        const el = document.getElementById(tempId);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }
    },
    [processDecodedText],
  );

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {}
      html5QrCodeRef.current = null;
    }
    setShowScanner(false);
  }, []);

  const startScanner = useCallback(async () => {
    setShowScanner(true);
    setError(null);
    setTimeout(async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) throw new Error("No camera");
        const html5QrCode = new Html5Qrcode("modal-reader");
        html5QrCodeRef.current = html5QrCode;
        const config = { fps: 20, qrbox: { width: 200, height: 200 } };
        await html5QrCode.start(devices[0].id, config, async (decodedText) => {
          await processDecodedText(decodedText);
          stopScanner();
        }, () => {});
      } catch (err) {
        setError("تعذر تشغيل الكاميرا.");
        setShowScanner(false);
      }
    }, 100);
  }, [processDecodedText, stopScanner]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#111] border border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full z-10 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <ShieldCheck className="text-blue-500" size={24} />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">اتصال بسيرفر جديد</h2>
          </div>

          {!showScanner ? (
            <div className="space-y-4" dir="rtl">
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle size={16} className="text-red-500 mt-0.5" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 mr-1">اسم السيرفر (اختياري)</label>
                  <input
                    type="text"
                    placeholder="مثل: البيت، العمل..."
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 mr-1">الرابط (IP/Host)</label>
                    <input
                      type="text"
                      placeholder="192.168.1.100"
                      value={serverHost}
                      onChange={(e) => setServerHost(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 mr-1">المنفذ</label>
                    <input
                      type="text"
                      placeholder="3000"
                      value={serverPort}
                      onChange={(e) => setServerPort(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1.5 mr-1">كود المزامنة (Code)</label>
                  <input
                    type="password"
                    placeholder="أدخل الرمز..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                onClick={() => handleLogin(serverHost, serverPort, manualCode, serverName)}
                disabled={isProcessing || !manualCode || !serverHost}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-30 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><LogIn size={18} /><span>اتصال</span></>}
              </button>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={startScanner}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 text-zinc-400 hover:text-blue-400 py-3 rounded-xl transition-all"
                >
                  <Camera size={18} />
                  <span className="text-xs font-bold">كاميرا</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 text-zinc-400 hover:text-blue-400 py-3 rounded-xl transition-all"
                >
                  <ImageIcon size={18} />
                  <span className="text-xs font-bold">صورة</span>
                </button>
              </div>
              <input type="file" ref={fileInputRef} onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) handleImageFile(files[0]);
              }} accept="image/*" className="hidden" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-blue-600/30 bg-black">
                <div id="modal-reader" className="w-full h-full"></div>
              </div>
              <button
                onClick={stopScanner}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-xl transition-colors font-bold text-sm"
              >
                إلغاء والعودة
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
