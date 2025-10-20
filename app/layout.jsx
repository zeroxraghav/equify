import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Toaster } from "sonner";

const inter = Inter({subsets: ["latin"]});

export const metadata = {
  title: "WhoPay",
  description: "Next Gen Splitwise",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logos/logo-s.png" />
      </head>
      <body
        className={`${inter.className} antialiased`}
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
              <Toaster richColors />
            </main>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
