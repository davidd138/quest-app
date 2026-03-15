import type { Metadata } from 'next';

const SITE_NAME = 'QuestMaster';
const SITE_URL = 'https://questmaster.app';
const DEFAULT_OG_IMAGE = '/og-default.png';

interface QuestLike {
  title: string;
  description: string;
  coverImageUrl?: string;
}

/**
 * Generates Next.js Metadata for a quest detail page.
 */
export function generateQuestMetadata(quest: QuestLike): Metadata {
  const description = quest.description.slice(0, 160);
  const image = quest.coverImageUrl || DEFAULT_OG_IMAGE;

  return {
    title: `${quest.title} | ${SITE_NAME}`,
    description,
    openGraph: {
      title: quest.title,
      description,
      type: 'website',
      siteName: SITE_NAME,
      url: SITE_URL,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: quest.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: quest.title,
      description,
      images: [image],
    },
  };
}

/**
 * Generates Next.js Metadata for a generic page.
 */
export function generatePageMetadata(title: string, description: string): Metadata {
  const truncatedDescription = description.slice(0, 160);

  return {
    title: `${title} | ${SITE_NAME}`,
    description: truncatedDescription,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: truncatedDescription,
      type: 'website',
      siteName: SITE_NAME,
      url: SITE_URL,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description: truncatedDescription,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}
