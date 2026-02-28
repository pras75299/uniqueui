"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export interface HoverRevealCardProps {
  image: string;
  imageAlt?: string;
  tag?: string;
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  href?: string;
  accentColor?: string;
  className?: string;
  imageHeight?: number;
}

export function HoverRevealCard({
  image,
  imageAlt = "",
  tag,
  title,
  subtitle,
  description,
  ctaText = "Read more →",
  href,
  accentColor = "#6366f1",
  className,
  imageHeight = 240,
}: HoverRevealCardProps) {
  const [hovered, setHovered] = useState(false);

  const Tag = href ? "a" : "div";
  const linkProps = href
    ? { href, target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Tag
      {...linkProps}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white shadow-md border border-neutral-200/60 cursor-pointer select-none block",
        className
      )}
      style={{ minHeight: imageHeight + 140 }}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ height: imageHeight }}>
        <motion.img
          src={image}
          alt={imageAlt}
          className="w-full h-full object-cover"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Default content */}
      <motion.div
        className="px-5 pt-4 pb-5"
        animate={{ opacity: hovered ? 0 : 1, y: hovered ? 4 : 0 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
      >
        {tag && (
          <span
            className="text-xs font-semibold tracking-wide uppercase mb-2 block"
            style={{ color: accentColor }}
          >
            {tag}
          </span>
        )}
        <h3 className="text-base font-bold text-neutral-900 leading-snug line-clamp-2">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-2">{subtitle}</p>
        )}
      </motion.div>

      {/* Hover reveal panel — separate enter/exit transitions so hover-off is smooth */}
      <AnimatePresence mode="wait">
        {hovered && (
          <motion.div
            key="panel"
            variants={{
              hidden: { y: "100%", opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: { duration: 0.38, ease: [0.23, 1, 0.32, 1] },
              },
              exit: {
                y: "100%",
                opacity: 0,
                transition: { duration: 0.44, ease: [0.4, 0, 0.6, 1] },
              },
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 flex flex-col justify-between px-5 pt-5 pb-5"
            style={{
              background: "linear-gradient(160deg,#f8f8ff 0%,#eef0ff 100%)",
              borderRadius: "inherit",
            }}
          >
            {/* Accent border glow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.1, duration: 0.25 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ boxShadow: `inset 0 0 0 1.5px ${accentColor}55` }}
            />

            <div>
              {tag && (
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.05, duration: 0.25 } }}
                  exit={{ opacity: 0, y: 4, transition: { duration: 0.18 } }}
                  className="text-xs font-semibold tracking-wide uppercase mb-3 block"
                  style={{ color: accentColor }}
                >
                  {tag}
                </motion.span>
              )}

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.08, duration: 0.28 } }}
                exit={{ opacity: 0, y: 6, transition: { duration: 0.2 } }}
                className="text-base font-bold text-neutral-900 leading-snug mb-3"
              >
                {title}
              </motion.h3>

              {description && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.12, duration: 0.28 } }}
                  exit={{ opacity: 0, transition: { duration: 0.18 } }}
                  className="text-sm text-neutral-600 leading-relaxed"
                >
                  {description}
                </motion.p>
              )}

              {ctaText && (
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.18, duration: 0.25 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="inline-block mt-4 text-sm font-semibold"
                  style={{ color: accentColor }}
                >
                  {ctaText}
                </motion.span>
              )}
            </div>

            {subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5, transition: { delay: 0.22, duration: 0.25 } }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="text-xs text-neutral-500 mt-4"
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Tag>
  );
}
