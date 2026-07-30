import type { Metadata } from "next";
import "./globals.css";
import { ThemeInitializer } from "@/theme/theme-initializer";

export const metadata: Metadata = {
  title: {
    default: "Conyva - Luyện ngôn ngữ qua trò chuyện",
    template: "%s | Conyva",
  },
  description:
    "Conyva là nền tảng trò chuyện giúp người dùng luyện ngôn ngữ, kết nối cộng đồng và nhận hỗ trợ trong quá trình học.",
  metadataBase: new URL("https://conyva.app"),
  alternates: { canonical: "https://conyva.app" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Conyva - Luyện ngôn ngữ qua trò chuyện",
    description:
      "Conyva là nền tảng trò chuyện giúp người dùng luyện ngôn ngữ, kết nối cộng đồng và nhận hỗ trợ trong quá trình học.",
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
