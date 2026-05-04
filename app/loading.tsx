import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-4">
          <Skeleton className="h-7 w-48 rounded-full" />
          <Skeleton className="h-12 w-72 md:w-96" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:w-80">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-64 rounded-lg" />
        ))}
      </div>
    </section>
  );
}
