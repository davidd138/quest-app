'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Clock, AlertTriangle, Ban } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="space-y-6 w-full max-w-md px-6">
        <div className="h-8 w-48 mx-auto rounded-lg animate-shimmer bg-navy-800" />
        <div className="glass rounded-2xl p-8 space-y-4">
          <div className="h-4 w-full rounded animate-shimmer bg-navy-800" />
          <div className="h-4 w-3/4 rounded animate-shimmer bg-navy-800" />
          <div className="h-4 w-5/6 rounded animate-shimmer bg-navy-800" />
          <div className="h-12 w-full rounded-xl animate-shimmer bg-navy-800 mt-6" />
        </div>
      </div>
    </div>
  );
}

function StatusScreen({
  icon: Icon,
  title,
  message,
  accentColor,
  onSignOut,
}: {
  icon: React.ElementType;
  title: string;
  message: string;
  accentColor: string;
  onSignOut: () => void;
}) {
  const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    violet: {
      bg: 'bg-violet-600/10',
      border: 'border-violet-500/30',
      text: 'text-violet-400',
      glow: 'shadow-violet-500/20',
    },
    rose: {
      bg: 'bg-rose-600/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      glow: 'shadow-rose-500/20',
    },
    amber: {
      bg: 'bg-amber-600/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/20',
    },
  };

  const colors = colorMap[accentColor] || colorMap.violet;

  return (
    <div className="min-h-screen bg-navy-950 mesh-gradient flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`glass rounded-2xl p-10 max-w-md w-full text-center border ${colors.border} shadow-2xl ${colors.glow}`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className={`w-20 h-20 rounded-2xl ${colors.bg} flex items-center justify-center mx-auto mb-6`}
        >
          <Icon className={`w-10 h-10 ${colors.text}`} />
        </motion.div>
        <h2 className="font-heading text-2xl font-bold text-white mb-3">{title}</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">{message}</p>
        <button
          onClick={onSignOut}
          className="w-full py-3 px-6 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 transition-colors duration-200 font-medium"
        >
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) return <SkeletonLoader />;
  if (!user) return <SkeletonLoader />;

  if (user.status === 'pending') {
    return (
      <StatusScreen
        icon={Clock}
        title="Account Pending Approval"
        message="Your account is awaiting administrator approval. You'll receive a notification once your account has been activated."
        accentColor="violet"
        onSignOut={signOut}
      />
    );
  }

  if (user.status === 'suspended') {
    return (
      <StatusScreen
        icon={Ban}
        title="Account Suspended"
        message="Your account has been suspended. Please contact an administrator for more information about this action."
        accentColor="rose"
        onSignOut={signOut}
      />
    );
  }

  if (user.status === 'expired') {
    return (
      <StatusScreen
        icon={AlertTriangle}
        title="Account Expired"
        message="Your account access has expired. Please contact an administrator to renew your access."
        accentColor="amber"
        onSignOut={signOut}
      />
    );
  }

  return <>{children}</>;
}
