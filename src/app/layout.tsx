import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import Header from "@/components/layout/Header";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { cn } from "@/lib/utils";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const nunitoHeading = Nunito({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kaizen",
  description:
    "Continuous improvement through disciplined workout and habit tracking.",
  applicationName: "Kaizen",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Kaizen",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#1A2237",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("light h-full antialiased", nunito.variable, nunitoHeading.variable)}
      style={{ colorScheme: "light", backgroundColor: "#F8F7F4" }}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <AuthProvider>
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
