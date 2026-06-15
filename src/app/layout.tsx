import type { Metadata } from "next";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "./globals.css";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";
import ConvexClerkProvider from "@/components/providers/ConvexClerkProvider";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "CodeSync — AI-Powered Remote Interview Platform",
  description:
    "Conduct seamless technical interviews with real-time video, collaborative code editing, and AI-powered candidate assessment. Built for modern hiring teams.",
  keywords: ["interview", "coding", "remote", "video", "AI", "technical hiring"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="font-sans antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SignedIn>
              <div className="min-h-screen">
                <Navbar />
                {/* Animated background pattern */}
                <div className="fixed inset-0 -z-10 dot-pattern opacity-40" />
                <div className="fixed inset-0 -z-10 mesh-gradient" />
                <main className="px-4 sm:px-6 lg:px-8">{children}</main>
              </div>
            </SignedIn>

            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </ThemeProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "hsl(224 64% 7%)",
                color: "hsl(213 31% 91%)",
                border: "1px solid hsl(216 34% 17%)",
                borderRadius: "12px",
              },
            }}
          />
        </body>
      </html>
    </ConvexClerkProvider>
  );
}
