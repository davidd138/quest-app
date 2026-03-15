import QuestReportPage from './PageClient';

export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default function Page() {
  return <QuestReportPage />;
}
