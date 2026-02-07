import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/CCTV-System/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 font-sans text-zinc-100">
          <div className="max-w-md w-full relative group">
            {/* Glassmorphic Background Card */}
            <div className="absolute -inset-1 bg-linear-to-r from-red-600 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    System Interruption
                  </h1>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    An unexpected error has occurred within the monitoring
                    dashboard. We've logged the incident.
                  </p>
                </div>

                {this.state.error && (
                  <div className="w-full bg-black/40 rounded-lg p-3 border border-white/5 overflow-hidden">
                    <p className="text-[10px] font-mono text-red-400 text-left line-clamp-2">
                      {this.state.error.toString()}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 w-full pt-2">
                  <button
                    onClick={this.handleReset}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all active:scale-95 text-sm font-medium cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                  <button
                    onClick={this.handleGoHome}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all active:scale-95 text-sm font-medium shadow-lg shadow-blue-600/20 cursor-pointer"
                  >
                    <Home className="w-4 h-4" />
                    Home
                  </button>
                </div>

                <p className="text-[10px] text-zinc-500 uppercase tracking-widest pt-4">
                  CCTV Security System v1.0.4
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
