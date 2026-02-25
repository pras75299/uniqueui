"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface MeteorsCardProps {
  children: React.ReactNode;
  className?: string;
  meteorCount?: number;
  meteorColor?: string;
}

export function MeteorsCard({
  children,
  className,
  meteorCount = 20,
  meteorColor = "white",
}: MeteorsCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 p-8",
        className
      )}
    >
      <Meteors count={meteorCount} color={meteorColor} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface MeteorData {
  left: string;
  delay: string;
  duration: string;
  size: number;
  tailWidth: number;
}

function Meteors({ count, color }: { count: number; color: string }) {
  const [meteors, setMeteors] = useState<MeteorData[]>([]);

  useEffect(() => {
    const meteorData = Array.from({ length: count }).map(() => ({
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 2}s`,
      size: Math.random() * 1.5 + 0.5,
      tailWidth: Math.random() * 80 + 40,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMeteors(meteorData);
  }, [count]);

  return (
    <>
      {meteors.map((m, i) => (
        <span
          key={i}
          className="absolute top-0 rotate-[215deg] animate-meteor"
          style={{
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        >
          <span
            className="block rounded-full"
            style={{
              width: `${m.size}px`,
              height: `${m.size}px`,
              backgroundColor: color,
              boxShadow: `0 0 ${m.size * 4}px ${m.size}px ${color}`,
            }}
          />
          <span
            className="absolute top-1/2 -translate-y-1/2 -left-[1px]"
            style={{
              width: `${m.tailWidth}px`,
              height: `${m.size * 0.8}px`,
              background: `linear-gradient(to left, ${color}, transparent)`,
              opacity: 0.6,
            }}
          />
        </span>
      ))}
    </>
  );
}
