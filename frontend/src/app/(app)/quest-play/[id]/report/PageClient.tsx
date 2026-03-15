'use client';

import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useQuery } from '@/hooks/useGraphQL';
import {
  GET_QUEST,
  GET_PROGRESS,
  LIST_CONVERSATIONS,
} from '@/lib/graphql/queries';
import QuestReport from '@/components/quest/QuestReport';
import ShareCard from '@/components/quest/ShareCard';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type {
  Quest,
  Progress,
  Conversation,
  ConversationConnection,
} from '@/types';

// ---------- Loading Skeleton ----------

function ReportSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width="200px" />
      </div>
      <Skeleton variant="card" height="200px" />
      <div className="grid grid-cols-3 gap-6">
        <Skeleton variant="card" height="180px" />
        <Skeleton variant="card" height="180px" />
        <Skeleton variant="card" height="180px" />
      </div>
      <Skeleton variant="card" height="300px" />
      <Skeleton variant="card" height="200px" />
    </div>
  );
}

// ---------- Main Component ----------

export default function QuestReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const questId = params.id;

  const {
    data: quest,
    loading: questLoading,
    execute: fetchQuest,
  } = useQuery<Quest>(GET_QUEST);
  const {
    data: progress,
    loading: progressLoading,
    execute: fetchProgress,
  } = useQuery<Progress>(GET_PROGRESS);
  const {
    data: conversationData,
    loading: convsLoading,
    execute: fetchConversations,
  } = useQuery<ConversationConnection>(LIST_CONVERSATIONS);

  useEffect(() => {
    fetchQuest({ id: questId });
    fetchProgress({ questId });
    fetchConversations({ questId, limit: 50 });
  }, [questId, fetchQuest, fetchProgress, fetchConversations]);

  const conversations: Conversation[] = useMemo(
    () => conversationData?.items ?? [],
    [conversationData],
  );

  const handleShare = useCallback(() => {
    // Scroll to share card section
    const el = document.getElementById('share-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleDownload = useCallback(() => {
    // Generate printable view
    const printWindow = window.open('', '_blank');
    if (!printWindow || !quest || !progress) return;

    const starsCount = quest.totalPoints > 0
      ? Math.ceil((progress.totalPoints / quest.totalPoints) * 5)
      : 0;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Quest Report - ${quest.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e; }
          h1 { color: #6d28d9; margin-bottom: 4px; }
          h2 { color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 32px; }
          .score { font-size: 64px; font-weight: bold; color: #6d28d9; text-align: center; }
          .stars { text-align: center; font-size: 24px; margin-bottom: 16px; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
          .stat { padding: 16px; background: #f8fafc; border-radius: 12px; }
          .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; }
          .stat-value { font-size: 20px; font-weight: bold; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
          th { background: #f8fafc; font-weight: 600; font-size: 12px; color: #64748b; text-transform: uppercase; }
          .pass { color: #10b981; font-weight: 600; }
          .fail { color: #f43f5e; font-weight: 600; }
          .branding { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <h1>${quest.title}</h1>
        <p style="color: #64748b;">${quest.category.replace('_', ' ')} &middot; ${quest.difficulty}</p>

        <div class="score">${progress.totalPoints} / ${quest.totalPoints}</div>
        <div class="stars">${'&#9733;'.repeat(starsCount)}${'&#9734;'.repeat(5 - starsCount)}</div>

        <div class="stats">
          <div class="stat">
            <div class="stat-label">Total Time</div>
            <div class="stat-value">${Math.floor(progress.totalDuration / 60)}m ${progress.totalDuration % 60}s</div>
          </div>
          <div class="stat">
            <div class="stat-label">Stages Completed</div>
            <div class="stat-value">${progress.completedStages.length} / ${quest.stages.length}</div>
          </div>
        </div>

        <h2>Stage Breakdown</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Stage</th>
              <th>Character</th>
              <th>Type</th>
              <th>Score</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${quest.stages
              .sort((a, b) => a.order - b.order)
              .map((stage, i) => {
                const cs = progress.completedStages.find((c) => c.stageId === stage.id);
                const conv = conversations.find((c) => c.stageId === stage.id);
                const passed = conv?.challengeResult?.passed ?? !!cs;
                return `<tr>
                  <td>${i + 1}</td>
                  <td>${stage.title}</td>
                  <td>${stage.character.name}</td>
                  <td>${stage.challenge.type}</td>
                  <td>${cs?.points ?? 0} pts</td>
                  <td>${cs ? `${Math.floor(cs.duration / 60)}m ${cs.duration % 60}s` : '--'}</td>
                  <td class="${passed ? 'pass' : 'fail'}">${passed ? 'PASS' : 'FAIL'}</td>
                </tr>`;
              })
              .join('')}
          </tbody>
        </table>

        <div class="branding">QuestMaster &middot; Quest Completion Report</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [quest, progress, conversations]);

  const loading = questLoading || progressLoading || convsLoading;

  if (loading) {
    return <ReportSkeleton />;
  }

  if (!quest || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card padding="lg">
          <p className="text-slate-400 mb-4">Quest report not available.</p>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={ArrowLeft}
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-400" />
        </button>

        <Button
          size="sm"
          variant="secondary"
          leftIcon={RotateCcw}
          onClick={() => router.push(`/quest-play/${questId}`)}
        >
          Play Again
        </Button>
      </div>

      {/* Report */}
      <QuestReport
        quest={quest}
        progress={progress}
        conversations={conversations}
        onShare={handleShare}
        onDownload={handleDownload}
      />

      {/* Share section */}
      <div id="share-section" className="mt-12 mb-8">
        <h2 className="font-heading text-xl font-bold text-white mb-6 text-center">
          Share Your Achievement
        </h2>
        <ShareCard
          quest={quest}
          progress={progress}
          userName="Player"
        />
      </div>
    </motion.div>
  );
}
