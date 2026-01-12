"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/moving-border";
import { useState } from "react";
import { Check, Copy, Ghost, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText("npm i -g uniqueui-cli && uniqueui init");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24 bg-neutral-950 text-white selection:bg-purple-500/30">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-20 pointer-events-none" />

      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-neutral-800 bg-neutral-950/50 backdrop-blur-md pb-6 pt-8 font-bold text-neutral-400 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-neutral-900/30 lg:p-4">
          UniqueUI &nbsp;
          <span className="font-normal text-neutral-500">v1.0.0</span>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-black via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0 text-neutral-400 hover:text-white transition-colors"
            href="https://github.com/pras75299/uniqueui"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <span className="font-bold text-lg text-white">Prashant</span>
          </a>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center mt-20 lg:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 mb-6 inline-block">
            Beta Release 0.1.0
          </span>
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500 tracking-tight mb-6">
            Build Interfaces <br /> That Stand Out.
          </h1>
          <p className="mt-4 text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            A collection of modern, Framer Motion powered components for building
            premium web applications. Copy, paste, and ship.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <div className="relative flex items-center bg-black rounded-lg leading-none">
            <div className="flex items-center px-6 py-4">
              <Terminal className="w-5 h-5 mr-3 text-neutral-400" />
              <code className="font-mono text-sm text-neutral-300">
                npm i -g uniqueui-cli && uniqueui init
              </code>
            </div>
            <button
              onClick={copyCommand}
              className="p-4 hover:bg-neutral-900 rounded-r-lg transition-colors border-l border-neutral-800"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-neutral-400" />
              )}
            </button>
          </div>
        </motion.div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left gap-8 mt-24">
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
          icon={<Terminal className="w-6 h-6" />}
        />
      </div>

      <div className="w-full max-w-5xl mt-32 relative z-10">
        <h2 className="text-3xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
          Component Showcase
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px]">
            <h3 className="text-xl font-semibold mb-8 text-neutral-300">Moving Border</h3>
            <Button
              borderRadius="1.75rem"
              className="bg-transparent text-white border-neutral-200 dark:border-slate-800"
            >
              Click me
            </Button>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden relative group">
             <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900/50">
               <div className="text-xs text-neutral-400 font-medium">Usage Code</div>
               <button
                  onClick={() => {
                    navigator.clipboard.writeText(`// Add to your project
uniqueui add moving-border

// Use in your code
import { Button } from "@/components/ui/moving-border";

<Button>
  Click me
</Button>`);
                    // Optional: You could reuse the copied state logic here if refactored or simply show distinct feedback
                    alert("Copied to clipboard!");
                  }}
                  className="text-xs text-neutral-500 hover:text-white transition-colors flex items-center gap-1"
               >
                 <Copy className="w-3 h-3" /> Copy
               </button>
             </div>
             <div className="p-6 overflow-x-auto">
               <pre className="text-sm text-neutral-400 font-mono leading-relaxed">
                 {`// Add to your project
uniqueui add moving-border

// Use in your code
import { Button } from "@/components/ui/moving-border";

<Button>
  Click me
</Button>`}
               </pre>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}

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
      <h2 className={`mb-3 text-2xl font-semibold`}>
        {title}{" "}
        <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
          -&gt;
        </span>
      </h2>
      <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>{description}</p>
    </motion.div>
  );
}
