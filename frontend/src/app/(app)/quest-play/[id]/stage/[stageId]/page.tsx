import StagePlayPage from './PageClient';

export async function generateStaticParams() {
  return [{ id: 'placeholder', stageId: 'placeholder' }];
}

export default function Page() {
  return <StagePlayPage />;
}
