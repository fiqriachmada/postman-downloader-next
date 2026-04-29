'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Trash2, Edit2, Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useWorkspaceStore, SavedWorkspace } from '@/lib/store';
import { toast } from 'sonner';

interface QuickSelectProps {
  onEdit: (workspace: SavedWorkspace) => void;
}

export function QuickSelect({ onEdit }: QuickSelectProps) {
  const [open, setOpen] = React.useState(false);
  const { 
    workspaceId, 
    loadWorkspace,
    apiKey, 
    savedWorkspaces, 
    removeSavedWorkspace 
  } = useWorkspaceStore();

  const selectedWorkspace = savedWorkspaces.find((w) => w.id === workspaceId);

  const handleDelete = (e: React.MouseEvent | React.PointerEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeSavedWorkspace(id);
    if (workspaceId === id) loadWorkspace('');
    toast.success('Workspace removed');
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all saved workspaces?')) {
      savedWorkspaces.forEach(w => removeSavedWorkspace(w.id));
      loadWorkspace('');
      setOpen(false);
      toast.success('All workspaces cleared');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
        Quick Select:
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between overflow-hidden shadow-sm"
          >
            <span className="truncate">
              {selectedWorkspace
                ? selectedWorkspace.label
                : workspaceId || "Select or enter workspace..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 shadow-xl border-muted-foreground/10">
          <Command>
            <CommandInput placeholder="Search saved workspaces..." />
            <CommandList>
              <CommandEmpty>No workspace found.</CommandEmpty>
              {savedWorkspaces.length > 0 && (
                <>
                  <CommandGroup heading="Saved Workspaces">
                    {savedWorkspaces.map((workspace) => (
                      <CommandItem
                        key={workspace.id}
                        value={workspace.id}
                        className="flex items-center justify-between group cursor-pointer"
                        onSelect={() => {
                          if (!apiKey) {
                            toast.error('Postman API Key missing');
                            setOpen(false);
                            return;
                          }
                          loadWorkspace(workspace.id === workspaceId ? "" : workspace.id);
                          setOpen(false);
                        }}
                      >
                        <div className="flex items-center overflow-hidden flex-1">
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              workspaceId === workspace.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">{workspace.label}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-muted"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              onEdit(workspace);
                              setOpen(false);
                            }}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => handleDelete(e, workspace.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleClearAll}
                      className="text-destructive focus:text-destructive flex items-center justify-center gap-2 cursor-pointer py-3"
                    >
                      <Eraser className="w-4 h-4" />
                      Clear All Workspaces
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
