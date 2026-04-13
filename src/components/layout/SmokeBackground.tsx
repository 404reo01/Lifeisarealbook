// Pure CSS + SVG turbulence smoke — no JS, no canvas, SSR-safe
export function SmokeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>

      {/* SVG filter: fractal noise → displacement = smoke texture */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="smoke" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.009 0.006"
              numOctaves="5"
              seed="8"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="160"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="8" />
          </filter>
        </defs>
      </svg>

      {/* Couches de fumée filtrées */}
      <div className="absolute inset-0" style={{ filter: "url(#smoke)" }}>

        {/* Nappe bleue — haut gauche, dérive lentement */}
        <div
          className="absolute"
          style={{
            width: "75%",
            height: "70%",
            top: "-15%",
            left: "-10%",
            background:
              "radial-gradient(ellipse 70% 65% at 35% 40%, rgba(96,165,250,0.55) 0%, rgba(59,130,246,0.25) 45%, transparent 75%)",
            animation: "smoke-a 22s ease-in-out infinite",
          }}
        />

        {/* Nappe rose — bas droit */}
        <div
          className="absolute"
          style={{
            width: "70%",
            height: "75%",
            bottom: "-20%",
            right: "-10%",
            background:
              "radial-gradient(ellipse 65% 70% at 60% 55%, rgba(244,114,182,0.50) 0%, rgba(236,72,153,0.22) 45%, transparent 75%)",
            animation: "smoke-b 28s ease-in-out infinite",
            animationDelay: "-8s",
          }}
        />

        {/* Nappe mauve — centre, monte doucement */}
        <div
          className="absolute"
          style={{
            width: "65%",
            height: "65%",
            top: "20%",
            left: "25%",
            background:
              "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(167,139,250,0.42) 0%, rgba(139,92,246,0.18) 45%, transparent 75%)",
            animation: "smoke-c 18s ease-in-out infinite",
            animationDelay: "-13s",
          }}
        />

        {/* Nappe bleue secondaire — milieu gauche */}
        <div
          className="absolute"
          style={{
            width: "55%",
            height: "55%",
            top: "40%",
            left: "-5%",
            background:
              "radial-gradient(ellipse 65% 55% at 30% 50%, rgba(96,165,250,0.35) 0%, transparent 70%)",
            animation: "smoke-a 25s ease-in-out infinite",
            animationDelay: "-5s",
          }}
        />

        {/* Nappe rose secondaire — haut droit */}
        <div
          className="absolute"
          style={{
            width: "50%",
            height: "50%",
            top: "-5%",
            right: "5%",
            background:
              "radial-gradient(ellipse 60% 60% at 65% 35%, rgba(251,113,133,0.38) 0%, transparent 70%)",
            animation: "smoke-b 20s ease-in-out infinite",
            animationDelay: "-17s",
          }}
        />
      </div>

      {/* Overlay pour lisibilité — s'adapte au thème via CSS var */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--smoke-overlay)" }}
      />
    </div>
  );
}
