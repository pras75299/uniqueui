"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

export interface ParticleFieldProps
  extends Omit<HTMLMotionProps<"div">, "onAnimationStart" | "onDragStart" | "onDragEnd" | "onDrag"> {
  particleCount?: number;
  particleColor?: string;
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

  // Parse color to rgba for dynamic opacity
  const particleColorRgb = useMemo(() => {
    // Very basic hex to rgb parser
    let hex = particleColor.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex.split("").map((char) => char + char).join("");
    }
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
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

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      density: number;

      constructor(canvasWidth: number, canvasHeight: number) {
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
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(${particleColorRgb}, ${
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

      // Cache canvas rect for pointer coordinate calculations
      canvasRect = canvas.getBoundingClientRect();

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
              ctx.beginPath();
              ctx.strokeStyle = `rgba(${particleColorRgb}, ${1 - distance / 100})`;
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
  }, [particleCount, particleSize.max, particleSize.min, interactionRadius, speed, particleColorRgb]);

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
