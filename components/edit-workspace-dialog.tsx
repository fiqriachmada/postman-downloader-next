'use client';

import * as React from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspaceStore, SavedWorkspace } from '@/lib/store';
import { toast } from 'sonner';

interface EditWorkspaceDialogProps {
  workspace: SavedWorkspace | null;
  onClose: () => void;
}

export function EditWorkspaceDialog({ workspace, onClose }: EditWorkspaceDialogProps) {
  const [newLabel, setNewLabel] = React.useState('');
  const updateSavedWorkspace = useWorkspaceStore((state) => state.updateSavedWorkspace);

  React.useEffect(() => {
    if (workspace) {
      setNewLabel(workspace.label);
    }
  }, [workspace]);

  const handleSave = () => {
    if (workspace && newLabel.trim()) {
      updateSavedWorkspace(workspace.id, newLabel.trim());
      toast.success('Workspace renamed');
      onClose();
    }
  };

  const handleReset = () => {
    if (workspace) {
      const original = workspace.originalLabel || workspace.label;
      setNewLabel(original);
      toast.info('Reset to original name');
    }
  };

  return (
    <Dialog open={!!workspace} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit Workspace Name</DialogTitle>
          <DialogDescription>
            Change the display name for this workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <Input 
              value={newLabel} 
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Enter workspace name..."
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
          </div>
          
          {workspace?.originalLabel && newLabel !== workspace.originalLabel && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleReset} 
              className="w-full h-9 text-xs text-muted-foreground gap-2 border-dashed hover:border-solid transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to original: <span className="font-semibold">{workspace.originalLabel}</span>
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
