'use client';

import * as React from 'react';
import { Search, Loader2, Link as LinkIcon, Hash, ChevronsUpDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useWorkspaceStore } from '@/lib/store';
import { extractWorkspaceId, cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

const inputTypes = [
  { value: 'url', label: 'URL', icon: LinkIcon },
  { value: 'id', label: 'ID', icon: Hash },
];

export function WorkspaceInput() {
  const [inputValue, setInputValue] = React.useState('');
  const [inputType, setInputType] = React.useState<'url' | 'id'>('url');
  const [typePopoverOpen, setTypePopoverOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const { apiKey, loadWorkspace } = useWorkspaceStore();

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
        toast.error('Invalid Workspace ID format');
        return;
      }
    } else {
      id = extractWorkspaceId(trimmedInput);
      if (!id || (id === trimmedInput && !trimmedInput.includes('postman.co'))) {
        toast.error('Invalid Workspace URL');
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

  const currentType = inputTypes.find(t => t.value === inputType);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-2">
      <div className="flex w-full gap-0">
        <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-[110px] shrink-0 justify-between rounded-r-none border-r-0 bg-muted/50 px-3 hover:bg-muted/70"
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
                      className="cursor-pointer text-xs"
                    >
                      <type.icon className="mr-2 h-3 w-3" />
                      {type.label}
                      <Check
                        className={cn(
                          "ml-auto h-3 w-3",
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
        <div className="relative min-w-0 flex-1">
          <Input
            placeholder={inputType === 'url' ? "Paste Workspace URL..." : "Enter Workspace ID..."}
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
      <Button
        onClick={handleSearch}
        variant="secondary"
        disabled={isLoading}
        className="h-10 w-full shadow-sm sm:w-auto"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
        Load
      </Button>
    </div>
  );
}
