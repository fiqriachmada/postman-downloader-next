'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, Trash2, Edit2, Loader2, RotateCcw, Eraser, Link as LinkIcon, Hash } from 'lucide-react';

import { cn, extractWorkspaceId } from '@/lib/utils';
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
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const inputTypes = [
  { value: 'url', label: 'URL', icon: LinkIcon },
  { value: 'id', label: 'ID', icon: Hash },
];

export function WorkspaceSelector() {
  const [open, setOpen] = React.useState(false);
  const [typePopoverOpen, setTypePopoverOpen] = React.useState(false);
  const { 
    workspaceId, 
    loadWorkspace,
    apiKey, 
    savedWorkspaces, 
    removeSavedWorkspace, 
    updateSavedWorkspace,
  } = useWorkspaceStore();
  const [inputValue, setInputValue] = React.useState('');
  const [inputType, setInputType] = React.useState<'url' | 'id'>('url');
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Edit Dialog State
  const [editWorkspace, setEditWorkspace] = React.useState<SavedWorkspace | null>(null);
  const [newLabel, setNewLabel] = React.useState('');

  const handleSearch = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) {
      toast.error(`Please enter a Workspace ${inputType === 'url' ? 'URL' : 'ID'}`);
      return;
    }

    if (!apiKey) {
      toast.error('Please setup your Postman API Key first!');
      return;
    }

    let id = '';
    if (inputType === 'id') {
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(trimmedInput)) {
        id = trimmedInput;
      } else {
        toast.error('Invalid Workspace ID format', {
          description: 'Format should be xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
        });
        return;
      }
    } else {
      id = extractWorkspaceId(trimmedInput);
      if (!id || (id === trimmedInput && !trimmedInput.includes('postman.co'))) {
        toast.error('Invalid Workspace URL', {
          description: 'Please paste a valid Postman Workspace link.'
        });
        return;
      }
    }

    if (id) {
      setIsLoading(true);
      await loadWorkspace(id);
      setIsLoading(false);
      setInputValue('');
    }
  };

  const onOpenEdit = (e: React.MouseEvent | React.PointerEvent, workspace: SavedWorkspace) => {
    e.preventDefault();
    e.stopPropagation();
    setEditWorkspace(workspace);
    setNewLabel(workspace.label);
    setOpen(false);
  };

  const handleSaveEdit = () => {
    if (editWorkspace && newLabel.trim()) {
      updateSavedWorkspace(editWorkspace.id, newLabel.trim());
      toast.success('Workspace renamed');
      setEditWorkspace(null);
    }
  };

  const handleReset = () => {
    if (editWorkspace) {
      const original = editWorkspace.originalLabel || editWorkspace.label;
      setNewLabel(original);
      toast.info('Reset to original name');
    }
  };

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

  const selectedWorkspace = savedWorkspaces.find((w) => w.id === workspaceId);
  const currentType = inputTypes.find(t => t.value === inputType);

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      {/* Edit Dialog */}
      <Dialog open={!!editWorkspace} onOpenChange={(open) => !open && setEditWorkspace(null)}>
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
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              />
            </div>
            
            {editWorkspace?.originalLabel && newLabel !== editWorkspace.originalLabel && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleReset} 
                className="w-full h-9 text-xs text-muted-foreground gap-2 border-dashed hover:border-solid"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to original: <span className="font-semibold">{editWorkspace.originalLabel}</span>
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditWorkspace(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex gap-2">
        <div className="flex-1 flex gap-0">
          <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={typePopoverOpen}
                className="w-[110px] justify-between rounded-r-none border-r-0 bg-muted/50 hover:bg-muted/70 px-3"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {currentType && <currentType.icon className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{currentType?.label}</span>
                </div>
                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[110px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search..." className="h-8" />
                <CommandList>
                  <CommandEmpty>None.</CommandEmpty>
                  <CommandGroup>
                    {inputTypes.map((type) => (
                      <CommandItem
                        key={type.value}
                        value={type.value}
                        onSelect={() => {
                          setInputType(type.value as any);
                          setTypePopoverOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <type.icon className="mr-2 h-3.5 w-3.5" />
                        {type.label}
                        <Check
                          className={cn(
                            "ml-auto h-3.5 w-3.5",
                            inputType === type.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="relative flex-1">
            <Input
              placeholder={inputType === 'url' ? "Paste Workspace URL here..." : "Enter Workspace ID..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="rounded-l-none border-l-1 focus-visible:ring-offset-0"
            />
            {isLoading && (
              <div className="absolute right-3 top-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
        <Button onClick={handleSearch} variant="secondary" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
          Load
        </Button>
      </div>

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
              className="w-full justify-between overflow-hidden"
            >
              <span className="truncate">
                {selectedWorkspace
                  ? selectedWorkspace.label
                  : workspaceId || "Select or enter workspace..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
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
                              onClick={(e) => onOpenEdit(e, workspace)}
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
    </div>
  );
}
