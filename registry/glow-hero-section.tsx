"use client";

import React, { useEffect, useRef } from "react";
import { motion, Variants } from "motion/react";
import { cn } from "@/lib/utils";

// --- Animation Variants ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 22 },
  },
};

// --- Types ---
export interface GlowHeroSectionProps {
  /** Extra CSS classes for the root container */
  className?: string;
  /** Tailwind height class applied to the root container, e.g. "h-screen", "h-[600px]" */
  height?: string;
  /** Badge label shown above the heading. Set to null to hide. */
  badge?: string | null;
  /** Main heading text */
  heading?: string;
  /** Subheading / description text */
  description?: string;
  /** Background color of the container */
  backgroundColor?: string;
  /** Gradient start color for the mesh lines (CSS color string) */
  meshColorStart?: string;
  /** Gradient end color for the mesh lines (CSS color string) */
  meshColorEnd?: string;
  /** Opacity of the mesh canvas layer (0-1) */
  meshOpacity?: number;
  /** Grid cell size in pixels — smaller = denser mesh */
  gridSize?: number;
  /** Radius in pixels within which mouse repels mesh points */
  mouseRadius?: number;
}

// --- Main Component ---
export default function GlowHeroSection({
  className,
  height = "h-[520px]",
  badge = "Decentralized · Environmental · Protocol",
  heading = "The Gaia Protocol",
  description = "A decentralized framework for global environmental synthesis, powered by a living, self-organizing data network.",
  backgroundColor = "#f0f4f0",
  meshColorStart = "rgba(255, 122, 0, 0.45)",
  meshColorEnd = "rgba(50, 205, 50, 0.45)",
  meshOpacity = 0.6,
  gridSize = 30,
  mouseRadius = 150,
}: GlowHeroSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef<{ x: number | undefined; y: number | undefined }>({
    x: undefined,
    y: undefined,
  });
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    interface PointData {
      x: number;
      y: number;
      originX: number;
      originY: number;
      z: number;
      update: () => void;
    }

    const points: PointData[] = [];

    function createPoint(x: number, y: number): PointData {
      return {
        x,
        y,
        originX: x,
        originY: y,
        z: 0,
        update() {
          if (mousePos.current.x === undefined) {
            this.x += (this.originX - this.x) * 0.1;
            this.y += (this.originY - this.y) * 0.1;
            this.z += (0 - this.z) * 0.1;
            return;
          }
          const dx = this.x - mousePos.current.x!;
          const dy = this.y - mousePos.current.y!;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRadius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouseRadius - dist) / mouseRadius;
            this.x += Math.cos(angle) * force * 5;
            this.y += Math.sin(angle) * force * 5;
            this.z = force * 20;
          }
          this.x += (this.originX - this.x) * 0.1;
          this.y += (this.originY - this.y) * 0.1;
          this.z += (0 - this.z) * 0.1;
        },
      };
    }

    const init = () => {
      points.length = 0;
      const cols = Math.ceil(canvas.width / gridSize);
      const rows = Math.ceil(canvas.height / gridSize);
      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          points.push(createPoint(i * gridSize, j * gridSize));
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameRef.current++;

      const cols = Math.ceil(canvas.width / gridSize);
      const rows = Math.ceil(canvas.height / gridSize);

      points.forEach((p) => p.update());

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, meshColorStart);
      gradient.addColorStop(1, meshColorEnd);
      ctx.strokeStyle = gradient;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const p1 = points[i * (rows + 1) + j];
          const p2 = points[i * (rows + 1) + (j + 1)];
          const p3 = points[(i + 1) * (rows + 1) + j];

          if (p1 && p2) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineWidth = 1 + p1.z / 10;
            ctx.stroke();
          }
          if (p1 && p3) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.lineWidth = 1 + p1.z / 10;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      init();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseOut = () => {
      mousePos.current = { x: undefined, y: undefined };
    };

    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseOut);

    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gridSize, mouseRadius, meshColorStart, meshColorEnd]);

  return (
    <div
      className={cn(
        "relative w-full flex items-center justify-center overflow-hidden",
        height,
        className
      )}
      style={{ backgroundColor }}
    >
      {/* Animated mesh canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto"
        style={{ opacity: meshOpacity }}
      />

      {/* Radial glow overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,122,0,0.18)_0%,transparent_70%)]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(50,205,50,0.18)_0%,transparent_70%)]" />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-4 max-w-4xl mx-auto pointer-events-none"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {badge !== null && badge !== undefined && (
          <motion.div variants={itemVariants}>
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full text-xs font-semibold uppercase tracking-widest border border-orange-200 bg-orange-50 text-orange-600">
              {badge}
            </span>
          </motion.div>
        )}

        <motion.h1
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-4 bg-gradient-to-r from-orange-500 via-amber-400 to-green-500 bg-clip-text text-transparent"
          variants={itemVariants}
        >
          {heading}
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto"
          variants={itemVariants}
        >
          {description}
        </motion.p>
      </motion.div>
    </div>
  );
}
