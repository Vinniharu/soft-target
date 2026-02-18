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

export const metadata = {
  title: "Soft Target | Investigation & Reporting",
  description: "Secure investigation document generation tool.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <header className="border-b border-[var(--color-border)] bg-[var(--color-secondary)]/30 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-8 bg-[var(--color-primary)]"></div>
              <h1 className="text-xl font-bold tracking-tight uppercase text-red-600">
                Soft Target
              </h1>
            </div>
            <div className="text-xs font-mono text-[var(--color-muted-foreground)]">
              V.1.0 // AUTHORIZED_ACCESS
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs font-mono text-[var(--color-muted-foreground)]">
          SYSTEM_STATUS: ONLINE // SECURE_CONNECTION
        </footer>
      </body>
    </html>
  );
}
