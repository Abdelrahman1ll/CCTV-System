import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  ShieldCheck,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Camera,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export const LoginPage: React.FC = () => {
  const { loginViaQR } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleImageFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setError(null);
      setIsDragging(false);
      dragCounter.current = 0;

      // Create a temporary element for Html5Qrcode
      const tempId = "qr-file-reader";
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
        loginViaQR(decodedText);
        html5QrCode.clear();
      } catch (err) {
        console.error("QR Scan Error:", err);
        setError(
          "لم نتمكن من العثور على رمز QR في هذه الصورة. يرجى التأكد من وضوح الصورة.",
        );
      } finally {
        setIsProcessing(false);
        const el = document.getElementById(tempId);
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      }
    },
    [loginViaQR],
  );

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  };

  // Handle Paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) handleImageFile(file);
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleImageFile]);

  // Handle Drag & Drop
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        handleImageFile(file);
      } else {
        setError("يرجى سحب وإفلات صورة صالحة فقط.");
      }
    }
  };

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
      html5QrCodeRef.current = null;
    }
    setShowScanner(false);
  }, []);

  const startScanner = useCallback(async () => {
    setShowScanner(true);
    setError(null);

    // Wait for the DOM element to be available
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        html5QrCodeRef.current = html5QrCode;

        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            loginViaQR(decodedText);
            stopScanner();
          },
          () => {
            // Silently handle scan errors
          },
        );
      } catch (err: any) {
        console.error("Camera Start Error:", err);
        setError("تعذر تشغيل الكاميرا. يرجى التأكد من منح الإذن.");
        setShowScanner(false);
      }
    }, 100);
  }, [loginViaQR, stopScanner]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current?.isScanning) {
        html5QrCodeRef.current.stop();
      }
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Drop Zone Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[2px] z-50 flex items-center justify-center border-4 border-dashed border-blue-500 m-4 rounded-3xl animate-in fade-in duration-200 pointer-events-none">
          <div className="flex flex-col items-center gap-4 bg-[#111111]/90 p-8 rounded-2xl border border-blue-500/30 shadow-2xl scale-110 transition-transform">
            <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center animate-bounce">
              <ImageIcon className="text-blue-500" size={40} />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-1">
                أفلت الصورة هنا
              </h2>
              <p className="text-zinc-400 text-sm">
                سيتم التعرف على كود QR تلقائياً
              </p>
            </div>
          </div>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        accept="image/*"
        className="hidden"
      />

      <div className="w-full max-w-sm bg-[#111111] border border-zinc-800 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-6">
            <ShieldCheck className="text-blue-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            CCTV System
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            اختر طريقة المزامنة للدخول للنظام
          </p>
        </div>

        {!showScanner ? (
          <div className="space-y-4">
            {/* Scan via Camera */}
            <button
              type="button"
              onClick={startScanner}
              className="w-full flex items-center gap-4 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] group"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Camera size={20} />
              </div>
              <div className="text-right">
                <span className="block font-bold">مسح عبر الكاميرا</span>
                <span className="text-[10px] opacity-80 uppercase tracking-wider">
                  Live Scanner
                </span>
              </div>
            </button>

            {/* Choose Image */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full relative flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-100 rounded-xl transition-all active:scale-[0.98] group overflow-hidden"
            >
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 transition-opacity">
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                </div>
              )}
              <div className="w-10 h-10 rounded-lg bg-zinc-800 group-hover:bg-zinc-750 flex items-center justify-center">
                <ImageIcon size={20} className="text-zinc-400" />
              </div>
              <div className="text-right">
                <span className="block font-bold">اختيار صورة الكود</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  Gallery / File
                </span>
              </div>
            </button>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-top-1 duration-200">
                <AlertCircle
                  size={16}
                  className="text-red-500 shrink-0 mt-0.5"
                />
                <p className="text-xs text-red-400 leading-relaxed font-medium">
                  {error}
                </p>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <AlertCircle
                size={18}
                className="text-zinc-500 shrink-0 mt-0.5"
              />
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                يمكنك أيضاً سحب الصورة وإفلاتها هنا أو لصقها (Paste) مباشرة من
                الحافظة.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-xl border-2 border-blue-600/30 bg-black">
              <div id="reader" className="w-full h-full"></div>
              {/* Overlays for scanner feel */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-40 border-black/40"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500/50 rounded-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
                </div>
              </div>
            </div>
            <button
              onClick={stopScanner}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-xl transition-colors font-medium border border-zinc-700"
            >
              إلغاء المسح
            </button>
          </div>
        )}

        <p className="text-center text-zinc-700 text-[10px] mt-10 uppercase tracking-widest font-bold">
          Secure Encrypted Session
        </p>
      </div>
    </div>
  );
};
