import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aflah Backer | Software Engineer",
  description:
    "Portfolio of Aflah Backer, a software engineer and engineering lead building backend systems, data pipelines, AWS infrastructure and AI automation.",
  metadataBase: new URL("https://aflah-backer.github.io/My_portfolio/"),
  openGraph: {
    title: "Aflah Backer | Software Engineer",
    description:
      "Backend systems, data pipelines, AWS infrastructure and AI automation.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">{children}</body>
    </html>
  );
}
