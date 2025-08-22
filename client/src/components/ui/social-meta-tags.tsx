import { useEffect } from 'react';

interface SocialMetaTagsProps {
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  price?: string;
  availability?: string;
  brand?: string;
  siteName?: string;
}

export const SocialMetaTags = ({
  title,
  description,
  imageUrl,
  url,
  price,
  availability = "in stock",
  brand = "GAMOIWERE.GE",
  siteName = "GAMOIWERE.GE - Georgian E-commerce"
}: SocialMetaTagsProps) => {
  useEffect(() => {
    // Clean existing meta tags
    const existingMetaTags = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], meta[property^="product:"]');
    existingMetaTags.forEach(tag => tag.remove());

    // Create new meta tags
    const metaTags = [
      // Open Graph basic tags
      { property: 'og:type', content: 'product' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: imageUrl },
      { property: 'og:url', content: url },
      { property: 'og:site_name', content: siteName },
      { property: 'og:locale', content: 'ka_GE' },
      
      // Product specific Open Graph tags
      { property: 'product:brand', content: brand },
      { property: 'product:availability', content: availability },
      { property: 'product:condition', content: 'new' },
      { property: 'product:retailer', content: 'GAMOIWERE.GE' },
      
      // Twitter Card tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
      { name: 'twitter:site', content: '@gamoiwere' },
      
      // Additional SEO tags
      { name: 'description', content: description },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: title },
    ];

    // Add price if provided
    if (price) {
      metaTags.push(
        { property: 'product:price:amount', content: price },
        { property: 'product:price:currency', content: 'GEL' }
      );
    }

    // Create and append meta tags to head
    metaTags.forEach(({ property, name, content }) => {
      const meta = document.createElement('meta');
      if (property) meta.setAttribute('property', property);
      if (name) meta.setAttribute('name', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    });

    // Update page title
    document.title = `${title} | GAMOIWERE.GE`;

    // Add JSON-LD structured data for better SEO
    const existingJsonLd = document.querySelector('#product-structured-data');
    if (existingJsonLd) existingJsonLd.remove();

    const jsonLd: any = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": title,
      "description": description,
      "image": imageUrl,
      "brand": {
        "@type": "Brand",
        "name": brand
      },
      "offers": {
        "@type": "Offer",
        "url": url,
        "priceCurrency": "GEL",
        "availability": availability === "in stock" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "GAMOIWERE.GE"
        }
      }
    };

    if (price) {
      jsonLd.offers.price = price;
    }

    const script = document.createElement('script');
    script.id = 'product-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const metaTagsToRemove = document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], meta[property^="product:"]');
      metaTagsToRemove.forEach(tag => tag.remove());
      
      const jsonLdToRemove = document.querySelector('#product-structured-data');
      if (jsonLdToRemove) jsonLdToRemove.remove();
    };
  }, [title, description, imageUrl, url, price, availability, brand, siteName]);

  return null; // This component doesn't render anything visible
};