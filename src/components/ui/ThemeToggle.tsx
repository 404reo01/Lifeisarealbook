"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Phase = "idle" | "exit" | "enter";

// 8 sparks at 45° intervals, with slight distance variation
const SPARKS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i * Math.PI * 2) / 8;
  const dist = 26 + (i % 3) * 5;
  return {
    id: i,
    sx: `${Math.round(Math.sin(angle) * dist)}px`,
    sy: `${Math.round(-Math.cos(angle) * dist)}px`,
    delay: `${i * 25}ms`,
  };
});

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted]     = useState(false);
  const [phase, setPhase]         = useState<Phase>("idle");
  const [showSparks, setShowSparks] = useState(false);
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => () => { t1.current && clearTimeout(t1.current); t2.current && clearTimeout(t2.current); }, []);

  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === "dark";
  // Accent colors per mode (before the switch, so isDark = current)
  const sparkColor = isDark ? "#fbbf24" : "#a87ac8";
  const glowColor  = isDark
    ? "rgba(251,191,36,0.45)"
    : "rgba(168,122,200,0.50)";

  const toggle = () => {
    if (phase !== "idle") return;

    setPhase("exit");
    setShowSparks(true);

    // 1. Wait for exit animation, then swap theme + enter
    t1.current = setTimeout(() => {
      setTheme(isDark ? "light" : "dark");
      setPhase("enter");

      // 2. Reset to idle once entrance is done
      t2.current = setTimeout(() => {
        setPhase("idle");
        setShowSparks(false);
      }, 450);
    }, 210);
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className={cn(
        "relative w-9 h-9 flex items-center justify-center rounded-full overflow-visible select-none",
        "text-muted hover:text-foreground",
        "transition-transform duration-100",
        phase !== "idle" && "scale-90",
        className
      )}
    >
      {/* Glow halo */}
      <span
        className="absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: phase !== "idle" ? 1 : 0,
          boxShadow: `0 0 18px 4px ${glowColor}`,
        }}
      />

      {/* Ripple ring */}
      {phase === "exit" && (
        <span
          className="absolute inset-0 rounded-full border pointer-events-none"
          style={{
            borderColor: sparkColor,
            animation: "ripple-out 0.5s ease-out forwards",
          }}
        />
      )}

      {/* Icon */}
      <span
        className={cn(
          "relative z-10",
          phase === "exit"  && "transition-all duration-[180ms] ease-in scale-0 rotate-90 opacity-0",
          phase === "enter" && "opacity-100",
          phase === "idle"  && "transition-colors duration-200"
        )}
        style={phase === "enter" ? { animation: "icon-enter 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards" } : undefined}
      >
        {isDark
          ? <Sun  size={18} strokeWidth={1.5} />
          : <Moon size={18} strokeWidth={1.5} />
        }
      </span>

      {/* Sparks */}
      {showSparks && SPARKS.map(({ id, sx, sy, delay }) => (
        <span
          key={id}
          className="absolute left-1/2 top-1/2 w-[5px] h-[5px] rounded-full pointer-events-none"
          style={{
            background: sparkColor,
            "--sx": sx,
            "--sy": sy,
            animationDelay: delay,
            animation: "spark-fly 0.55s ease-out forwards",
          } as React.CSSProperties}
        />
      ))}
    </button>
  );
}
