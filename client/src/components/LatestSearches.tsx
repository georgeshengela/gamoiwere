import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, TrendingUp } from "lucide-react";

interface SearchKeyword {
  id: number;
  keyword: string;
  searchUrl: string;
  searchCount: number;
  firstSearched: string;
  lastSearched: string;
  createdAt: string;
  updatedAt: string;
}

const LatestSearches = () => {
  // Fetch recent search keywords from database API
  const { data: recentSearches = [], isLoading, isError } = useQuery({
    queryKey: ['/api/search-keywords'],
    queryFn: async () => {
      const response = await fetch('/api/search-keywords?limit=50');
      if (!response.ok) {
        throw new Error('Failed to fetch search keywords');
      }
      return response.json() as Promise<SearchKeyword[]>;
    }
  });

  // Show loading state
  if (isLoading) {
    return (
      <section className="mb-8 md:mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                პოპულარული სიტყვები
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                იტვირთება...
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 animate-pulse">
                <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't show if there are no searches or there's an error
  if (isError || recentSearches.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 md:mb-12">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              ბოლოს მოძებნილი
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              რას ეძებენ სხვა მომხმარებლები
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {recentSearches.map((search, index) => (
            <Link
              key={`${search.keyword}-${index}`}
              href={search.searchUrl}
              className="group"
            >
              <div className="bg-gray-50 dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 rounded-full px-3 py-1.5 transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Search className="w-3 h-3 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {search.keyword}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {search.searchCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {recentSearches.length > 0 && (
          <div className="mt-4 text-center">
            <Link href="/search-history" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium transition-colors">
              ყველა ძიების ნახვა →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestSearches;