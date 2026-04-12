"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

export interface ParticleFieldProps
  extends Omit<HTMLMotionProps<"div">, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  particleCount?: number;
  particleColor?: string | string[];
  interactionRadius?: number;
  particleSize?: { min: number; max: number };
  speed?: number;
}

type Particle = {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  density: number;
  color: [number, number, number];
};

let colorParserContext: CanvasRenderingContext2D | null = null;

function getColorParserContext() {
  if (typeof document === "undefined") {
    return null;
  }

  if (!colorParserContext) {
    colorParserContext = document.createElement("canvas").getContext("2d");
  }

  return colorParserContext;
}

function parseResolvedColor(color: string): [number, number, number] | null {
  const ctx = getColorParserContext();
  if (!ctx) {
    return null;
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillStyle = color;

  const normalizedColor = ctx.fillStyle;
  if (normalizedColor.startsWith("#")) {
    let hex = normalizedColor.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
      const value = Number.parseInt(hex, 16);
      return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
    }
  }

  const rgbMatch = normalizedColor.match(/[\d.]+/g);

  if (!rgbMatch || rgbMatch.length < 3) {
    return null;
  }

  return [
    Math.round(Number.parseFloat(rgbMatch[0])),
    Math.round(Number.parseFloat(rgbMatch[1])),
    Math.round(Number.parseFloat(rgbMatch[2])),
  ];
}

function resolveCssVariable(color: string, element: HTMLElement): string {
  const varMatch = color.trim().match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/);
  if (!varMatch) return color;

  const [, variableName, fallback] = varMatch;
  const resolved = getComputedStyle(element).getPropertyValue(variableName).trim();
  if (resolved) return resolved;
  return fallback?.trim() || color;
}

function parseColor(color: string, element: HTMLElement): [number, number, number] {
  const resolvedColor = resolveCssVariable(color, element);
  return parseResolvedColor(resolvedColor) ?? [255, 255, 255];
}

export function ParticleField({
  className,
  particleCount = 100,
  particleColor = "#ffffff",
  interactionRadius = 150,
  particleSize = { min: 1, max: 3 },
  speed = 1,
  ...props
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const particleColorValues = useMemo(
    () => (Array.isArray(particleColor) ? particleColor : [particleColor]),
    [particleColor]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;
    let rect = container.getBoundingClientRect();
    let dpr = window.devicePixelRatio || 1;
    const particleColors = particleColorValues.map((color) =>
      parseColor(color, container)
    );
    
    // Mouse state
    const mouse = {
      x: -1000,
      y: -1000,
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      density: number;
      color: [number, number, number];

      constructor(canvasWidth: number, canvasHeight: number) {
        const color =
          particleColors[Math.floor(Math.random() * particleColors.length)] ??
          [255, 255, 255];
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size =
          Math.random() * (particleSize.max - particleSize.min) +
          particleSize.min;
        this.vx = (Math.random() - 0.5) * speed;
        this.vy = (Math.random() - 0.5) * speed;
        this.density = Math.random() * 30 + 10;
        this.color = color;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(${this.color.join(", ")}, ${
          this.size / particleSize.max
        })`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      update(canvasWidth: number, canvasHeight: number) {
        // Natural drifting
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
        if (this.y < 0 || this.y > canvasHeight) this.vy *= -1;

        // Interactive mouse physics (Repulsion)
        if (mouse.x !== -1000 && mouse.y !== -1000) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < interactionRadius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                
                // Max distance, past that the force is 0
                const force = (interactionRadius - distance) / interactionRadius;
                
                // Repulse direction
                const directionX = (forceDirectionX * force * this.density) * -1;
                const directionY = (forceDirectionY * force * this.density) * -1;
                
                this.x += directionX;
                this.y += directionY;
            }
        }
      }
    }

    const setupCanvas = () => {
      rect = container.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(rect.width, rect.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Limit line drawing complexity for large particle counts
      const MAX_CONNECTED_PARTICLES = 150;
      if (particles.length <= MAX_CONNECTED_PARTICLES) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              const lineColor: [number, number, number] = [
                Math.round((particles[i].color[0] + particles[j].color[0]) / 2),
                Math.round((particles[i].color[1] + particles[j].color[1]) / 2),
                Math.round((particles[i].color[2] + particles[j].color[2]) / 2),
              ];
              ctx.beginPath();
              ctx.strokeStyle = `rgba(${lineColor.join(", ")}, ${1 - distance / 100})`;
              ctx.lineWidth = 0.5;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      particles.forEach((particle) => {
        particle.update(rect.width, rect.height);
        particle.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      setupCanvas();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.offsetX;
      mouse.y = e.offsetY;
    };
    
    const handleMouseLeave = () => {
        mouse.x = -1000;
        mouse.y = -1000;
    }

    // Event listeners
    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Initial load
    setupCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount, particleSize.max, particleSize.min, interactionRadius, speed, particleColorValues]);

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative h-full w-full overflow-hidden", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full pointer-events-auto"
      />
    </motion.div>
  );
}
