'use client';

import { Suspense } from 'react';
import { WorkspaceSelector } from '@/components/workspace-selector';
import { CollectionTable } from '@/components/collection-table';
import { useSyncUrlState } from '@/hooks/use-sync-url-state';
import { Separator } from '@/components/ui/separator';
import { useWorkspaceStore } from '@/lib/store';
import { PostmanSettings } from '@/components/postman-settings';

function AppContent() {
  useSyncUrlState();
  const hasHydrated = useWorkspaceStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-muted-foreground">Initializing...</div>
      </div>
    );
  }

  return (
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

        {/* Workspace Selection Area */}
        <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Workspace</h2>
            <p className="text-sm text-muted-foreground">
              Select a workspace from the list or paste a URL directly.
            </p>
          </div>
          <WorkspaceSelector />
        </div>

        <Separator />

        {/* Collections Table Area */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Collections</h2>
              <p className="text-sm text-muted-foreground">
                A list of all collections available in the selected workspace.
              </p>
            </div>
          </div>
          <CollectionTable />
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <AppContent />
    </Suspense>
  );
}
