'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, Loader2, AlertCircle, CheckSquare, Layers } from 'lucide-react';
import { downloadJson, downloadZip, getFormattedTimestamp } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { fetchCollections, fetchCollectionDetail } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';

export type Collection = {
  id: string;
  name: string;
  uid: string;
  updatedAt?: string;
  itemCount?: number;
  owner?: string;
};

export function CollectionTable() {
  const { workspaceId, apiKey, savedWorkspaces } = useWorkspaceStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [isBulkDownloading, setIsBulkDownloading] = React.useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['collections', workspaceId, apiKey],
    queryFn: async () => {
      const allCollections = await fetchCollections(workspaceId, apiKey);
      
      const filtered = allCollections.filter((c: any) => {
        const isGrpc = c.name?.toLowerCase().includes('grpc') || c.protocol === 'grpc';
        return !isGrpc;
      });

      return {
        list: filtered,
        skippedCount: allCollections.length - filtered.length
      };
    },
    enabled: !!workspaceId && !!apiKey,
  });

  const collections = data?.list || [];
  const skippedCount = data?.skippedCount || 0;
  const workspaceName = savedWorkspaces.find(w => w.id === workspaceId)?.label || 'workspace';

  // Trigger toast every time workspaceId changes and there are skipped items
  React.useEffect(() => {
    // We only trigger when data is ready and we have a workspaceId
    if (workspaceId && data && skippedCount > 0) {
      toast.info(`${skippedCount} service(s) skipped`, {
        description: `Skipped ${skippedCount} gRPC/Unsupported service(s) in "${workspaceName}" as they are not compatible with JSON download.`,
        duration: 4000,
      });
    }
  }, [workspaceId, data, skippedCount, workspaceName]);

  const columns = React.useMemo<ColumnDef<Collection>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
          {row.getValue('name')}
          <ExternalLink className="w-3 h-3 opacity-50" />
        </div>
      ),
    },
    {
      accessorKey: 'uid',
      header: 'UID',
      cell: ({ row }) => <code className="text-xs bg-muted px-1 rounded">{row.getValue('uid')}</code>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const collection = row.original;
        const isDownloading = downloadingId === collection.uid;
        
        return (
          <Button 
            size="sm" 
            variant="outline" 
            disabled={isDownloading}
            onClick={() => handleDownload(collection)}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            JSON
          </Button>
        );
      },
    }
  ], [downloadingId]);

  const table = useReactTable({
    data: collections,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleDownload = async (collection: Collection) => {
    if (!apiKey) return;
    setDownloadingId(collection.uid);
    try {
      const detail = await fetchCollectionDetail(collection.uid, apiKey);
      downloadJson(detail, `${collection.name}.json`);
      toast.success(`Downloaded ${collection.name}`);
    } catch (err: any) {
      toast.error(`Failed to download: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleBulkDownload = async (items: Collection[]) => {
    if (!apiKey || items.length === 0) return;
    
    const isSingle = items.length === 1;
    setIsBulkDownloading(true);
    const toastId = toast.loading(`Preparing ${items.length} collection(s)...`);

    try {
      if (isSingle) {
        const detail = await fetchCollectionDetail(items[0].uid, apiKey);
        downloadJson(detail, `${items[0].name}.json`);
      } else {
        const files = await Promise.all(
          items.map(async (item) => ({
            name: item.name,
            content: await fetchCollectionDetail(item.uid, apiKey)
          }))
        );
        const fileName = `${workspaceName}_${getFormattedTimestamp()}`;
        await downloadZip(files, fileName);
      }
      toast.success(isSingle ? 'Downloaded successfully' : `ZIP created with ${items.length} collections`, { id: toastId });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`, { id: toastId });
    } finally {
      setIsBulkDownloading(false);
    }
  };

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-muted/30 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-yellow-500" />
        <div className="space-y-1">
          <p className="font-semibold text-lg">Postman API Key Required</p>
          <p className="text-muted-foreground text-sm max-w-sm">
            Please enter your Postman API Key in the settings above to fetch collections.
          </p>
        </div>
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-muted/30 text-center">
        <Layers className="w-10 h-10 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Select a workspace from above to see available collections</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Fetching collections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p className="font-medium">Error loading collections</p>
        <p className="text-sm opacity-80">{(error as any).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Top Actions */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {collections.length} Collections found
          </Badge>
          {selectedCount > 0 && (
            <div className="flex flex-wrap items-center gap-1 animate-in fade-in slide-in-from-left-2 duration-300">
              <Badge variant="secondary" className="px-3 py-1 bg-blue-100 text-blue-700 border-blue-200">
                {selectedCount} selected
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-[10px] uppercase font-bold tracking-wider sm:text-xs"
                onClick={() => table.toggleAllRowsSelected(true)}
              >
                Select All
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground sm:text-xs"
                onClick={() => table.toggleAllRowsSelected(false)}
              >
                Unselect All
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto">
          {selectedCount > 0 && (
            <Button 
              size="sm" 
              variant="default"
              className="w-full bg-indigo-600 hover:bg-indigo-700 sm:w-auto"
              onClick={() => handleBulkDownload(selectedRows.map(r => r.original))}
              disabled={isBulkDownloading}
            >
              {isBulkDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckSquare className="w-4 h-4 mr-2" />}
              Download Selected ({selectedCount})
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => handleBulkDownload(collections)}
            disabled={isBulkDownloading || collections.length === 0}
          >
            {isBulkDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Layers className="w-4 h-4 mr-2" />}
            Download Bulky ({collections.length})
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">
                  No collections found in this workspace.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{' '}
          <span className="font-medium text-foreground">
            {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, collections.length)}
          </span> of{' '}
          <span className="font-medium text-foreground">{collections.length}</span> collections
          {' — '}
          Page <span className="font-medium text-foreground">{table.getState().pagination.pageIndex + 1}</span> of{' '}
          <span className="font-medium text-foreground">{table.getPageCount()}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
