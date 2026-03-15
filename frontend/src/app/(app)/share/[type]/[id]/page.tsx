import SharePageClient from './PageClient';

export async function generateStaticParams() {
  return [
    { type: 'quest', id: 'placeholder' },
    { type: 'achievement', id: 'placeholder' },
    { type: 'stats', id: 'placeholder' },
    { type: 'replay', id: 'placeholder' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type } = await params;

  const titles: Record<string, string> = {
    quest: 'Check out this Quest on QuestMaster',
    achievement: 'Achievement Unlocked on QuestMaster',
    stats: 'Player Stats on QuestMaster',
    replay: 'Quest Replay on QuestMaster',
  };

  const descriptions: Record<string, string> = {
    quest: 'Discover and play amazing interactive quests on QuestMaster',
    achievement: 'See what achievements players are earning on QuestMaster',
    stats: 'View player statistics and rankings on QuestMaster',
    replay: 'Watch quest replays and highlights on QuestMaster',
  };

  return {
    title: titles[type] || 'QuestMaster',
    description: descriptions[type] || 'Interactive adventure platform',
    openGraph: {
      title: titles[type] || 'QuestMaster',
      description: descriptions[type] || 'Interactive adventure platform',
      siteName: 'QuestMaster',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[type] || 'QuestMaster',
      description: descriptions[type] || 'Interactive adventure platform',
    },
  };
}

export default function SharePage() {
  return <SharePageClient />;
}
