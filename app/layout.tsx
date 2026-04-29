import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { PostmanSettings } from "@/components/postman-settings";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <Providers>
          <main className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-12 md:px-8">
            <div className="max-w-6xl mx-auto space-y-12">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4 text-left">
                  <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Postman Downloader
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    Manage and download your Postman collections with ease.
                  </p>
                </div>
                <PostmanSettings />
              </div>
              {children}
            </div>
          </main>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
