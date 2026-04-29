'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Trash2, Edit2, Eraser, GripVertical, ArrowDownAZ, ArrowDownZA, Clock } from 'lucide-react';
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
import { useWorkspaceStore } from '@/lib/store';
import { SavedWorkspace } from '@/types/saved-workspace-type';
import { toast } from 'sonner';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { QuickSelectProps } from "@/types/quick-select-props-type"
import { SortableItemProps } from "@/types/sortable-item-props-type"

function SortableItem({ workspace, isActive, onSelect, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workspace.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <CommandItem
      ref={setNodeRef}
      style={style}
      value={`${workspace.label} ${workspace.id}`}
      onSelect={onSelect}
      className={cn("flex items-center justify-between group cursor-pointer", isDragging && "bg-accent")}
    >
      <div className="flex items-center overflow-hidden flex-1">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab hover:text-foreground text-muted-foreground mr-1 opacity-0 group-hover:opacity-100 transition-opacity" 
          onPointerDown={(e) => { 
            listeners?.onPointerDown?.(e as any);
          }}
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <Check
          className={cn(
            "mr-2 h-4 w-4 shrink-0",
            isActive ? "opacity-100" : "opacity-0"
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
            e.stopPropagation();
            onEdit(workspace);
          }}
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e, workspace.id);
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </CommandItem>
  );
}



export function QuickSelect({ onEdit }: QuickSelectProps) {
  const { 
    workspaceId, 
    loadWorkspace,
    apiKey, 
    savedWorkspaces, 
    removeSavedWorkspace,
    sortOrder,
    setSortOrder,
    reorderWorkspaces,
    quickSelectOpen: open,
    setQuickSelectOpen: setOpen
  } = useWorkspaceStore();

  const selectedWorkspace = savedWorkspaces.find((w) => w.id === workspaceId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const displayedWorkspaces = React.useMemo(() => {
    if (sortOrder === 'custom') return savedWorkspaces;
    return [...savedWorkspaces].sort((a, b) => {
      const cmp = a.label.localeCompare(b.label);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [savedWorkspaces, sortOrder]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = savedWorkspaces.findIndex((w) => w.id === active.id);
      const newIndex = savedWorkspaces.findIndex((w) => w.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderWorkspaces(oldIndex, newIndex);
      }
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

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
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
            <span className="truncate text-left">
              {selectedWorkspace
                ? selectedWorkspace.label
                : "Select saved workspace..."}
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
                  <CommandGroup heading={
                    <div className="flex items-center justify-between w-full pr-1">
                      <span>Saved Workspaces</span>
                      {savedWorkspaces.length > 1 && (
                        <div className="flex items-center gap-0.5" onPointerDown={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn("h-5 w-5 hover:bg-muted text-muted-foreground", sortOrder === 'asc' && "bg-muted text-foreground")} 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSortOrder('asc') }} 
                            title="Sort A-Z"
                          >
                            <ArrowDownAZ className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn("h-5 w-5 hover:bg-muted text-muted-foreground", sortOrder === 'desc' && "bg-muted text-foreground")} 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSortOrder('desc') }} 
                            title="Sort Z-A"
                          >
                            <ArrowDownZA className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn("h-5 w-5 hover:bg-muted text-muted-foreground", sortOrder === 'custom' && "bg-muted text-foreground")} 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSortOrder('custom') }} 
                            title="Custom Order"
                          >
                            <Clock className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  }>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={displayedWorkspaces.map(w => w.id)} strategy={verticalListSortingStrategy}>
                        {displayedWorkspaces.map((workspace) => (
                          <SortableItem
                            key={workspace.id}
                            workspace={workspace}
                            isActive={workspaceId === workspace.id}
                            onSelect={() => {
                              if (!apiKey) {
                                toast.error('Postman API Key missing');
                                setOpen(false);
                                return;
                              }
                              loadWorkspace(workspace.id === workspaceId ? "" : workspace.id);
                              setOpen(false);
                            }}
                            onEdit={(workspace) => {
                              onEdit(workspace);
                              setOpen(false);
                            }}
                            onDelete={handleDelete}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
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
