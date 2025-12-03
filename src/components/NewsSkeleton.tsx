export function NewsSkeleton() {
  return (
    <div className="animate-pulse flex gap-4 rounded-xl bg-transparent h-full">
      {/* Image placeholder - Left side */}
      <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gray-200 dark:bg-gray-800" />
      
      {/* Content placeholder - Right side */}
      <div className="flex-1 flex flex-col min-w-0 h-full pt-[3px]">
        
        {/* Category - Top */}
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
        
        {/* Title (3 lines max space) */}
        <div className="space-y-1.5">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
        </div>
        
        {/* Meta (Source • Date) - Bottom */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
}