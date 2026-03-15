import Skeleton from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome header skeleton */}
      <div>
        <Skeleton variant="text" width="340px" height="2.25rem" />
        <Skeleton variant="text" width="240px" height="1rem" className="mt-2" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <Skeleton variant="rectangular" width="3rem" height="3rem" className="rounded-xl mb-4" />
            <Skeleton variant="text" width="5rem" height="0.875rem" className="mb-2" />
            <Skeleton variant="text" width="6rem" height="2rem" />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active quests skeleton */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <Skeleton variant="text" width="140px" height="1.5rem" />
            <Skeleton variant="text" width="70px" height="1rem" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="80%" height="1rem" />
                    <Skeleton variant="text" width="4rem" height="0.75rem" />
                  </div>
                  <Skeleton variant="text" width="3.5rem" height="1.5rem" className="rounded-lg" />
                </div>
                <Skeleton variant="rectangular" height="0.5rem" className="rounded-full" />
                <Skeleton variant="text" width="4rem" height="0.75rem" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity skeleton */}
        <div>
          <Skeleton variant="text" width="140px" height="1.5rem" className="mb-4" />
          <div className="glass rounded-2xl p-5 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="rectangular" width="2rem" height="2rem" className="rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton variant="text" width="80%" height="0.875rem" />
                  <Skeleton variant="text" width="50%" height="0.625rem" />
                </div>
                <Skeleton variant="text" width="2rem" height="0.75rem" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended quests carousel skeleton */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton variant="text" width="180px" height="1.5rem" />
          <Skeleton variant="text" width="70px" height="1rem" />
        </div>
        <div className="flex gap-4 overflow-hidden pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="glass rounded-xl p-5 min-w-[260px] max-w-[280px] flex-shrink-0 space-y-4"
            >
              <Skeleton variant="rectangular" height="8rem" className="rounded-lg" />
              <Skeleton variant="text" width="80%" height="1rem" />
              <Skeleton variant="text" width="100%" height="0.75rem" />
              <Skeleton variant="text" width="60%" height="0.75rem" />
              <div className="flex gap-3">
                <Skeleton variant="text" width="3rem" height="0.75rem" />
                <Skeleton variant="text" width="3rem" height="0.75rem" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
