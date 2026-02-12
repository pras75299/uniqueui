"use client";

import { motion } from "motion/react";
import { TypewriterText } from "@/components/ui/typewriter-text";
import { TiltCard } from "@/components/ui/3d-tilt-card";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { FloatingDock } from "@/components/ui/floating-dock";
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
import { ScrambleText } from "@/components/ui/scramble-text";

export default function Home() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("npm i -g uniqueui-cli && uniqueui init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-neutral-950 text-white selection:bg-purple-500/30 overflow-x-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex p-4 md:p-8 pt-8 relative">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md pb-6 pt-8 font-bold text-neutral-400 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-neutral-900/30 lg:p-4 z-50 lg:z-auto">
          UniqueUI &nbsp;
          <span className="font-normal text-neutral-500">v1.0.0</span>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-black via-black lg:static lg:h-auto lg:w-auto lg:bg-none z-50 lg:z-auto pointer-events-none lg:pointer-events-auto">
            <div className="pointer-events-auto flex items-center gap-6 p-8 lg:p-0">
                <Link href="/components" className="text-white hover:text-purple-400 font-semibold transition-colors">
                    Components
                </Link>
                <a
                    className="flex place-items-center gap-2 text-neutral-400 hover:text-white transition-colors"
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
          <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 mb-6 inline-block">
            Beta Release 0.1.0
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500 tracking-tight mb-6">
            Build Interfaces <br />That Stand Out.
          </h1>
          <div className="mt-2 mb-10 text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto flex items-center justify-center gap-2 flex-wrap">
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
            <div className="relative flex items-center bg-black rounded-full leading-none">
                <div className="flex items-center px-6 py-3.5">
                <Terminal className="w-4 h-4 mr-3 text-neutral-400" />
                <code className="font-mono text-sm text-neutral-300">
                    npx uniqueui init
                </code>
                </div>
                <button
                onClick={copyCommand}
                className="p-3.5 hover:bg-neutral-900 rounded-r-full transition-colors border-l border-neutral-800"
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
        <Card
          title="Install"
          description="Get started quickly by installing our CLI tool globally on your machine."
          icon={<Terminal className="w-6 h-6" />}
        />
        <Card
          title="Add Components"
          description="Add components to your project with a single command. No complex setup."
          icon={<Ghost className="w-6 h-6" />}
        />
        <Card
          title="Customizable"
          description="Built on top of Tailwind CSS and Motion.dev. Fully customizable and accessible."
          icon={<Sparkles className="w-6 h-6" />}
        />
      </div>

      {/* Featured Preview Section */}
      <div className="w-full max-w-6xl px-4 relative z-10 space-y-24 mb-32">
        <div className="text-center space-y-4">
             <h2 className="text-3xl md:text-5xl font-bold">Featured Components</h2>
             <p className="text-neutral-400 max-w-2xl mx-auto">
                A glimpse of what you can build. Check the documentation for the full library.
             </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SpotlightCard className="h-64 flex flex-col justify-center items-center text-center">
                 <h3 className="text-2xl font-bold mb-2">Spotlight Card</h3>
                 <p className="text-neutral-400">Interactive lighting effect that follows your mouse.</p>
            </SpotlightCard>
            
            <TiltCard className="h-64 bg-neutral-900/50 border border-neutral-800 p-8 flex flex-col justify-center items-center text-center">
                 <h3 className="text-2xl font-bold mb-2">3D Tilt</h3>
                 <p className="text-neutral-400">Parallax hover effects that add depth to your UI.</p>
            </TiltCard>
        </div>

        <div className="flex justify-center">
             <FloatingDock
                items={[
                  { id: "home", icon: <Ghost className="w-5 h-5" />, label: "Home" },
                  { id: "search", icon: <Sparkles className="w-5 h-5" />, label: "Search" },
                  { id: "layers", icon: <Layers className="w-5 h-5" />, label: "Layers" },
                  { id: "scroll", icon: <ScrollText className="w-5 h-5" />, label: "Scroll" },
                  { id: "terminal", icon: <Terminal className="w-5 h-5" />, label: "Terminal" },
                ]}
              />
        </div>

         <div className="flex justify-center">
            <Link href="/components">
                <div className="group relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl transition-colors hover:bg-slate-900">
                    Explore All Components
                    </span>
                </div>
            </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl mt-12 mb-16 px-4 relative z-10">
        <div className="border-t border-neutral-800 pt-8 text-center text-neutral-500 text-sm">
          <p>
            Built with ❤️ by{" "}
            <a href="https://github.com/pras75299" className="text-neutral-300 hover:text-white transition-colors">
              Prashant
            </a>
          </p>
          <div className="mt-4 flex justify-center gap-6">
             <Link href="/components" className="hover:text-white transition-colors">Documentation</Link>
             <a href="https://github.com/pras75299/uniqueui" className="hover:text-white transition-colors">GitHub</a>
             <a href="https://twitter.com" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ─── Feature Card ─── */
function Card({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group rounded-lg border border-neutral-800 bg-neutral-950/50 px-5 py-8 transition-colors hover:border-neutral-700 hover:bg-neutral-900/50"
    >
      <div className="mb-4 inline-block rounded-lg bg-neutral-900 p-3 text-neutral-200 group-hover:text-white">
        {icon}
      </div>
      <h2 className="mb-3 text-2xl font-semibold">
        {title}{" "}
        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
          -&gt;
        </span>
      </h2>
      <p className="m-0 max-w-[30ch] text-sm opacity-50">{description}</p>
    </motion.div>
  );
}
