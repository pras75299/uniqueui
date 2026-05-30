// Demo entries for docs previews — merged by `pnpm build:registry`.
// Do not import this file directly from apps/www.

export const demoEntries = {

  ripple: ({ theme = "dark" }) => {
    const isDark = theme === "dark";
    return (
      <div
        className="relative w-full h-[460px] flex items-center justify-center overflow-hidden"
        style={{ background: isDark ? "#0c0608" : "#fdf8f5" }}
      >
        <Ripple
          mainCircleSize={90}
          mainCircleOpacity={isDark ? 0.55 : 0.45}
          numCircles={7}
          duration={10}
        />

        {/* Vignette so text stays readable over animated orbs */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 55% 60% at 50% 50%, rgba(12,6,8,0) 0%, rgba(12,6,8,0.72) 60%, rgba(12,6,8,0.96) 100%)"
              : "radial-gradient(ellipse 55% 60% at 50% 50%, rgba(253,248,245,0) 0%, rgba(253,248,245,0.72) 60%, rgba(253,248,245,0.96) 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center max-w-xs">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 60,
              damping: 20,
              delay: 0.1,
            }}
            className={cn(
              "text-[10px] uppercase tracking-[0.35em]",
              isDark ? "text-rose-300/70" : "text-rose-500/70",
            )}
          >
            Maison de Parfum
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 22,
              delay: 0.28,
            }}
            className={cn(
              "text-[3.4rem] leading-[1] font-light",
              isDark ? "text-white" : "text-stone-900",
            )}
            style={{
              fontFamily: '"Cormorant Garamond", "Garamond", "Georgia", serif',
              fontStyle: "italic",
            }}
          >
            Aurore.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 90,
              damping: 24,
              delay: 0.46,
            }}
            className={cn(
              "text-xs leading-relaxed tracking-wide",
              isDark ? "text-stone-400" : "text-stone-500",
            )}
          >
            A scent composed at the edge of dawn — rose, oud, and liquid amber
            woven into silence.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 26,
              delay: 0.62,
            }}
            className={cn(
              "mt-1 px-7 py-2.5 text-xs tracking-[0.18em] uppercase transition-all duration-300",
              isDark
                ? "border border-rose-300/30 text-rose-200/80 hover:border-rose-300/70 hover:text-rose-100"
                : "border border-rose-400/40 text-rose-700/80 hover:border-rose-500/70 hover:text-rose-800",
            )}
          >
            Discover the collection
          </motion.button>
        </div>
      </div>
    );
  }} as const;
