import WikiGuidePage from './PageClient';

export async function generateStaticParams() {
  return [
    { slug: 'voice-chat-tips' },
    { slug: 'challenge-strategies' },
    { slug: 'character-interaction' },
    { slug: 'map-navigation' },
    { slug: 'scoring-guide' },
    { slug: 'community-rules' },
  ];
}

export default function Page() {
  return <WikiGuidePage />;
}
