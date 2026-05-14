import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-context";

export const metadata: Metadata = {
  title: "UniqueUI",
  description: "UniqueUI - A collection of unique and modern React components",
  openGraph: {
    title: "UniqueUI",
    description:
      "UniqueUI - A collection of unique and modern React components",
    images: [{ url: "/brand/uniqueui-wordmark.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UniqueUI",
    description:
      "UniqueUI - A collection of unique and modern React components",
    images: ["/brand/uniqueui-wordmark.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Script id="theme-init" src="/theme-init.js" strategy="beforeInteractive" />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
