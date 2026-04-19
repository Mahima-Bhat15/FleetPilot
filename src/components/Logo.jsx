// src/components/Logo.jsx — SVG recreation of the FleetPilot brand mark
export const FleetLogo = ({ size = 32 }) => {
  const bg = '#4A8DC7';
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      {/* Background square */}
      <rect width="100" height="100" rx="13" fill={bg} />

      {/* ── TOP LEFT H ───────────────────────────────────────────── */}
      <rect x="4"  y="5"  width="12" height="40" rx="2" fill="white" />  {/* far-left bar   */}
      <rect x="23" y="5"  width="12" height="40" rx="2" fill="white" />  {/* inner-left bar */}
      <rect x="4"  y="5"  width="31" height="12" rx="2" fill="white" />  {/* top crossbar   */}

      {/* ── TOP RIGHT H ──────────────────────────────────────────── */}
      <rect x="65" y="5"  width="12" height="40" rx="2" fill="white" />  {/* inner-right bar */}
      <rect x="84" y="5"  width="12" height="40" rx="2" fill="white" />  {/* far-right bar   */}
      <rect x="65" y="5"  width="31" height="12" rx="2" fill="white" />  {/* top crossbar    */}

      {/* ── DRIVER FIGURE ────────────────────────────────────────── */}

      {/* Cap crown */}
      <rect x="38" y="33" width="24" height="10" rx="4" fill="white" />
      {/* Cap brim (blue accent stripe) */}
      <rect x="35" y="39" width="30" height="4"  rx="2" fill={bg} />
      <rect x="35" y="39" width="30" height="2"  rx="1" fill="white" opacity="0.55" />

      {/* Head */}
      <ellipse cx="50" cy="48" rx="13" ry="11" fill="white" />

      {/* Eyes */}
      <ellipse cx="44" cy="47" rx="2.2" ry="2.8" fill={bg} />
      <ellipse cx="56" cy="47" rx="2.2" ry="2.8" fill={bg} />

      {/* Chin shadow / slight smile */}
      <path d="M 43 53 Q 50 57 57 53" stroke={bg} strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Shoulders + torso */}
      <path d="M 30 74 L 33 57 Q 41 54 50 54 Q 59 54 67 57 L 70 74 Z" fill="white" />

      {/* Steering wheel rim */}
      <ellipse cx="50" cy="72" rx="15" ry="9" stroke="white" strokeWidth="4.5" fill="none" />
      {/* Steering wheel hub */}
      <rect x="46" y="68" width="8" height="7" rx="2.5" fill={bg} />

      {/* ── BOTTOM LEFT I + wheel arc ────────────────────────────── */}
      <rect x="4"  y="69" width="21" height="19" rx="2" fill="white" />
      {/* outer arc — left wheel fender */}
      <path d="M 4 79 Q 1 93 12 97" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* ── BOTTOM RIGHT I + wheel arc ───────────────────────────── */}
      <rect x="75" y="69" width="21" height="19" rx="2" fill="white" />
      {/* outer arc — right wheel fender */}
      <path d="M 96 79 Q 99 93 88 97" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />

      {/* ── 4-POINTED STAR (bottom-right corner) ─────────────────── */}
      <path
        d="M91,87 L92.6,90.4 L96,92 L92.6,93.6 L91,97 L89.4,93.6 L86,92 L89.4,90.4 Z"
        fill="rgba(255,255,255,0.62)"
      />
    </svg>
  );
};
