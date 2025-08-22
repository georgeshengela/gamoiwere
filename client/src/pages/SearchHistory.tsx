import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, TrendingUp, Clock, ArrowLeft } from "lucide-react";

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

const SearchHistory = () => {
  // Fetch last 1000 search keywords from database API
  const { data: searchHistory = [], isLoading, isError } = useQuery({
    queryKey: ['/api/search-keywords', { limit: 1000 }],
    queryFn: async () => {
      const response = await fetch('/api/search-keywords?limit=1000');
      if (!response.ok) {
        throw new Error('Failed to fetch search history');
      }
      return response.json() as Promise<SearchKeyword[]>;
    }
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                ძიების ისტორია
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                ყველა ძიების მონაცემები
              </p>
            </div>
          </div>

          {/* Loading grid */}
          <div className="grid gap-6">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                ძიების ისტორია
              </h1>
              <p className="text-red-600 dark:text-red-400">
                შეცდომა მონაცემების ჩატვირთვისას
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (searchHistory.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                ძიების ისტორია
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                ძიების მონაცემები ვერ მოიძებნა
              </p>
            </div>
          </div>

          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              ძიების ისტორია ცარიელია
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              ჯერ არ მოხდა ძიება საიტზე
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              ძიების ისტორია
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              სულ {searchHistory.length} ძიების მონაცემი
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  სულ ძიებები
                </h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {searchHistory.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  ყველაზე პოპულარული
                </h3>
                <p className="text-lg font-medium text-green-600 dark:text-green-400">
                  {searchHistory[0]?.keyword || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  ბოლო ძიება
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {searchHistory[0] ? formatDate(searchHistory[0].lastSearched) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search History List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((search, index) => (
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
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            მთავარ გვერდზე დაბრუნება
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchHistory;