import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Soft Target",
  description: "Secure investigation documentation and reporting.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
