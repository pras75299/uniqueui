"use client";

import { useState, type ReactNode, useId } from "react";
import { motion, AnimatePresence, LayoutGroup, type PanInfo } from "motion/react";
import { cn } from "@/lib/utils";
import { Grid3X3, Layers, LayoutList } from "lucide-react";

export type LayoutMode = "stack" | "grid" | "list";

export interface CardData {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  color?: string;
  stackPosition?: number;
}

export interface MorphingCardStackProps {
  cards?: CardData[];
  className?: string;
  defaultLayout?: LayoutMode;
  onCardClick?: (card: CardData) => void;
}

const layoutIcons = {
  stack: Layers,
  grid: Grid3X3,
  list: LayoutList,
};

const SWIPE_THRESHOLD = 50;

/**
 * An interactive collection of cards that smoothly layout-morphs between 
 * Stack, Grid, and List configurations using Framer Motion springs.
 */
export function MorphingCardStack({
  cards = [],
  className,
  defaultLayout = "stack",
  onCardClick,
}: MorphingCardStackProps) {
  const [layout, setLayout] = useState<LayoutMode>(defaultLayout);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Unique ID for layout group to avoid collisions when multiple 
  // instances of this component are on the same page
  const componentId = useId();

  if (!cards || cards.length === 0) {
    return null;
  }

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) * velocity.x;

    if (offset.x < -SWIPE_THRESHOLD || swipe < -1000) {
      // Swiped left - go to next card
      setActiveIndex((prev) => (prev + 1) % cards.length);
    } else if (offset.x > SWIPE_THRESHOLD || swipe > 1000) {
      // Swiped right - go to previous card
      setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }
    setIsDragging(false);
  };

  const getStackOrder = () => {
    const reordered: CardData[] = [];
    for (let i = 0; i < cards.length; i++) {
      const index = (activeIndex + i) % cards.length;
      reordered.push({ ...cards[index], stackPosition: i });
    }
    return reordered.reverse(); // Reverse so top card renders last (on top)
  };

  const getLayoutStyles = (stackPosition: number) => {
    switch (layout) {
      case "stack":
        return {
          top: stackPosition * 8,
          left: stackPosition * 8,
          zIndex: cards.length - stackPosition,
          rotate: (stackPosition - 1) * 2,
        };
      case "grid":
        return {
          top: 0,
          left: 0,
          zIndex: 1,
          rotate: 0,
        };
      case "list":
        return {
          top: 0,
          left: 0,
          zIndex: 1,
          rotate: 0,
        };
    }
  };

  const containerStyles = {
    stack: "relative h-[280px] w-[280px]",
    grid: "grid grid-cols-2 gap-3",
    list: "flex flex-col gap-3",
  };

  const displayCards =
    layout === "stack"
      ? getStackOrder()
      : cards.map((c, i) => ({ ...c, stackPosition: i }));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Layout Toggle */}
      <div className="flex items-center justify-center gap-1 rounded-lg bg-neutral-900/50 border border-neutral-800 p-1 w-fit mx-auto relative z-20">
        {(Object.keys(layoutIcons) as LayoutMode[]).map((mode) => {
          const Icon = layoutIcons[mode];
          return (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setLayout(mode);
                setExpandedCard(null); // Reset expansion on mode change
              }}
              className={cn(
                "rounded-md p-2 transition-all",
                layout === mode
                  ? "bg-neutral-800 text-white shadow-sm"
                  : "text-neutral-500 hover:text-white hover:bg-neutral-800/50"
              )}
              aria-label={`Switch to ${mode} layout`}
              aria-pressed={layout === mode}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* Cards Container */}
      <LayoutGroup id={componentId}>
        <motion.div layout className={cn(containerStyles[layout], "mx-auto")}>
          <AnimatePresence mode="popLayout">
            {displayCards.map((card) => {
              const styles = getLayoutStyles(card.stackPosition!);
              const isExpanded = expandedCard === card.id;
              const isTopCard = layout === "stack" && card.stackPosition === 0;

              return (
                <motion.button
                  key={card.id}
                  layoutId={card.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: isExpanded ? 1.05 : 1,
                    x: 0,
                    ...styles,
                  }}
                  exit={{ opacity: 0, scale: 0.8, x: -200 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    mass: 0.8,
                  }}
                  drag={isTopCard ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                  onClick={() => {
                    if (isDragging) return;
                    setExpandedCard(isExpanded ? null : card.id);
                    onCardClick?.(card);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedCard(isExpanded ? null : card.id);
                      onCardClick?.(card);
                    }
                  }}
                  aria-expanded={isExpanded}
                  className={cn(
                    "relative text-left cursor-pointer rounded-2xl border border-white/10 bg-neutral-950 p-5 shadow-xl outline-none ring-offset-neutral-950 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2",
                    "hover:border-white/20 transition-colors",
                    layout === "stack" && "absolute w-[240px] h-[200px]",
                    layout === "stack" &&
                      isTopCard &&
                      "cursor-grab active:cursor-grabbing",
                    layout === "grid" && "w-full aspect-square",
                    layout === "list" && "w-full",
                    isExpanded && "ring-2 ring-neutral-400 border-transparent z-50 shadow-2xl"
                  )}
                  style={{
                    backgroundColor: card.color || undefined,
                  }}
                >
                  <div className="flex items-start gap-4">
                    {card.icon && (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-900 border border-white/5 text-white">
                        {card.icon}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-white truncate text-base">
                        {card.title}
                      </h3>
                      <p
                        className={cn(
                          "text-sm text-neutral-400 mt-1.5 leading-relaxed",
                          layout === "stack" && (isExpanded ? "" : "line-clamp-3"),
                          layout === "grid" && "line-clamp-2",
                          layout === "list" && "line-clamp-2"
                        )}
                      >
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {isTopCard && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute bottom-3 left-0 right-0 text-center pointer-events-none"
                    >
                      <span className="text-xs font-medium text-neutral-500 bg-neutral-900/80 px-2 py-1 rounded-full border border-white/5">
                        Swipe to flip
                      </span>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {/* Pagination Indicators */}
      {layout === "stack" && cards.length > 1 && (
        <div className="flex justify-center gap-2 mt-4 relative z-20">
          {cards.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === activeIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-neutral-700 hover:bg-neutral-500"
              )}
              aria-label={`Go to card ${index + 1}`}
              aria-pressed={index === activeIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
}
