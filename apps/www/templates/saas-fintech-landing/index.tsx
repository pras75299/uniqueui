"use client";

import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import Nav from "./sections/nav";
import Hero from "./sections/hero";
import LogoStrip from "./sections/logo-strip";
import PaymentsFeature from "./sections/payments-feature";
import SecurityFeature from "./sections/security-feature";
import FeaturesGrid from "./sections/features-grid";
import Faq from "./sections/faq";
import FinalCta from "./sections/final-cta";
import Footer from "./sections/footer";
import { ScrollProgress } from "./components/scroll-progress";
import { getFintechThemeTokens } from "./components/theme";

export default function SaasFintechLanding() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const tokens = getFintechThemeTokens(isDark);

  return (
    <div
      className={cn(
        "min-h-screen font-sans antialiased transition-colors duration-300",
        tokens.pageBg,
        tokens.text,
      )}
    >
      <ScrollProgress tokens={tokens} />
      <Nav tokens={tokens} />
      <Hero tokens={tokens} />
      <LogoStrip tokens={tokens} />
      <PaymentsFeature tokens={tokens} />
      <SecurityFeature tokens={tokens} />
      <FeaturesGrid tokens={tokens} />
      <Faq tokens={tokens} />
      <FinalCta tokens={tokens} />
      <Footer tokens={tokens} />
    </div>
  );
}
