"use client";

import React, { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useMotionValue, useSpring, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const INTERACTIVE_CURSOR_STYLE_ID = "interactive-cursor-css";

function acquireGlobalCursorHide() {
  const existing = document.getElementById(
    INTERACTIVE_CURSOR_STYLE_ID
  ) as HTMLStyleElement | null;
  if (existing) {
    const count = Number(existing.dataset.refCount ?? "0") + 1;
    existing.dataset.refCount = String(count);
    return;
  }

  const style = document.createElement("style");
  style.id = INTERACTIVE_CURSOR_STYLE_ID;
  style.dataset.refCount = "1";
  style.dataset.previousBodyCursor = document.body.style.cursor;
  style.textContent = `* { cursor: none !important; }`;
  document.body.style.cursor = "none";
  document.head.appendChild(style);
}

function releaseGlobalCursorHide() {
  const existing = document.getElementById(
    INTERACTIVE_CURSOR_STYLE_ID
  ) as HTMLStyleElement | null;
  if (!existing) return;

  const next = Math.max(0, Number(existing.dataset.refCount ?? "1") - 1);
  if (next === 0) {
    if (document.body.style.cursor === "none") {
      document.body.style.cursor = existing.dataset.previousBodyCursor ?? "";
    }
    existing.remove();
    return;
  }

  existing.dataset.refCount = String(next);
}

export interface InteractiveCursorProps {
  /** The primary color of the cursor dot */
  color?: string;
  /** Color of the click ripple and particles */
  clickColor?: string;
  /** Enables a trailing glow around the cursor */
  glow?: boolean;
  /** Color of the outer ring / trailing glow */
  trailColor?: string;
  /** Enables explosive particles on click */
  particleEffect?: boolean;
  /** Snaps and morphs cursor to interactive elements (a, button) */
  magneticPull?: boolean;
  /** Globally hides system cursor */
  hideSystemCursor?: boolean;
  /** Optional ref to constrain the cursor to a specific element */
  containerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function InteractiveCursor({
  color = "#8b5cf6", 
  clickColor = "#c4b5fd",
  glow = true,
  trailColor = "rgba(139, 92, 246, 0.4)",
  particleEffect = true,
  magneticPull = true,
  hideSystemCursor = false,
  containerRef,
  className,
}: InteractiveCursorProps) {
  // Motion values for actual mouse position
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Spring physics for fast-following inner dot
  const springX = useSpring(cursorX, { stiffness: 800, damping: 25 });
  const springY = useSpring(cursorY, { stiffness: 800, damping: 25 });

  // Spring physics for slower-following outer glow/trail
  const trailX = useSpring(cursorX, { stiffness: 150, damping: 20 });
  const trailY = useSpring(cursorY, { stiffness: 150, damping: 20 });

  // Magnetic sizing springs
  const magneticWidth = useSpring(36, { stiffness: 300, damping: 20 });
  const magneticHeight = useSpring(36, { stiffness: 300, damping: 20 });

  const [clicked, setClicked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [scopeElement, setScopeElement] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const nextScopeElement = containerRef?.current ?? null;
    setScopeElement((current) =>
      current === nextScopeElement ? current : nextScopeElement
    );
  });

  useEffect(() => {
    if (!scopeElement) return;

    const computedPosition = window.getComputedStyle(scopeElement).position;
    if (computedPosition !== "static") return;

    const previousPosition = scopeElement.style.position;
    scopeElement.style.position = "relative";

    return () => {
      scopeElement.style.position = previousPosition;
    };
  }, [scopeElement]);

  useEffect(() => {
    let _id = 0;

    const getPos = (e: MouseEvent) => {
      let x = e.clientX;
      let y = e.clientY;
      let isInside = true;
      if (scopeElement) {
        const rect = scopeElement.getBoundingClientRect();
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        ) {
          isInside = false;
        }
      }
      return { x, y, isInside };
    };

    const moveListener = (e: MouseEvent) => {
      const { x, y, isInside } = getPos(e);
      if (!isInside) {
        setIsVisible(false);
        return;
      }
      setIsVisible(true);
      let targetX = x;
      let targetY = y;
      let foundHover = false;

      if (magneticPull) {
        const target = e.target as HTMLElement;
        const interactiveElement = target.closest('button, a, input, [data-magnetic="true"]');

        if (interactiveElement && (!scopeElement || scopeElement.contains(interactiveElement))) {
          foundHover = true;
          const rect = interactiveElement.getBoundingClientRect();
          let centerX = rect.left + rect.width / 2;
          let centerY = rect.top + rect.height / 2;

          if (scopeElement) {
            const containerRect = scopeElement.getBoundingClientRect();
            centerX -= containerRect.left;
            centerY -= containerRect.top;
          }
          
          // Snap strictly toward the center
          targetX = centerX;
          targetY = centerY;
          
          // Expand outer trail to envelop the element
          magneticWidth.set(rect.width + 12);
          magneticHeight.set(rect.height + 12);
        } else {
          magneticWidth.set(glow ? 36 : 14);
          magneticHeight.set(glow ? 36 : 14);
        }
      }

      setIsHovering(foundHover);
      cursorX.set(targetX);
      cursorY.set(targetY);
    };

    const leaveListener = () => {
      if (!scopeElement) return;
      setIsVisible(false);
      setIsHovering(false);
      magneticWidth.set(glow ? 36 : 14);
      magneticHeight.set(glow ? 36 : 14);
    };

    const mousedownListener = (e: MouseEvent) => {
      const { x, y, isInside } = getPos(e);
      if (!isInside) return;

      setClicked(true);
      
      const newId = ++_id;
      
      // Add ripple
      setRipples((prev) => [...prev, { id: newId, x, y }]);
      
      // Add particles
      if (particleEffect) {
        const count = Math.floor(Math.random() * 4) + 5; // 5 to 8 particles
        const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
          const distance = Math.random() * 40 + 20;
          return {
            id: ++_id,
            x,
            y,
            dx: Math.cos(angle) * distance,
            dy: Math.sin(angle) * distance,
          };
        });
        setParticles((prev) => [...prev, ...newParticles]);
      }

      // Cleanup effects
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newId));
      }, 600);
      
      if (particleEffect) {
        setTimeout(() => {
          setParticles((prev) => {
            const currentIds = prev.map(p => p.id);
            // In a real app we might just keep max 20 particles to avoid leaks
            if (currentIds.length > 20) return prev.slice(-20);
            return prev;
          });
        }, 1000);
      }
    };

    const mouseupListener = () => {
      setClicked(false);
    };

    if (scopeElement) {
      scopeElement.addEventListener("mousemove", moveListener);
      scopeElement.addEventListener("mousedown", mousedownListener);
      scopeElement.addEventListener("mouseleave", leaveListener);
    } else {
      window.addEventListener("mousemove", moveListener);
      window.addEventListener("mousedown", mousedownListener);
    }
    window.addEventListener("mouseup", mouseupListener);

    if (hideSystemCursor) {
      acquireGlobalCursorHide();
    }

    return () => {
      if (scopeElement) {
        scopeElement.removeEventListener("mousemove", moveListener);
        scopeElement.removeEventListener("mousedown", mousedownListener);
        scopeElement.removeEventListener("mouseleave", leaveListener);
      } else {
        window.removeEventListener("mousemove", moveListener);
        window.removeEventListener("mousedown", mousedownListener);
      }
      window.removeEventListener("mouseup", mouseupListener);
      if (hideSystemCursor) {
        releaseGlobalCursorHide();
      }
    };
  }, [cursorX, cursorY, glow, magneticPull, particleEffect, hideSystemCursor, magneticHeight, magneticWidth, containerRef]);

  const overlay = (
    <div
      className={cn(
        "pointer-events-none inset-0 z-[99999]",
        scopeElement ? "absolute" : "fixed",
        className
      )}
    >
      {/* Outer Glow / Trail */}
      <motion.div
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-colors duration-200",
          isHovering && magneticPull ? "rounded-[8px]" : "rounded-full"
        )}
        style={{
          left: trailX,
          top: trailY,
          width: magneticWidth,
          height: magneticHeight,
          backgroundColor: isHovering && magneticPull ? "transparent" : (glow ? trailColor : "transparent"),
          border: isHovering && magneticPull ? `1px solid ${trailColor}` : "none",
          boxShadow: glow && !isHovering ? `0 0 20px ${trailColor}` : "none",
        }}
        animate={{
          scale: clicked ? 0.9 : 1,
          opacity: isVisible ? 1 : 0,
        }}
      />

      {/* Inner Dot */}
      <motion.div
        className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm"
        style={{
          left: springX,
          top: springY,
          backgroundColor: color,
        }}
        animate={{
          scale: clicked ? 0.5 : 1,
          opacity: isVisible ? (isHovering && magneticPull ? 0 : 1) : 0,
        }}
      />

      {/* Particles Burst */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={`particle-${p.id}`}
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 1 }}
            animate={{
              x: p.x + p.dx,
              y: p.y + p.dy,
              opacity: 0,
              scale: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ backgroundColor: clickColor }}
          />
        ))}
      </AnimatePresence>

      {/* Ripples */}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={`ripple-${r.id}`}
            className="absolute rounded-full bg-transparent -translate-x-1/2 -translate-y-1/2"
            style={{
              left: r.x,
              top: r.y,
              border: `2px solid ${clickColor}`,
            }}
            initial={{ width: 10, height: 10, opacity: 0.8 }}
            animate={{ width: 80, height: 80, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );

  if (scopeElement) {
    return createPortal(overlay, scopeElement);
  }

  return overlay;
}
