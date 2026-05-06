"use client";

import type { FintechThemeTokens } from "../components/theme";
import { cn } from "@/lib/utils";
import { Reveal } from "../components/reveal";

function DropboxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M6 2 0 6l6 4 6-4-6-4zm12 0-6 4 6 4 6-4-6-4zM0 14l6 4 6-4-6-4-6 4zm18-4-6 4 6 4 6-4-6-4zM6 19l6 4 6-4-6-4-6 4z" />
    </svg>
  );
}
function AirbnbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.6c-1 0-1.8.5-2.3 1.4L1.6 18.5c-.3.6-.4 1.2-.4 1.8 0 1.7 1.3 3 3 3 1 0 1.7-.4 2.6-1.3l5.2-5 5.2 5c.9.9 1.6 1.3 2.6 1.3 1.7 0 3-1.3 3-3 0-.6-.1-1.2-.4-1.8L14.3 4c-.5-.9-1.3-1.4-2.3-1.4zm0 2.4c.4 0 .8.2 1 .7l7.7 14.2c.1.2.2.5.2.8 0 .7-.5 1.2-1.2 1.2-.4 0-.7-.1-1.2-.6L12 14.7l-6.5 6.6c-.5.5-.8.6-1.2.6-.7 0-1.2-.5-1.2-1.2 0-.3.1-.6.2-.8L11 5.7c.2-.5.6-.7 1-.7z" />
    </svg>
  );
}
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 .5C5.6.5.4 5.7.4 12.1c0 5.1 3.3 9.4 7.9 11 .6.1.8-.2.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6 4.6-1.6 7.9-5.9 7.9-11C23.6 5.7 18.4.5 12 .5z" />
    </svg>
  );
}

const logos = [
  { Icon: DropboxIcon, name: "Dropbox", className: "font-bold" },
  { Icon: AirbnbIcon, name: "airbnb", className: "font-bold lowercase italic tracking-tight" },
  { Icon: GitHubIcon, name: "GitHub", className: "font-semibold" },
  { Icon: null, name: "NETFLIX", className: "font-extrabold tracking-[0.2em]" },
  { Icon: null, name: "HBO", className: "font-black tracking-tight" },
];

export default function LogoStrip({ tokens }: { tokens: FintechThemeTokens }) {
  return (
    <section className="py-4 sm:py-6">
      <Reveal className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 sm:justify-between sm:px-6">
        {logos.map(({ Icon, name, className }) => (
          <span
            key={name}
            className={cn(
              "flex select-none items-center gap-2 text-[20px] opacity-60 transition-opacity hover:opacity-100",
              tokens.textSubtle,
              className,
            )}
          >
            {Icon ? <Icon className="h-5 w-5" /> : null}
            {name}
          </span>
        ))}
      </Reveal>
    </section>
  );
}
