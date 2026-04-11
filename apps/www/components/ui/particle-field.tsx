"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

type Particle = {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  density: number;
  color: [number, number, number];
};

function parseHexColor(color: string): [number, number, number] {
  let hex = color.trim().replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return [255, 255, 255];
  }

  const bigint = parseInt(hex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function createParticle(
  canvasWidth: number,
  canvasHeight: number,
  particleSize: { min: number; max: number },
  speed: number,
  colors: Array<[number, number, number]>
): Particle {
  const color = colors[Math.floor(Math.random() * colors.length)] ?? [255, 255, 255];

  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    size:
      Math.random() * (particleSize.max - particleSize.min) +
      particleSize.min,
    vx: (Math.random() - 0.5) * speed,
    vy: (Math.random() - 0.5) * speed,
    density: Math.random() * 30 + 10,
    color,
  };
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  particleSize: { min: number; max: number }
) {
  ctx.fillStyle = `rgba(${particle.color.join(", ")}, ${
    particle.size / particleSize.max
  })`;
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function updateParticlePosition(
  particle: Particle,
  canvasWidth: number,
  canvasHeight: number,
  mouse: { x: number; y: number },
  interactionRadius: number
) {
  particle.x += particle.vx;
  particle.y += particle.vy;

  if (particle.x < 0 || particle.x > canvasWidth) particle.vx *= -1;
  if (particle.y < 0 || particle.y > canvasHeight) particle.vy *= -1;

  if (mouse.x === -1000 || mouse.y === -1000) {
    return;
  }

  const dx = mouse.x - particle.x;
  const dy = mouse.y - particle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0 || distance >= interactionRadius) {
    return;
  }

  const forceDirectionX = dx / distance;
  const forceDirectionY = dy / distance;
  const force = (interactionRadius - distance) / interactionRadius;

  particle.x += forceDirectionX * force * particle.density * -1;
  particle.y += forceDirectionY * force * particle.density * -1;
}

export interface ParticleFieldProps
  extends Omit<HTMLMotionProps<"div">, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  particleCount?: number;
  particleColor?: string | string[];
  interactionRadius?: number;
  particleSize?: { min: number; max: number };
  speed?: number;
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
  const minParticleSize = particleSize.min;
  const maxParticleSize = particleSize.max;

  const particleColors = useMemo(() => {
    const colors = Array.isArray(particleColor) ? particleColor : [particleColor];
    return colors.map(parseHexColor);
  }, [particleColor]);

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
    let canvasRect = canvas.getBoundingClientRect();
    
    // Mouse state
    const mouse = {
      x: -1000,
      y: -1000,
    };

    const setupCanvas = () => {
      rect = container.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Cache canvas rect for pointer coordinate calculations
      canvasRect = canvas.getBoundingClientRect();

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(
          createParticle(
            rect.width,
            rect.height,
            { min: minParticleSize, max: maxParticleSize },
            speed,
            particleColors
          )
        );
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
        updateParticlePosition(
          particle,
          rect.width,
          rect.height,
          mouse,
          interactionRadius
        );
        drawParticle(
          ctx,
          particle,
          { min: minParticleSize, max: maxParticleSize }
        );
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      setupCanvas();
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Use cached canvas rect to avoid layout reads on every pointer move
      mouse.x = e.clientX - canvasRect.left;
      mouse.y = e.clientY - canvasRect.top;
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
  }, [particleCount, interactionRadius, speed, particleColors, minParticleSize, maxParticleSize]);

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
