export default function WaveBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Layer 1 — Deep navy, slowest */}
      <div className="absolute bottom-0 left-0 w-[200%] h-[45%] animate-wave-slow">
        <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 400">
          <path
            fill="rgba(30,58,95,0.06)"
            d="M0,200 C120,120 240,280 360,200 C480,120 600,280 720,200 C840,120 960,280 1080,200 C1200,120 1320,280 1440,200 L1440,400 L0,400 Z"
          />
        </svg>
      </div>

      {/* Layer 2 — Brand mid, slow */}
      <div className="absolute bottom-0 left-0 w-[200%] h-[40%] animate-wave-medium">
        <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 400">
          <path
            fill="rgba(30,58,95,0.08)"
            d="M0,160 C100,240 200,80 360,160 C520,240 640,80 720,160 C800,240 960,80 1080,160 C1200,240 1320,80 1440,160 L1440,400 L0,400 Z"
          />
        </svg>
      </div>

      {/* Layer 3 — Accent green, medium */}
      <div className="absolute bottom-0 left-0 w-[200%] h-[35%] animate-wave-fast">
        <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 400">
          <path
            fill="rgba(5,150,105,0.07)"
            d="M0,180 C180,100 300,260 480,180 C660,100 780,260 960,180 C1140,100 1260,260 1440,180 L1440,400 L0,400 Z"
          />
        </svg>
      </div>

      {/* Layer 4 — Light accent, fastest, ripples */}
      <div className="absolute bottom-0 left-0 w-[200%] h-[30%] animate-wave-faster">
        <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 400">
          <path
            fill="rgba(5,150,105,0.05)"
            d="M0,200 C150,280 300,120 450,200 C600,280 750,120 900,200 C1050,280 1200,120 1350,200 L1440,190 L1440,400 L0,400 Z"
          />
        </svg>
      </div>
    </div>
  )
}
