import { getRecentSearches } from './searchTracking';

// Function to sync search keywords with sitemap
export const syncSearchKeywordsToSitemap = async (): Promise<void> => {
  try {
    const searchKeywords = getRecentSearches();
    
    if (searchKeywords.length === 0) {
      return;
    }

    // Send keywords to sitemap endpoint
    const keywordsParam = encodeURIComponent(JSON.stringify(searchKeywords));
    const sitemapUrl = `/sitemap.xml?searchKeywords=${keywordsParam}`;
    
    // Pre-fetch sitemap to cache it with current keywords
    await fetch(sitemapUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml'
      }
    });
    
  } catch (error) {
    console.error('Error syncing search keywords to sitemap:', error);
  }
};

// Function to trigger sitemap update when new search is made
export const updateSitemapWithSearch = (keyword: string): void => {
  // Debounce sitemap updates to avoid too frequent calls
  if (!window.sitemapUpdateTimeout) {
    window.sitemapUpdateTimeout = setTimeout(() => {
      syncSearchKeywordsToSitemap();
      delete window.sitemapUpdateTimeout;
    }, 5000); // Update sitemap 5 seconds after search
  }
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    sitemapUpdateTimeout?: NodeJS.Timeout;
  }
}