'use client';

import { Suspense } from 'react';
import { WorkspaceSelector } from '@/components/workspace-selector';
import { CollectionTable } from '@/components/collection-table';
import { useSyncUrlState } from '@/hooks/use-sync-url-state';
import { Separator } from '@/components/ui/separator';
import { useWorkspaceStore } from '@/lib/store';
import { PageSkeleton } from '@/components/skeleton/page-skeleton';

function AppContent() {
  useSyncUrlState();
  const hasHydrated = useWorkspaceStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return <PageSkeleton />;
  }

  return (
    <>
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
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AppContent />
    </Suspense>
  );
}
