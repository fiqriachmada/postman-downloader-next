"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckSquare,
  Layers,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useCollections } from "@/hooks/use-collections"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { useUserProfileStore } from "@/stores/user-profile-store"

export type Collection = {
  id: string
  name: string
  uid: string
  updatedAt?: string
  itemCount?: number
  owner?: string
}

export function CollectionTable() {
  const { apiKey } = useUserProfileStore()
  const {
    workspaceId,
    tableSorting: sorting,
    tableRowSelection: rowSelection,
    downloadingId,
    isBulkDownloading,
    setTableSorting: setSorting,
    setTableRowSelection: setRowSelection,
  } = useWorkspaceStore()

  const { collections, isLoading, error, handleDownload, handleBulkDownload } =
    useCollections()

  const columns = React.useMemo<ColumnDef<Collection>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400">
            {row.getValue("name")}
            <ExternalLink className="h-3 w-3 opacity-50" />
          </div>
        ),
      },
      {
        accessorKey: "uid",
        header: "UID",
        cell: ({ row }) => (
          <code className="rounded bg-muted px-1 text-xs">
            {row.getValue("uid")}
          </code>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const collection = row.original
          const isDownloading = downloadingId === collection.uid

          return (
            <Button
              size="sm"
              variant="outline"
              disabled={isDownloading}
              onClick={() => handleDownload(collection)}
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              JSON
            </Button>
          )
        },
      },
    ],
    [downloadingId]
  )

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
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-xl border-2 border-dashed bg-muted/30 py-20 text-center">
        <AlertCircle className="h-10 w-10 text-yellow-500" />
        <div className="space-y-1">
          <p className="text-lg font-semibold">Postman API Key Required</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Please enter your Postman API Key in the settings above to fetch
            collections.
          </p>
        </div>
      </div>
    )
  }

  if (!workspaceId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/30 py-20 text-center">
        <Layers className="mb-4 h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">
          Select a workspace from above to see available collections
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Table Top Actions Skeleton */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto">
            <Skeleton className="h-9 w-full sm:w-36" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="overflow-hidden rounded-md border bg-card shadow-sm">
          <div className="flex gap-4 border-b bg-muted/50 p-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="ml-auto h-4 w-[100px]" />
          </div>
          <div className="space-y-4 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-5 w-[200px]" />
                <Skeleton className="h-4 w-[300px]" />
                <Skeleton className="ml-auto h-8 w-[80px]" />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between py-4">
          <Skeleton className="h-4 w-[250px]" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-20 text-destructive">
        <AlertCircle className="mb-2 h-8 w-8" />
        <p className="font-medium">Error loading collections</p>
        <p className="text-sm opacity-80">{(error as any).message}</p>
      </div>
    )
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
            <div className="flex animate-in flex-wrap items-center gap-1 duration-300 fade-in slide-in-from-left-2">
              <Badge
                variant="secondary"
                className="border-blue-200 bg-blue-100 px-3 py-1 text-blue-700"
              >
                {selectedCount} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px] font-bold tracking-wider uppercase sm:text-xs"
                onClick={() => table.toggleAllRowsSelected(true)}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase sm:text-xs"
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
              onClick={() =>
                handleBulkDownload(selectedRows.map((r) => r.original))
              }
              disabled={isBulkDownloading}
            >
              {isBulkDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckSquare className="mr-2 h-4 w-4" />
              )}
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
            {isBulkDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Layers className="mr-2 h-4 w-4" />
            )}
            Download Bulky ({collections.length})
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground italic"
                >
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
          Showing{" "}
          <span className="font-medium text-foreground">
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-foreground">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              collections.length
            )}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {collections.length}
          </span>{" "}
          collections
          {" — "}
          Page{" "}
          <span className="font-medium text-foreground">
            {table.getState().pagination.pageIndex + 1}
          </span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {table.getPageCount()}
          </span>
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
  )
}
