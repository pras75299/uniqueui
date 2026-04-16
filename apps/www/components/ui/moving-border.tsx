"use client";
import React from "react";
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Button({
  borderRadius = "1.75rem",
  children,
  as: Component = "button",
  containerClassName,
  borderClassName,
  duration,
  className,
  theme = "dark",
  ...otherProps
}: {
  borderRadius?: string;
  children: React.ReactNode;
  as?: React.ElementType;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  className?: string;
  theme?: "light" | "dark";
  [key: string]: unknown;
}) {
  return (
    <Component
      className={cn(
        "bg-transparent relative text-xl  h-16 w-40 p-[1px] overflow-hidden ",
        containerClassName
      )}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <MovingBorder duration={duration} rx="30%" ry="30%">
          <div
            className={cn(
              "h-20 w-20 opacity-[0.8] bg-[radial-gradient(#0ea5e9_40%,transparent_60%)]",
              borderClassName
            )}
          />
        </MovingBorder>
      </div>

      <div
        className={cn(
          "relative flex items-center justify-center w-full h-full text-sm antialiased",
          theme === "dark" ? "bg-slate-900 border border-slate-800 text-white" : "bg-slate-100 border border-slate-300 text-slate-900",
          className
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </Component>
  );
}

export const MovingBorder = ({
  children,
  duration = 2000,
  rx,
  ry,
  ...otherProps
}: {
  children?: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  [key: string]: unknown;
}) => {
  const safeDuration = duration > 0 ? duration : 2000;
  const pathRef = useRef<SVGRectElement | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const pathLengthRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime: number | null = null;

    const animate = (time: number) => {
      if (lastTime === null) lastTime = time;
      const deltaTime = time - lastTime;
      lastTime = time;

      if (!pathRef.current) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      if (pathLengthRef.current == null) {
        pathLengthRef.current = pathRef.current.getTotalLength();
      }

      const pathLength = pathLengthRef.current;
      if (pathLength) {
        const pxPerMs = pathLength / safeDuration;
        progressRef.current = (progressRef.current + deltaTime * pxPerMs) % pathLength;
        const point = pathRef.current?.getPointAtLength?.(progressRef.current);
        if (point && elementRef.current) {
          elementRef.current.style.transform = `translateX(${point.x}px) translateY(${point.y}px) translateX(-50%) translateY(-50%)`;
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [safeDuration]);

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...otherProps}
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef}
        />
      </svg>
      <div
        ref={elementRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform: "translateX(0px) translateY(0px) translateX(-50%) translateY(-50%)",
        }}
      >
        {children}
      </div>
    </>
  );
};


