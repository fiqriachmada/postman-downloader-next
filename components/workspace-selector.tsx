'use client';

import * as React from 'react';
import { WorkspaceInput } from './workspace-input';
import { QuickSelect } from './quick-select';
import { EditWorkspaceDialog } from './edit-workspace-dialog';
import { SavedWorkspace } from '@/lib/store';

export function WorkspaceSelector() {
  const [editingWorkspace, setEditingWorkspace] = React.useState<SavedWorkspace | null>(null);

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      {/* 1. Input Section */}
      <WorkspaceInput />

      {/* 2. Selection Section */}
      <QuickSelect onEdit={setEditingWorkspace} />

      {/* 3. Dialogs Section */}
      <EditWorkspaceDialog 
        workspace={editingWorkspace} 
        onClose={() => setEditingWorkspace(null)} 
      />
    </div>
  );
}
