import CategoryPageClient from './PageClient';

export function generateStaticParams() {
  return [
    { category: 'adventure' },
    { category: 'mystery' },
    { category: 'cultural' },
    { category: 'educational' },
    { category: 'culinary' },
    { category: 'nature' },
    { category: 'urban' },
    { category: 'team_building' },
  ];
}

interface Props {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  return <CategoryPageClient category={category} />;
}
