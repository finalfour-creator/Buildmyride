import { Geist, Geist_Mono, Barlow_Condensed, Inter } from "next/font/google";
import { SessionProvider } from "../providers/SessionProvider";
import ThemeRegistry from "../providers/ThemeRegistry";
import ReduxProvider from "../providers/ReduxProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata = {
  title: "BuildMyRide",
  description: "Build your dream ride!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${barlow.variable} ${inter.variable} antialiased`}
      >
        <ReduxProvider>
          <ThemeRegistry>
            <SessionProvider>{children}</SessionProvider>
          </ThemeRegistry>
        </ReduxProvider>
      </body>
    </html>
  );
}
