import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface SmartSearchResult {
  originalQuery: string;
  results: any;
  message: string;
  isLoading: boolean;
  error: string | null;
}

export const useSmartSearch = () => {
  const [searchResult, setSearchResult] = useState<SmartSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    if (!query.trim()) {
      setError('Search query cannot be empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest('/api/smart-search', {
        method: 'POST',
        data: { query: query.trim() },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setSearchResult({
        originalQuery: response.originalQuery,
        results: response.results,
        message: response.message,
        isLoading: false,
        error: null,
      });

    } catch (err) {
      console.error('Smart search error:', err);
      setError('Search failed. Please try again.');
      setSearchResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchResult,
    isLoading,
    error,
    search,
  };
};