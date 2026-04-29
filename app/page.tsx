"use client"

import { Suspense } from "react"
import { PageSkeleton } from "@/components/skeleton/page-skeleton"
import { HomeContent } from "@/components/Home/Home"

export default function Home() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomeContent />
    </Suspense>
  )
}
