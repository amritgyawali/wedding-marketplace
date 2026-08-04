interface LocalBusinessSchemaProps {
  name: string;
  description?: string;
  url: string;
  telephone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    addressCountry: string;
  };
  rating?: { value: number; count: number };
  priceRange?: string;
}

export function buildLocalBusinessSchema(props: LocalBusinessSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: props.name,
    description: props.description,
    url: props.url,
    telephone: props.telephone,
    address: props.address
      ? {
          "@type": "PostalAddress",
          ...props.address,
        }
      : undefined,
    aggregateRating: props.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: props.rating.value,
          reviewCount: props.rating.count,
        }
      : undefined,
    priceRange: props.priceRange,
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildItemListSchema(items: { name: string; url: string; position: number }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url,
    })),
  };
}

interface JsonLdProps {
  schema: Record<string, unknown>;
}

export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
