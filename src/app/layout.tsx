import type { Metadata } from "next";
import "./globals.css";
import { ThemeInitializer } from "@/theme/theme-initializer";

export const metadata: Metadata = {
  title: {
    default: "Conyva",
    template: "%s | Conyva",
  },
  description: "Conyva — talk, learn, and connect in one place.",
  metadataBase: new URL("https://conyva.app"),
  alternates: { canonical: "https://conyva.app" },
  openGraph: {
    title: "Conyva",
    description: "Talk, learn, and connect with Conyva.",
    url: "https://conyva.app",
    siteName: "Conyva",
    type: "website",
  },
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
