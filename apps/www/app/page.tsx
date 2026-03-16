"use client";

import { motion } from "motion/react";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { TiltCard } from "@/components/ui/3d-tilt-card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { FloatingDock } from "@/components/ui/floating-dock";
import { ParticleField } from "@/components/ui/particle-field";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/contexts/theme-context";
import { useState } from "react";
import {
  Check,
  Copy,
  Terminal,
  Ghost,
  Sparkles,
  Layers,
  ScrollText,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Home() {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const copyCommand = () => {
    navigator.clipboard.writeText("npx uniqueui init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.main
      className={cn(
        "flex min-h-screen flex-col items-center selection:bg-purple-500/30 overflow-x-hidden",
        isDark ? "text-white" : "text-neutral-900"
      )}
      initial={false}
      animate={{
        backgroundColor: isDark ? "#0a0a0a" : "#fafafa",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Background Gradient */}
      <div
        className={cn(
          "fixed inset-0 z-0 h-full w-full items-center px-5 py-24 pointer-events-none",
          isDark
            ? "[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-20"
            : "[background:radial-gradient(125%_125%_at_50%_10%,#e0e0e0_40%,#c4b5fd_100%)] opacity-30"
        )}
      />

      {/* Header */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex p-4 md:p-8 pt-8 relative">
        <p
          className={cn(
            "fixed left-0 top-0 flex w-full justify-center border-b backdrop-blur-md pb-6 pt-8 font-bold lg:static lg:w-auto lg:rounded-xl lg:border lg:p-4 z-50 lg:z-auto",
            isDark
              ? "border-neutral-800 bg-neutral-950/50 text-neutral-400 lg:bg-neutral-900/30"
              : "border-neutral-200 bg-white/80 text-neutral-500 lg:bg-neutral-100/80"
          )}
        >
          UniqueUI &nbsp;
          <span className={cn("font-normal", isDark ? "text-neutral-500" : "text-neutral-600")}>v1.0.0</span>
        </p>
        <div
          className={cn(
            "fixed bottom-0 left-0 flex h-48 w-full items-end justify-center lg:static lg:h-auto lg:w-auto lg:bg-none z-50 lg:z-auto pointer-events-none lg:pointer-events-auto",
            isDark ? "bg-gradient-to-t from-black via-black" : "bg-gradient-to-t from-neutral-100 via-neutral-50"
          )}
        >
            <div className="pointer-events-auto flex items-center gap-6 p-8 lg:p-0">
                <ThemeToggle className="shrink-0" />
                <Link
                  href="/components"
                  className={cn(
                    "font-semibold transition-colors",
                    isDark ? "text-white hover:text-purple-400" : "text-neutral-900 hover:text-purple-600"
                  )}
                >
                    Components
                </Link>
                <a
                    className={cn(
                      "flex place-items-center gap-2 transition-colors",
                      isDark ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-neutral-900"
                    )}
                    href="https://github.com/pras75299/uniqueui"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </a>
            </div>
        </div>
      </div>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center mt-28 lg:mt-20 px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span
            className={cn(
              "px-3 py-1 rounded-full border text-xs mb-6 inline-block",
              isDark ? "bg-neutral-900 border-neutral-800 text-neutral-400" : "bg-neutral-100 border-neutral-200 text-neutral-600"
            )}
          >
            Beta Release 0.1.0
          </span>
          <h1
            className={cn(
              "text-5xl md:text-7xl lg:text-8xl font-bold bg-clip-text text-transparent tracking-tight mb-6",
              isDark ? "bg-gradient-to-b from-white to-neutral-500" : "bg-gradient-to-b from-neutral-900 to-neutral-600"
            )}
          >
            Build Interfaces <br />That Stand Out.
          </h1>
          <div
            className={cn(
              "mt-2 mb-10 text-lg md:text-xl max-w-2xl mx-auto flex items-center justify-center gap-2 flex-wrap",
              isDark ? "text-neutral-400" : "text-neutral-600"
            )}
          >
            <span>Beautiful, animated</span>
            <TypewriterText
              words={["components", "buttons", "cards", "modals", "backgrounds"]}
              className="text-purple-400 font-semibold"
            />
            <span>for modern web apps.</span>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center gap-4 mb-16">
            <Link href="/components">
                <button className="px-8 py-3.5 rounded-full bg-white text-black font-bold hover:bg-neutral-200 transition-colors flex items-center gap-2">
                    Browse Components <ArrowRight className="w-4 h-4" />
                </button>
            </Link>
            
            <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative group"
            >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
            <div
              className={cn(
                "relative flex items-center rounded-full leading-none",
                isDark ? "bg-black" : "bg-neutral-800"
              )}
            >
                <div className="flex items-center px-6 py-3.5">
                <Terminal className={cn("w-4 h-4 mr-3", isDark ? "text-neutral-400" : "text-neutral-500")} />
                <code className={cn("font-mono text-sm", isDark ? "text-neutral-300" : "text-neutral-200")}>
                    npx uniqueui init
                </code>
                </div>
                <button
                onClick={copyCommand}
                className={cn(
                  "p-3.5 rounded-r-full transition-colors border-l",
                  isDark ? "hover:bg-neutral-900 border-neutral-800" : "hover:bg-neutral-700 border-neutral-600"
                )}
                >
                {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                ) : (
                    <Copy className="w-4 h-4 text-neutral-400" />
                )}
                </button>
            </div>
            </motion.div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="z-10 grid text-center lg:max-w-5xl lg:w-full lg:grid-cols-3 lg:text-left gap-6 px-4 mb-32">
        <Card theme={theme}
          title="Install"
          description="Get started quickly by installing our CLI tool globally on your machine."
          icon={<Terminal className="w-6 h-6" />}
        />
        <Card theme={theme}
          title="Add Components"
          description="Add components to your project with a single command. No complex setup."
          icon={<Ghost className="w-6 h-6" />}
        />
        <Card theme={theme}
          title="Customizable"
          description="Built on top of Tailwind CSS and Motion.dev. Fully customizable and accessible."
          icon={<Sparkles className="w-6 h-6" />}
        />
      </div>

      {/* Featured Preview Section */}
      <div className="w-full max-w-6xl px-4 relative z-10 space-y-24 mb-32">
        <div className="text-center space-y-4">
             <h2 className="text-3xl md:text-5xl font-bold">Featured Components</h2>
             <p className={cn("max-w-2xl mx-auto", isDark ? "text-neutral-400" : "text-neutral-600")}>
                A glimpse of what you can build. Check the documentation for the full library.
             </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SpotlightCard theme={theme} className="h-64 flex flex-col justify-center items-center text-center">
                 <h3 className="text-2xl font-bold mb-2">Spotlight Card</h3>
                 <p className={isDark ? "text-neutral-400" : "text-neutral-600"}>Interactive lighting effect that follows your mouse.</p>
            </SpotlightCard>
            
            <TiltCard theme={theme} className={cn("h-64 p-8 flex flex-col justify-center items-center text-center border", isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-neutral-100/80 border-neutral-200")}>
                 <h3 className="text-2xl font-bold mb-2">3D Tilt</h3>
                 <p className={isDark ? "text-neutral-400" : "text-neutral-600"}>Parallax hover effects that add depth to your UI.</p>
            </TiltCard>
        </div>
        <div className="flex justify-center">
             <FloatingDock theme={theme}
                items={[
                  { id: "home", icon: <Ghost className="w-5 h-5" />, label: "Home" },
                  { id: "search", icon: <Sparkles className="w-5 h-5" />, label: "Search" },
                  { id: "layers", icon: <Layers className="w-5 h-5" />, label: "Layers" },
                  { id: "scroll", icon: <ScrollText className="w-5 h-5" />, label: "Scroll" },
                  { id: "terminal", icon: <Terminal className="w-5 h-5" />, label: "Terminal" },
                ]}
              />
        </div>

        <div
            className={cn(
              "w-full h-80 relative rounded-2xl overflow-hidden border mt-16 group",
              isDark ? "border-neutral-800 bg-black" : "border-neutral-200 bg-neutral-800"
            )}
          >
             <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center p-6 text-center">
                 <h3
                   className={cn(
                     "text-3xl font-bold bg-clip-text text-transparent mb-2",
                     isDark ? "bg-gradient-to-b from-white to-neutral-500" : "bg-gradient-to-b from-neutral-100 to-neutral-400"
                   )}
                 >
                   Particle Field
                 </h3>
                 <p className={isDark ? "text-neutral-400" : "text-neutral-400"}>Physics-based particle system with mouse interaction. Hover me!</p>
             </div>
             <ParticleField theme={theme}
                particleCount={150}
                particleColor="#a855f7"
                speed={0.5}
                className="opacity-50 group-hover:opacity-100 transition-opacity duration-700"
             />
        </div>

         <div className="flex justify-center mt-16">
            <Link href="/components">
                <div className={cn(
                      "group relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-offset-2",
                      isDark ? "focus:ring-slate-400 focus:ring-offset-slate-50" : "focus:ring-slate-500 focus:ring-offset-white"
                    )}>
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <span
                      className={cn(
                        "inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full px-8 py-1 text-sm font-medium backdrop-blur-3xl transition-colors",
                        isDark ? "bg-slate-950 text-white hover:bg-slate-900" : "bg-white text-slate-900 hover:bg-slate-100"
                      )}
                    >
                    Explore All Components
                    </span>
                </div>
            </Link>
        </div>

      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl mt-12 mb-16 px-4 relative z-10">
        <div
          className={cn(
            "border-t pt-8 text-center text-sm",
            isDark ? "border-neutral-800 text-neutral-500" : "border-neutral-200 text-neutral-600"
          )}
        >
          <p>
            Built with ❤️ by{" "}
            <a
              href="https://github.com/pras75299"
              className={cn("transition-colors", isDark ? "text-neutral-300 hover:text-white" : "text-neutral-700 hover:text-neutral-900")}
            >
              Prashant
            </a>
          </p>
          <div className="mt-4 flex justify-center gap-6">
             <Link href="/components" className={cn("transition-colors", isDark ? "hover:text-white" : "hover:text-neutral-900")}>Documentation</Link>
             <a href="https://github.com/pras75299/uniqueui" className={cn("transition-colors", isDark ? "hover:text-white" : "hover:text-neutral-900")}>GitHub</a>
             <a href="https://twitter.com" className={cn("transition-colors", isDark ? "hover:text-white" : "hover:text-neutral-900")}>Twitter</a>
          </div>
        </div>
      </footer>
    </motion.main>
  );
}

/* ─── Feature Card ─── */
function Card({
  title,
  description,
  icon,
  theme = "dark",
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        "group rounded-lg border px-5 py-8 transition-colors",
        isDark
          ? "border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 hover:bg-neutral-900/50"
          : "border-neutral-200 bg-white/60 hover:border-neutral-300 hover:bg-white/80"
      )}
    >
      <div
        className={cn(
          "mb-4 inline-block rounded-lg p-3",
          isDark ? "bg-neutral-900 text-neutral-200 group-hover:text-white" : "bg-neutral-100 text-neutral-700 group-hover:text-neutral-900"
        )}
      >
        {icon}
      </div>
      <h2 className="mb-3 text-2xl font-semibold">
        {title}{" "}
        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
          -&gt;
        </span>
      </h2>
      <p className={cn("m-0 max-w-[30ch] text-sm", isDark ? "opacity-50" : "text-neutral-600")}>{description}</p>
    </motion.div>
  );
}
