type FaqItem = { question: string; answer: string };

export function organizationJsonLd(settings: { siteName: string; siteUrl: string; logo?: string; socials?: string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.siteName,
    url: settings.siteUrl,
    ...(settings.logo && { logo: settings.logo }),
    ...(settings.socials?.length && { sameAs: settings.socials }),
  };
}

export function serviceJsonLd(input: {
  name: string;
  description: string;
  url: string;
  areaServed?: string;
  providerName: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: input.url,
    ...(input.areaServed && { areaServed: input.areaServed }),
    provider: {
      '@type': 'Organization',
      name: input.providerName,
    },
  };
}

export function blogPostingJsonLd(input: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: Date;
  dateModified: Date;
  authorName: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    url: input.url,
    ...(input.image && { image: input.image }),
    datePublished: input.datePublished.toISOString(),
    dateModified: input.dateModified.toISOString(),
    author: {
      '@type': 'Person',
      name: input.authorName,
    },
  };
}

export function faqJsonLd(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}