'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/store';

export function useSyncUrlState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workspaceId, loadWorkspace, hasHydrated } = useWorkspaceStore();
  const urlWorkspaceId = searchParams.get('workspaceId');
  
  // Track if we are currently updating the URL to prevent re-syncing from it
  const isUpdatingUrl = useRef(false);

  // 1. Initial Sync: Only on mount (after hydration)
  const hasInitiallySynced = useRef(false);
  useEffect(() => {
    if (hasHydrated && !hasInitiallySynced.current) {
      if (urlWorkspaceId && urlWorkspaceId !== workspaceId) {
        loadWorkspace(urlWorkspaceId);
      }
      hasInitiallySynced.current = true;
    }
  }, [hasHydrated, urlWorkspaceId, workspaceId, loadWorkspace]);

  // 2. Sync Store to URL: Only when workspaceId changes
  useEffect(() => {
    if (!hasHydrated || !hasInitiallySynced.current) return;

    if (workspaceId !== urlWorkspaceId) {
      isUpdatingUrl.current = true;
      const params = new URLSearchParams(searchParams.toString());
      if (workspaceId) {
        params.set('workspaceId', workspaceId);
      } else {
        params.delete('workspaceId');
      }
      
      const newPath = `/?${params.toString()}`;
      router.replace(newPath, { scroll: false });
      
      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingUrl.current = false;
      }, 300); // Slightly longer delay to be safe
    }
  }, [workspaceId, router, searchParams, hasHydrated, urlWorkspaceId]);

  // 3. Sync URL to Store: Handle external changes (Back/Forward)
  useEffect(() => {
    if (!hasHydrated || !hasInitiallySynced.current || isUpdatingUrl.current) return;

    if (urlWorkspaceId !== workspaceId) {
      loadWorkspace(urlWorkspaceId || '');
    }
  }, [urlWorkspaceId, workspaceId, loadWorkspace, hasHydrated]);
}
