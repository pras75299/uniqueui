/* Isometric SVG hero illustration
   Keyframe animations (.iso-main, .iso-a, .iso-b, .iso-c, .iso-d, .glow-pulse)
   are defined in app/globals.css — no inline styles needed. */

export default function IsoHero() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <svg
        viewBox="30 85 445 310"
        className="w-full max-w-xl"
        aria-hidden="true"
        style={{ filter: "drop-shadow(0 0 60px rgba(34,211,238,0.18))" }}
      >
        <defs>
          <radialGradient id="mainGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="topFace" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
          <linearGradient id="rightFace" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0E7490" />
            <stop offset="100%" stopColor="#083344" />
          </linearGradient>
          <linearGradient id="leftFace" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#155E75" />
            <stop offset="100%" stopColor="#062533" />
          </linearGradient>
          <linearGradient id="topA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A5B4FC" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
          <linearGradient id="rightA" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4338CA" />
            <stop offset="100%" stopColor="#2D1F8F" />
          </linearGradient>
          <linearGradient id="leftA" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#312E81" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>
          <linearGradient id="topB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id="rightB" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#034732" />
          </linearGradient>
          <linearGradient id="leftB" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#064E3B" />
            <stop offset="100%" stopColor="#022C22" />
          </linearGradient>
          <linearGradient id="topCD" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="rightCD" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#023656" />
          </linearGradient>
          <linearGradient id="leftCD" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0C4A6E" />
            <stop offset="100%" stopColor="#052030" />
          </linearGradient>
          <clipPath id="clipRight">
            <polygon points="340,160 240,210 240,370 340,320" />
          </clipPath>
          <clipPath id="clipLeft">
            <polygon points="140,160 240,210 240,370 140,320" />
          </clipPath>
        </defs>

        <ellipse cx="240" cy="290" rx="160" ry="60" fill="url(#mainGlow)" className="glow-pulse" />

        <g opacity="0.07" stroke="#22D3EE" strokeWidth="0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`gl${i}`} x1={100 + i * 60} y1="110" x2={40 + i * 60} y2="390" />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={`gr${i}`} x1={60 + i * 60} y1="390" x2={120 + i * 60} y2="110" />
          ))}
        </g>

        <g className="iso-a">
          <polygon points="50,195 95,172 140,195 95,218" fill="url(#topA)" />
          <polygon points="140,195 95,218 95,308 140,285" fill="url(#rightA)" />
          <polygon points="50,195 95,218 95,308 50,285" fill="url(#leftA)" />
        </g>
        <g className="iso-b">
          <polygon points="340,175 385,152 430,175 385,198" fill="url(#topB)" />
          <polygon points="430,175 385,198 385,298 430,275" fill="url(#rightB)" />
          <polygon points="340,175 385,198 385,298 340,275" fill="url(#leftB)" />
        </g>
        <g className="iso-c">
          <polygon points="85,320 120,302 155,320 120,338" fill="url(#topCD)" />
          <polygon points="155,320 120,338 120,380 155,362" fill="url(#rightCD)" />
          <polygon points="85,320 120,338 120,380 85,362" fill="url(#leftCD)" />
        </g>
        <g className="iso-d">
          <polygon points="330,298 370,278 410,298 370,318" fill="url(#topCD)" />
          <polygon points="410,298 370,318 370,373 410,353" fill="url(#rightCD)" />
          <polygon points="330,298 370,318 370,373 330,353" fill="url(#leftCD)" />
        </g>

        <g className="iso-main">
          <polygon points="140,160 240,110 340,160 240,210" fill="url(#topFace)" />
          <polygon points="140,160 240,210 240,370 140,320" fill="url(#leftFace)" />
          <g transform="matrix(-1,-0.5,0,1,240,210)" clipPath="url(#clipLeft)" opacity="0.85">
            <rect x="8" y="10" width="70" height="7" rx="2" fill="#22D3EE" opacity="0.4" />
            <rect x="8" y="25" width="55" height="5" rx="1" fill="white" opacity="0.15" />
            <rect x="8" y="35" width="60" height="5" rx="1" fill="white" opacity="0.10" />
            <rect x="8" y="45" width="50" height="5" rx="1" fill="#22D3EE" opacity="0.5" />
            <rect x="8" y="55" width="58" height="5" rx="1" fill="white" opacity="0.10" />
          </g>
          <polygon points="340,160 240,210 240,370 340,320" fill="url(#rightFace)" />
          <polygon points="340,160 240,210 240,370 340,320" fill="#060A1F" opacity="0.55" />
          <g transform="matrix(1,-0.5,0,1,240,210)" clipPath="url(#clipRight)">
            <rect x="2" y="2" width="96" height="9" rx="2" fill="#22D3EE" opacity="0.22" />
            <circle cx="8" cy="6.5" r="2.5" fill="#22D3EE" opacity="0.6" />
            <circle cx="16" cy="6.5" r="2.5" fill="#F97316" opacity="0.5" />
            <circle cx="24" cy="6.5" r="2.5" fill="#34D399" opacity="0.5" />
            <rect x="2" y="15" width="28" height="13" rx="2" fill="#0E4460" />
            <rect x="36" y="15" width="26" height="13" rx="2" fill="#0E4460" />
            <rect x="68" y="15" width="28" height="13" rx="2" fill="#0E4460" />
            <line x1="2" y1="33" x2="98" y2="33" stroke="#22D3EE" strokeWidth="0.4" opacity="0.3" />
            <rect x="6" y="58" width="7" height="28" rx="1" fill="#22D3EE" opacity="0.75" />
            <rect x="17" y="50" width="7" height="36" rx="1" fill="#22D3EE" opacity="0.6" />
            <rect x="28" y="54" width="7" height="32" rx="1" fill="#22D3EE" opacity="0.85" />
            <rect x="39" y="44" width="7" height="42" rx="1" fill="#22D3EE" />
            <rect x="50" y="52" width="7" height="34" rx="1" fill="#22D3EE" opacity="0.65" />
            <rect x="61" y="40" width="7" height="46" rx="1" fill="#22D3EE" opacity="0.9" />
            <rect x="72" y="48" width="7" height="38" rx="1" fill="#22D3EE" opacity="0.7" />
            <rect x="83" y="35" width="7" height="51" rx="1" fill="#F97316" opacity="0.8" />
            <line x1="4" y1="90" x2="95" y2="90" stroke="#22D3EE" strokeWidth="0.4" opacity="0.25" />
            <polyline
              points="4,128 16,118 28,124 40,108 52,114 64,100 76,106 88,94"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="1.5"
              opacity="0.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="88" cy="94" r="3" fill="#22D3EE" />
          </g>
          <polyline points="140,160 240,110 340,160" fill="none" stroke="#A5F3FC" strokeWidth="1" opacity="0.6" />
        </g>

        <g stroke="#22D3EE" strokeWidth="0.6" opacity="0.25" strokeDasharray="4 3">
          <line x1="140" y1="240" x2="95" y2="263" />
          <line x1="340" y1="240" x2="385" y2="237" />
          <line x1="240" y1="370" x2="120" y2="359" />
          <line x1="240" y1="370" x2="370" y2="346" />
        </g>
      </svg>
    </div>
  );
}
