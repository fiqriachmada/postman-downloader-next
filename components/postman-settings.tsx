'use client';

import * as React from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore } from '@/lib/store';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function PostmanSettings() {
  const { apiKey, setApiKey } = useWorkspaceStore();
  const [showKey, setShowKey] = React.useState(false);

  return (
    <div className="flex justify-end">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Key className="w-4 h-4" />
            {apiKey ? 'API Key Set' : 'Setup API Key'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 space-y-4" align="end">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Postman API Key</h4>
            <p className="text-sm text-muted-foreground">
              Required to fetch collections from your workspace.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="PMAK-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Get your key from <a href="https://web.postman.co/settings/me/api-keys" target="_blank" rel="noreferrer" className="text-blue-500 underline">Postman Settings</a>.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
