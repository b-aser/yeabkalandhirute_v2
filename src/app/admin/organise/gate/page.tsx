'use client';
import { useState, useRef, useEffect, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/integrations/api/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, XCircle, ScanLine, Keyboard, Users, ArrowBigLeft, ArrowLeft } from "lucide-react";
import { FaBackward } from "react-icons/fa";

type CheckInResult = {
  authorized: boolean;
  guest?: { id: string; name: string; plus_ones_allowed: number; family_count: number; checked_in_at: string };
  error?: string;
};

export default function GateDashboard() {
  const { activeWeddingId } = useAuth();
  const qc = useQueryClient();
  const wid = activeWeddingId ?? "";

  const [code, setCode] = useState("");
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [mode, setMode] = useState<"code" | "camera">("code");
  const codeInputRef = useRef<HTMLInputElement>(null);

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ["gate-stats", wid],
    queryFn: () => apiClient.getGateStats(wid),
    enabled: !!wid,
    refetchInterval: 3000,
  });

  const { data: recent = [], refetch: refetchRecent } = useQuery({
    queryKey: ["gate-recent", wid],
    queryFn: () => apiClient.getRecentCheckIns(wid),
    enabled: !!wid,
    refetchInterval: 15000,
  });

  const checkInMutation = useMutation({
    mutationFn: ({ entrance_code, method }: { entrance_code: string; method: "code_entry" | "qr_scan" }) =>
      apiClient.checkInGuest(wid, entrance_code, method),
    onSuccess: (result: any) => {
      setLastResult(result);
      if (result.authorized) {
        toast.success(`✓ Welcome, ${result.guest.name}!`);
      } else {
        toast.error(result.error ?? "Access denied");
      }
      refetchStats();
      refetchRecent();
      setCode("");
      codeInputRef.current?.focus();
    },
    onError: (e: Error) => {
      setLastResult({ authorized: false, error: e.message });
      toast.error(e.message);
      setCode("");
      codeInputRef.current?.focus();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    checkInMutation.mutate({ entrance_code: code.trim(), method: "code_entry" });
  };

  // Auto-focus code input on mount
  useEffect(() => { codeInputRef.current?.focus(); }, []);

  // Clear result after 6 seconds
  useEffect(() => {
    if (!lastResult) return;
    const t = setTimeout(() => setLastResult(null), 6000);
    return () => clearTimeout(t);
  }, [lastResult]);

  if (!wid) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">
      No wedding selected.
    </div>
  );

  const s = stats as any;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <a href="/admin/organise" className="flex my-4 gap-4 text-xl items-center font-serif"><ArrowLeft/> Back</a>
        <div className="flex items-center gap-3 mb-8">
          <ScanLine className="w-7 h-7 text-amber-400" />
          <h1 className="text-2xl font-bold tracking-tight">Gate Authentication</h1>
        </div>

        {/* Stats */}
        {s && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Checked In", value: s.checked_in, color: "text-green-400" },
              { label: "Expected", value: s.confirmed_yes, color: "text-blue-400" },
              { label: "Total Guests", value: s.total, color: "text-gray-300" },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-800 rounded-xl p-5 text-center border border-gray-700">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value ?? "—"}</p>
                <p className="text-xs uppercase tracking-widest text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Check-in result */}
        {lastResult && (
          <div className={`rounded-xl p-5 mb-6 flex items-center gap-4 border ${
            lastResult.authorized
              ? "bg-green-950 border-green-700"
              : "bg-red-950 border-red-700"
          }`}>
            {lastResult.authorized
              ? <CheckCircle className="w-8 h-8 text-green-400 shrink-0" />
              : <XCircle className="w-8 h-8 text-red-400 shrink-0" />}
            <div>
              {lastResult.authorized ? (
                <>
                  <p className="text-green-300 font-bold text-lg">Access Granted</p>
                  <p className="text-green-200">{lastResult.guest?.name}</p>
                  {(lastResult.guest?.plus_ones_allowed ?? 0) > 0 && (
                    <p className="text-green-400 text-sm">+{lastResult.guest?.plus_ones_allowed} plus-one(s) authorized</p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-red-300 font-bold text-lg">Access Denied</p>
                  <p className="text-red-200 text-sm">{lastResult.error}</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "code" ? "bg-amber-500 text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            onClick={() => setMode("code")}>
            <Keyboard className="w-4 h-4" /> Enter Code
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "camera" ? "bg-amber-500 text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            onClick={() => setMode("camera")}>
            <ScanLine className="w-4 h-4" /> Scan QR
          </button>
        </div>

        {mode === "code" ? (
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
            <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2">Entrance Code</label>
            <div className="flex gap-3">
              <Input
                ref={codeInputRef}
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. WXYZ1234"
                className="bg-gray-900 border-gray-600 text-white font-mono text-xl tracking-widest placeholder:text-gray-600 uppercase"
                maxLength={8}
                autoComplete="off"
              />
              <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6"
                disabled={!code.trim() || checkInMutation.isPending}>
                {checkInMutation.isPending ? "…" : "Check In"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6 text-center">
            <p className="text-gray-400 text-sm mb-3">
              Point the camera at the guest's QR code. The code will be scanned automatically.
            </p>
            <QRScannerCamera weddingId={wid} onScan={(code) => {
              checkInMutation.mutate({ entrance_code: code, method: "qr_scan" });
            }} />
          </div>
        )}

        {/* Recent check-ins */}
        {(recent as any[]).length > 0 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700">
              <Users className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-300">Recent Check-ins</h2>
            </div>
            <div className="divide-y divide-gray-700 max-h-64 overflow-y-auto">
              {(recent as any[]).map((g: any) => (
                <div key={g.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium text-white">{g.name}</p>
                    <p className="text-xs text-gray-400">
                      {g.check_in_method === "qr_scan" ? "QR scan" : "Code entry"} ·{" "}
                      {new Date(g.checked_in_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline QR camera scanner using jsQR (if available) or instructions
function QRScannerCamera({ weddingId, onScan }: { weddingId: string; onScan: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setActive(true);
        setError(null);
        scanLoop(stream);
      }
    } catch {
      setError("Camera access denied or not available. Use code entry instead.");
    }
  };

  const scanLoop = (stream: MediaStream) => {
    const tick = async () => {
      if (!videoRef.current || !canvasRef.current || !stream.active) return;
      const video = videoRef.current;
      if (video.readyState !== video.HAVE_ENOUGH_DATA) { requestAnimationFrame(tick); return; }
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Dynamically import jsQR if available
      try {
        const jsQR = (await import("jsqr" as any)).default;
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) {
          stream.getTracks().forEach(t => t.stop());
          setActive(false);
          onScan(code.data);
          return;
        }
      } catch {
        // jsQR not installed — show message
        setError("QR scanning requires the jsqr package. Use code entry for now.");
        stream.getTracks().forEach(t => t.stop());
        setActive(false);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  useEffect(() => () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  }, []);

  return (
    <div>
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
      {!active && !error && (
        <Button onClick={startCamera} className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
          Start Camera
        </Button>
      )}
      <video ref={videoRef} className={`rounded-lg mx-auto mt-3 ${active ? "block" : "hidden"}`}
        style={{ maxWidth: 320, maxHeight: 240 }} playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
