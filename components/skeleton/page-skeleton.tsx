import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export function PageSkeleton() {
  return (
    <>
      {/* Workspace Selection Area Skeleton */}
        <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-[150px]" />
            <Skeleton className="h-5 w-[300px]" />
          </div>
          {/* Workspace Input Skeleton */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-2">
            <div className="flex w-full gap-0">
              <Skeleton className="h-10 w-[110px] rounded-r-none border-r-0" />
              <Skeleton className="h-10 flex-1 rounded-l-none" />
            </div>
            <Skeleton className="h-10 w-full sm:w-[100px]" />
          </div>
        </div>

        <Separator />

        {/* Collections Table Area Skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-5 w-[350px]" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-[120px] rounded-full" />
              <Skeleton className="h-9 w-[150px]" />
            </div>
            <div className="rounded-md border bg-card shadow-sm overflow-hidden">
              <div className="border-b bg-muted/50 p-4 flex gap-4">
                 <Skeleton className="h-4 w-4" />
                 <Skeleton className="h-4 w-[150px]" />
                 <Skeleton className="h-4 w-[250px]" />
                 <Skeleton className="h-4 w-[100px] ml-auto" />
              </div>
              <div className="p-4 space-y-4">
                 {Array.from({ length: 5 }).map((_, i) => (
                   <div key={i} className="flex gap-4 items-center">
                     <Skeleton className="h-4 w-4" />
                     <Skeleton className="h-5 w-[200px]" />
                     <Skeleton className="h-4 w-[300px]" />
                     <Skeleton className="h-8 w-[80px] ml-auto" />
                   </div>
                 ))}
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
               <Skeleton className="h-4 w-[250px]" />
               <div className="flex gap-2">
                 <Skeleton className="h-8 w-[80px]" />
                 <Skeleton className="h-8 w-[80px]" />
               </div>
            </div>
          </div>
        </div>
    </>
  );
}
