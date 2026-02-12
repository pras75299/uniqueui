"use client";

import { componentsList } from "@/config/components";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export default function ComponentsIndex() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Components
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed">
          A collection of beautiful, animated components built with React, Tailwind CSS, and Motion.
          Copy and paste into your apps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {componentsList.map((component, idx) => (
          <Link href={`/components/${component.slug}`} key={component.slug}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.05, 0.3), duration: 0.4 }}
              className="group h-full p-6 rounded-xl border border-neutral-800 bg-neutral-900/20 hover:bg-neutral-900/50 hover:border-neutral-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 group-hover:text-white transition-colors">
                  <component.icon className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-600 group-hover:text-white -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                {component.name}
              </h3>
              <p className="text-sm text-neutral-500 group-hover:text-neutral-400 transition-colors line-clamp-3">
                {component.description}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
