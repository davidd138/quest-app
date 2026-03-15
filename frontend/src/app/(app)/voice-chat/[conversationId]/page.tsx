import VoiceChatPage from './PageClient';

export async function generateStaticParams() {
  return [{ conversationId: 'placeholder' }];
}

export default function Page() {
  return <VoiceChatPage />;
}
