import type { Metadata } from "next";
import "./globals.css";

import { SiteHeader } from "@/components/navigation/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "NeuroX — Societal Innovation Collaboration Platform",
  description: "A collaboration platform for turning community challenges into shared progress.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className="h-full">
      <body className="min-h-full font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <SiteHeader />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
