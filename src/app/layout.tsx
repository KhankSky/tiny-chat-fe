import type { Metadata } from "next";
import "./globals.css";
import { ThemeInitializer } from "@/theme/theme-initializer";

export const metadata: Metadata = {
  title: {
    default: "Tiny Chat",
    template: "%s | Tiny Chat",
  },
  description: "A clean front-end foundation for Tiny Chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-slate-950 text-white">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
