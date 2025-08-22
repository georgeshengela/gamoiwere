interface SearchKeyword {
  keyword: string;
  searchCount: number;
  lastSearched: string;
}

export const trackSearchKeyword = async (keyword: string): Promise<void> => {
  if (!keyword.trim()) return;
  
  try {
    const normalizedKeyword = keyword.trim();
    const searchUrl = `/search/${encodeURIComponent(normalizedKeyword)}`;
    
    // Track search in database via API
    await fetch('/api/search-keywords/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword: normalizedKeyword,
        searchUrl: searchUrl
      })
    });
    
    // Trigger sitemap update with new search keyword
    updateSitemapWithSearch(normalizedKeyword);
  } catch (error) {
    console.error('Error tracking search keyword:', error);
  }
};

// Function to trigger sitemap update when new search is made
const updateSitemapWithSearch = (keyword: string): void => {
  // Debounce sitemap updates to avoid too frequent calls
  if (!(window as any).sitemapUpdateTimeout) {
    (window as any).sitemapUpdateTimeout = setTimeout(() => {
      syncSearchKeywordsToSitemap();
      delete (window as any).sitemapUpdateTimeout;
    }, 5000); // Update sitemap 5 seconds after search
  }
};

// Function to sync search keywords with sitemap
const syncSearchKeywordsToSitemap = async (): Promise<void> => {
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

export const getRecentSearches = (): SearchKeyword[] => {
  try {
    const searches = localStorage.getItem('recentSearches');
    if (searches) {
      return JSON.parse(searches);
    }
  } catch (error) {
    console.error('Error loading recent searches:', error);
  }
  return [];
};

export const clearSearchHistory = (): void => {
  try {
    localStorage.removeItem('recentSearches');
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
};