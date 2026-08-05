import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { ThemeInitializer } from "@/theme/theme-initializer";

export const metadata: Metadata = {
  title: {
    default: "Conyva - Luyện ngôn ngữ qua trò chuyện",
    template: "%s | Conyva",
  },
  description:
    "Conyva là nền tảng trò chuyện giúp người dùng luyện ngôn ngữ, kết nối cộng đồng và nhận hỗ trợ trong quá trình học.",
  metadataBase: new URL("https://conyva.app"),
  openGraph: {
    title: "Conyva - Luyện ngôn ngữ qua trò chuyện",
    description:
      "Conyva là nền tảng trò chuyện giúp người dùng luyện ngôn ngữ, kết nối cộng đồng và nhận hỗ trợ trong quá trình học.",
    url: "https://conyva.app",
    siteName: "Conyva",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const requestLocale = requestHeaders.get("x-conyva-locale");
  const locale = isLocale(requestLocale) ? requestLocale : DEFAULT_LOCALE;

  return (
    <html lang={locale} className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full bg-slate-950 text-white">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
