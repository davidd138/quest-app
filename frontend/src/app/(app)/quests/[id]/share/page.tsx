import PageClient from './PageClient';

export async function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <PageClient id={id} />;
}
