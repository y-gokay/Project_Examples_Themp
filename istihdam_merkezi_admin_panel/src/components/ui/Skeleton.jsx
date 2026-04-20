const SkeletonBlock = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-100 dark:border-gray-700 space-y-4">
    <div className="flex items-center gap-3">
      <SkeletonBlock className="h-10 w-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-full" />
    </div>
  </div>
);

export const SkeletonListItem = () => (
  <div className="p-4 sm:p-6 space-y-3 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="flex-1 space-y-3">
        <SkeletonBlock className="h-5 w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1">
              <SkeletonBlock className="h-3 w-16" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 ml-4">
        <SkeletonBlock className="h-8 w-20 rounded-lg" />
        <SkeletonBlock className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  </div>
);

export const SkeletonStatCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 animate-pulse">
    <SkeletonBlock className="h-3 w-24 mb-2" />
    <SkeletonBlock className="h-8 w-16" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="divide-y divide-gray-100 dark:divide-gray-700">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonListItem key={i} />
    ))}
  </div>
);

export default SkeletonBlock;
