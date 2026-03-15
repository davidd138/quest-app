import Skeleton from '@/components/ui/Skeleton';

export default function QuestsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton variant="text" width="240px" height="2rem" />
        <Skeleton variant="text" width="320px" height="1rem" className="mt-2" />
      </div>

      {/* Filter bar skeleton */}
      <div className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <Skeleton variant="rectangular" height="2.75rem" className="flex-1 rounded-xl" />
        <Skeleton variant="rectangular" width="11rem" height="2.75rem" className="rounded-xl" />
        <Skeleton variant="rectangular" width="9rem" height="2.75rem" className="rounded-xl" />
      </div>

      {/* Quest card grid skeleton */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl overflow-hidden">
            {/* Cover image area */}
            <Skeleton variant="rectangular" height="11rem" className="rounded-none" />

            {/* Card content */}
            <div className="p-5 space-y-3">
              <Skeleton variant="text" width="75%" height="1.25rem" />
              <Skeleton variant="text" width="100%" height="0.875rem" />
              <Skeleton variant="text" width="66%" height="0.875rem" />

              {/* Tags row */}
              <div className="flex gap-2 mt-4">
                <Skeleton variant="text" width="4rem" height="1.5rem" className="rounded-lg" />
                <Skeleton variant="text" width="4rem" height="1.5rem" className="rounded-lg" />
                <Skeleton variant="text" width="4rem" height="1.5rem" className="rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
