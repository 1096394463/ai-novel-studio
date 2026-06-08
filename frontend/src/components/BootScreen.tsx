import { useState, useEffect } from "react";

interface BootScreenProps {
  onReady: () => void;
}

const TIPS = [
  "正在准备笔墨纸砚…",
  "正在研磨墨汁…",
  "正在铺展宣纸…",
  "灵感正在酝酿…",
  "文思即将涌来…",
];

export function BootScreen({ onReady }: BootScreenProps) {
  const [dots, setDots] = useState("");
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<"starting" | "waiting" | "ready">("starting");

  // Animated dots
  useEffect(() => {
    const timer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Rotate tips
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Health check polling
  useEffect(() => {
    let retries = 0;
    const maxRetries = 60;

    const check = async () => {
      try {
        const res = await fetch("http://localhost:18080/api/health");
        if (res.ok) {
          const data = await res.json();
          if (data.status === "UP") {
            setStatus("ready");
            setTimeout(onReady, 800);
            return;
          }
        }
      } catch {
        // Backend not ready yet
      }

      retries++;
      if (retries >= maxRetries) {
        setStatus("waiting");
      }

      setTimeout(check, 1000);
    };

    // Small delay to let the backend process start
    setTimeout(check, 2000);
  }, [onReady]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f0e8 0%, #e8e0d0 50%, #d4c8b0 100%)",
        fontFamily: "'Noto Serif SC', 'Songti SC', 'SimSun', serif",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      {/* Decorative ink splashes */}
      <div style={{ position: "absolute", top: 40, left: 60, opacity: 0.08 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="#1a1a2e" />
          <circle cx="80" cy="40" r="20" fill="#1a1a2e" />
        </svg>
      </div>
      <div style={{ position: "absolute", bottom: 60, right: 80, opacity: 0.06 }}>
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="60" fill="#1a1a2e" />
        </svg>
      </div>

      {/* Main content */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* App icon - ink wash mountains */}
        <div style={{ marginBottom: 24 }}>
          <svg width="120" height="120" viewBox="0 0 512 512" style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.1))" }}>
            <rect width="512" height="512" rx="80" ry="80" fill="#f5f0e8" />
            <g opacity="0.25">
              <path d="M 40 380 Q 100 250 160 300 Q 200 200 260 280 Q 300 180 360 260 Q 400 200 470 350" fill="#2d2d44" />
            </g>
            <g opacity="0.45">
              <path d="M 30 400 Q 80 280 140 330 Q 180 240 230 310 Q 270 220 320 290 Q 370 230 420 320 Q 450 270 482 380" fill="#1a1a2e" />
            </g>
            <g opacity="0.7">
              <path d="M 50 420 Q 120 310 180 360 Q 230 280 280 340 Q 340 260 400 330 Q 440 290 480 400 L 482 420 Z" fill="#1a1a2e" />
            </g>
            <g transform="translate(256, 200) rotate(-15)">
              <rect x="-8" y="-80" width="16" height="120" rx="4" fill="#3d2b1f" opacity="0.85" />
              <path d="M -8 40 Q 0 100 8 40" fill="#1a1a2e" />
            </g>
            <g transform="translate(380, 140)" opacity="0.6">
              <text fontFamily="serif" fontSize="72" fill="#1a1a2e" fontWeight="bold">文</text>
            </g>
            <g transform="translate(390, 350)">
              <rect x="-28" y="-28" width="56" height="56" rx="4" fill="#c0392b" opacity="0.85" />
              <text x="0" y="8" fontFamily="serif" fontSize="32" fill="#f5f0e8" textAnchor="middle" fontWeight="bold">作</text>
            </g>
          </svg>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#1a1a2e",
            margin: "0 0 8px 0",
            letterSpacing: "0.1em",
          }}
        >
          AI Novel Studio
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "#6b5b4b",
            margin: "0 0 40px 0",
            letterSpacing: "0.2em",
          }}
        >
          水墨丹青 · 笔下生花
        </p>

        {/* Loading bar */}
        <div
          style={{
            width: 280,
            height: 3,
            background: "rgba(26, 26, 46, 0.1)",
            borderRadius: 2,
            overflow: "hidden",
            margin: "0 auto 20px",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #1a1a2e, #4a4a5a)",
              borderRadius: 2,
              animation: "boot-progress 2s ease-in-out infinite",
              width: status === "ready" ? "100%" : "60%",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        {/* Status text */}
        <p
          style={{
            fontSize: 13,
            color: "#8b7b6b",
            margin: 0,
            minHeight: 20,
          }}
        >
          {status === "ready"
            ? "✅ 准备就绪"
            : status === "waiting"
            ? `⏳ 后端服务启动中${dots}（已等待 ${elapsed}s）`
            : `${TIPS[tipIndex]}${dots}`}
        </p>

        {elapsed > 15 && status !== "ready" && (
          <p
            style={{
              fontSize: 11,
              color: "#ab9b8b",
              marginTop: 8,
            }}
          >
            首次启动可能需要较长时间，请耐心等待…
          </p>
        )}
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes boot-progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
