"use client";

// Shared Survivor-themed left panel used on the login and sign-up pages.

const STARS = [
  { x: 32,  y: 22,  r: 1.1, cls: "star-0" },
  { x: 88,  y: 14,  r: 0.8, cls: "star-1" },
  { x: 140, y: 35,  r: 1.3, cls: "star-2" },
  { x: 210, y: 18,  r: 0.7, cls: "star-0" },
  { x: 260, y: 42,  r: 1.0, cls: "star-1" },
  { x: 55,  y: 55,  r: 0.9, cls: "star-2" },
  { x: 110, y: 68,  r: 0.7, cls: "star-0" },
  { x: 175, y: 58,  r: 1.2, cls: "star-1" },
  { x: 230, y: 72,  r: 0.8, cls: "star-2" },
  { x: 300, y: 30,  r: 1.0, cls: "star-0" },
  { x: 350, y: 55,  r: 0.7, cls: "star-1" },
  { x: 18,  y: 88,  r: 1.1, cls: "star-2" },
  { x: 78,  y: 102, r: 0.8, cls: "star-0" },
  { x: 155, y: 92,  r: 0.9, cls: "star-1" },
  { x: 280, y: 85,  r: 1.2, cls: "star-2" },
  { x: 320, y: 100, r: 0.7, cls: "star-0" },
  { x: 370, y: 78,  r: 1.0, cls: "star-1" },
  { x: 42,  y: 125, r: 0.8, cls: "star-2" },
  { x: 195, y: 118, r: 1.1, cls: "star-0" },
  { x: 340, y: 130, r: 0.9, cls: "star-1" },
];

function SurvivorScene() {
  return (
    <svg
      viewBox="0 0 400 650"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="torchGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="jungleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d2a1a" />
          <stop offset="100%" stopColor="#020c06" />
        </linearGradient>
        <linearGradient id="torchHandleGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6b4423" />
          <stop offset="50%" stopColor="#8b5e34" />
          <stop offset="100%" stopColor="#5c3d1e" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="400" height="650" fill="#050e1a" />
      <rect width="400" height="350" fill="#081628" opacity="0.6" />

      {/* Stars */}
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity="0.85" className={s.cls} />
      ))}

      {/* Moon */}
      <circle cx="318" cy="62" r="38" fill="#fef9c3" opacity="0.12" />
      <circle cx="318" cy="62" r="26" fill="#fef9c3" opacity="0.9" />
      <circle cx="330" cy="54" r="21" fill="#0a1628" />

      {/* Torch ambient glow */}
      <ellipse cx="200" cy="230" rx="90" ry="75" fill="url(#torchGlow)" className="torch-glow" />

      {/* Torch handle */}
      <rect x="193" y="305" width="14" height="145" rx="5" fill="url(#torchHandleGrad)" />
      <rect x="191" y="318" width="18" height="5" rx="2" fill="#3b2009" opacity="0.8" />
      <rect x="191" y="334" width="18" height="5" rx="2" fill="#3b2009" opacity="0.8" />
      <rect x="191" y="350" width="18" height="5" rx="2" fill="#3b2009" opacity="0.8" />
      <rect x="191" y="366" width="18" height="5" rx="2" fill="#3b2009" opacity="0.8" />
      {/* Basket */}
      <path d="M181,305 Q176,278 200,265 Q224,278 219,305 Z" fill="#7c4f28" />
      <path d="M184,305 Q183,285 200,276 Q217,285 216,305 Z" fill="#5c3d1e" />
      <path d="M187,300 Q187,288 200,282 Q213,288 213,300 Z" fill="#c2692a" opacity="0.6" />

      {/* Flame layers */}
      <path d="M200,298 Q162,255 168,198 Q172,162 183,130 Q189,108 200,82 Q211,108 217,130 Q228,162 232,198 Q238,255 200,298 Z" fill="#c2410c" className="flame-outer" />
      <path d="M200,294 Q167,258 173,208 Q177,175 187,148 Q193,128 200,105 Q207,128 213,148 Q223,175 227,208 Q233,258 200,294 Z" fill="#ea580c" className="flame-mid" />
      <path d="M200,288 Q172,258 177,218 Q181,190 190,165 Q195,148 200,128 Q205,148 210,165 Q219,190 223,218 Q228,258 200,288 Z" fill="#f97316" className="flame-inner" />
      <path d="M200,278 Q180,252 184,222 Q187,200 194,178 Q197,164 200,148 Q203,164 206,178 Q213,200 216,222 Q220,252 200,278 Z" fill="#fb923c" className="flame-core" />
      <path d="M200,265 Q184,243 187,218 Q190,200 196,182 Q198,170 200,156 Q202,170 204,182 Q210,200 213,218 Q216,243 200,265 Z" fill="#fbbf24" className="flame-tip" />
      <path d="M200,245 Q191,226 193,208 Q196,192 200,178 Q204,192 207,208 Q209,226 200,245 Z" fill="#fef9c3" opacity="0.9" className="flame-white" />

      {/* Sparks */}
      <circle cx="194" cy="165" r="2.2" fill="#fcd34d" className="spark spark-1" />
      <circle cx="207" cy="148" r="1.8" fill="#fb923c" className="spark spark-2" />
      <circle cx="183" cy="188" r="1.6" fill="#fef08a" className="spark spark-3" />
      <circle cx="218" cy="175" r="1.4" fill="#fcd34d" className="spark spark-4" />
      <circle cx="200" cy="135" r="1.5" fill="#fdba74" className="spark spark-5" />

      {/* Left palm tree */}
      <g className="palm-left" style={{ transformOrigin: "65px 650px" }}>
        <path d="M55,650 Q60,570 72,490 Q80,445 92,400" stroke="#163d16" strokeWidth="11" fill="none" strokeLinecap="round" />
        <path d="M92,400 Q38,372 8,388"    stroke="#1a5c1a" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M92,400 Q65,355 42,340"   stroke="#1a5c1a" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M92,400 Q98,350 88,322"   stroke="#1a5c1a" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M92,400 Q125,368 148,372" stroke="#1a5c1a" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M92,400 Q118,408 142,388" stroke="#1a5c1a" strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="8"   cy="388" rx="26" ry="9" fill="#1a5c1a" transform="rotate(-8,8,388)" />
        <ellipse cx="42"  cy="340" rx="24" ry="8" fill="#1a5c1a" transform="rotate(-32,42,340)" />
        <ellipse cx="88"  cy="322" rx="22" ry="8" fill="#1a5c1a" transform="rotate(-82,88,322)" />
        <ellipse cx="148" cy="372" rx="24" ry="8" fill="#1a5c1a" transform="rotate(12,148,372)" />
        <ellipse cx="142" cy="388" rx="20" ry="7" fill="#1a5c1a" transform="rotate(22,142,388)" />
      </g>

      {/* Right palm tree */}
      <g className="palm-right" style={{ transformOrigin: "338px 650px" }}>
        <path d="M345,650 Q342,568 333,488 Q325,442 312,398" stroke="#163d16" strokeWidth="11" fill="none" strokeLinecap="round" />
        <path d="M312,398 Q362,366 396,380" stroke="#1a5c1a" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M312,398 Q332,352 355,340" stroke="#1a5c1a" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M312,398 Q298,350 306,320" stroke="#1a5c1a" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M312,398 Q275,370 252,375" stroke="#1a5c1a" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M312,398 Q286,408 262,390" stroke="#1a5c1a" strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="396" cy="380" rx="26" ry="9" fill="#1a5c1a" transform="rotate(7,396,380)" />
        <ellipse cx="355" cy="340" rx="24" ry="8" fill="#1a5c1a" transform="rotate(28,355,340)" />
        <ellipse cx="306" cy="320" rx="22" ry="8" fill="#1a5c1a" transform="rotate(-78,306,320)" />
        <ellipse cx="252" cy="375" rx="24" ry="8" fill="#1a5c1a" transform="rotate(-14,252,375)" />
        <ellipse cx="262" cy="390" rx="20" ry="7" fill="#1a5c1a" transform="rotate(-25,262,390)" />
      </g>

      {/* Island / jungle silhouette */}
      <path d="M0,555 Q40,518 95,528 Q148,538 172,508 Q198,480 228,496 Q258,512 290,490 Q318,470 360,485 Q382,494 400,475 L400,650 L0,650 Z" fill="url(#jungleGrad)" />
      <path d="M0,615 Q80,600 160,608 Q240,616 320,605 Q360,600 400,610 L400,650 L0,650 Z" fill="#020c06" />
      <path d="M0,628 Q50,622 100,626 Q160,630 220,624 Q280,618 340,624 Q370,627 400,622" stroke="#1a4060" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M20,638 Q80,632 150,636 Q230,640 300,634 Q350,630 400,636" stroke="#1a4060" strokeWidth="1.5" fill="none" opacity="0.35" />
    </svg>
  );
}

/** The full left-side visual panel. Drop this into any auth page layout. */
export function SurvivorAuthPanel() {
  return (
    <div
      className="hidden lg:block w-[55%] relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#050e1a 0%,#071630 50%,#0a1f10 100%)" }}
    >
      <SurvivorScene />

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col justify-between px-10 py-10 z-10">
        <span className="text-xs font-bold tracking-[0.3em] text-orange-400 uppercase">
          Season 50 · Fantasy Draft
        </span>

        <div className="text-center">
          <h1
            className="text-7xl font-black tracking-tight text-white leading-none"
            style={{ textShadow: "0 0 50px rgba(249,115,22,0.7), 0 0 15px rgba(249,115,22,0.4), 0 3px 6px rgba(0,0,0,0.9)" }}
          >
            SURVIVOR
          </h1>
          <p
            className="mt-3 text-sm font-semibold tracking-[0.5em] text-orange-300 uppercase"
            style={{ textShadow: "0 0 20px rgba(249,115,22,0.5)" }}
          >
            Outwit &bull; Outplay &bull; Outlast
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-orange-500 opacity-30" />
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-50" />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-orange-500 opacity-30" />
        </div>
      </div>
    </div>
  );
}

/** Inject the flame/star/palm animation keyframes. Include once per auth page. */
export function SurvivorAuthStyles() {
  return (
    <style>{`
      @keyframes flicker-outer {
        0%,100% { transform: scaleX(1)    scaleY(1)    rotate(-1deg);  opacity: 0.88; }
        20%      { transform: scaleX(0.94) scaleY(1.06) rotate(1.5deg); opacity: 1;    }
        40%      { transform: scaleX(1.06) scaleY(0.96) rotate(-2deg);  opacity: 0.82; }
        60%      { transform: scaleX(0.97) scaleY(1.04) rotate(1deg);   opacity: 0.94; }
        80%      { transform: scaleX(1.04) scaleY(0.97) rotate(-1deg);  opacity: 0.86; }
      }
      @keyframes flicker-mid {
        0%,100% { transform: scaleX(1)    scaleY(1)    rotate(1deg);    opacity: 0.92; }
        25%      { transform: scaleX(1.05) scaleY(0.95) rotate(-1.5deg); opacity: 0.78; }
        50%      { transform: scaleX(0.95) scaleY(1.05) rotate(2deg);    opacity: 1;    }
        75%      { transform: scaleX(1.02) scaleY(0.98) rotate(-0.5deg); opacity: 0.88; }
      }
      @keyframes flicker-core {
        0%,100% { transform: scaleX(1)    scaleY(1);    opacity: 0.9;  }
        33%      { transform: scaleX(0.9)  scaleY(1.08); opacity: 1;    }
        66%      { transform: scaleX(1.08) scaleY(0.93); opacity: 0.82; }
      }
      @keyframes spark-rise {
        0%   { transform: translate(0, 0);     opacity: 1; }
        100% { transform: translate(0, -55px); opacity: 0; }
      }
      @keyframes twinkle {
        0%,100% { opacity: 0.35; }
        50%     { opacity: 0.95; }
      }
      @keyframes torch-pulse {
        0%,100% { opacity: 0.55; }
        50%     { opacity: 0.75; }
      }
      @keyframes palm-sway {
        0%,100% { transform: rotate(-1.5deg); }
        50%     { transform: rotate(1.5deg);  }
      }

      .flame-outer { transform-box:fill-box; transform-origin:50% 100%; animation: flicker-outer 0.22s ease-in-out infinite; }
      .flame-mid   { transform-box:fill-box; transform-origin:50% 100%; animation: flicker-mid   0.18s ease-in-out infinite; }
      .flame-inner { transform-box:fill-box; transform-origin:50% 100%; animation: flicker-outer 0.15s ease-in-out infinite reverse; }
      .flame-core  { transform-box:fill-box; transform-origin:50% 100%; animation: flicker-core  0.20s ease-in-out infinite; }
      .flame-tip   { transform-box:fill-box; transform-origin:50% 100%; animation: flicker-mid   0.13s ease-in-out infinite reverse; }
      .flame-white { transform-box:fill-box; transform-origin:50% 100%; animation: flicker-core  0.11s ease-in-out infinite; }

      .torch-glow { animation: torch-pulse 1.4s ease-in-out infinite; }

      .star-0 { animation: twinkle 3.2s ease-in-out infinite; }
      .star-1 { animation: twinkle 2.5s ease-in-out infinite 0.9s; }
      .star-2 { animation: twinkle 3.8s ease-in-out infinite 1.6s; }

      .spark { animation: spark-rise ease-out infinite; }
      .spark-1 { animation-duration: 1.1s; animation-delay: 0.0s;  }
      .spark-2 { animation-duration: 1.4s; animation-delay: 0.35s; }
      .spark-3 { animation-duration: 1.0s; animation-delay: 0.7s;  }
      .spark-4 { animation-duration: 1.3s; animation-delay: 1.05s; }
      .spark-5 { animation-duration: 1.2s; animation-delay: 0.5s;  }

      .palm-left  { animation: palm-sway 4.2s ease-in-out infinite; }
      .palm-right { animation: palm-sway 4.8s ease-in-out infinite reverse; }
    `}</style>
  );
}

/** Mobile-only branding header (shown when the left panel is hidden). */
export function SurvivorMobileHeader() {
  return (
    <div className="lg:hidden text-center mb-8">
      <h1 className="text-4xl font-black tracking-tight text-gray-900">SURVIVOR</h1>
      <p className="text-sm text-orange-500 font-bold tracking-widest uppercase mt-1">
        Fantasy Draft · Season 50
      </p>
    </div>
  );
}
