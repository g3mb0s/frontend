import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth/context";
import "vidstack/styles/base.css";
import "vidstack/styles/ui/buttons.css";
import "vidstack/styles/ui/sliders.css";
import "vidstack/styles/ui/captions.css";
import "vidstack/styles/ui/menus.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gembos",
  description: "Gembos frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
