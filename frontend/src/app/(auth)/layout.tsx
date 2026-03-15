export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-950 mesh-gradient relative overflow-hidden">
      {/* Animated background particles (CSS only) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-violet-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute w-72 h-72 top-1/3 right-0 bg-emerald-600/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute w-80 h-80 bottom-0 left-1/4 bg-amber-600/6 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        {/* Small floating dots */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-violet-400/20 rounded-full animate-float"
            style={{
              left: `${(i * 17 + 5) % 100}%`,
              top: `${(i * 23 + 10) % 100}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${4 + (i % 4)}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {children}
      </div>
    </div>
  );
}
