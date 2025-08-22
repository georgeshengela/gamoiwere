import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, CheckCircle, Languages, Globe, Play, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CategoryStats {
  total: number;
  byLevel: Array<{ level: number; count: number }>;
  keyCategories: Array<{ api_id: string; name: string; level: number; turkish_name?: string; translated_categories?: string }>;
  translation: {
    total: number;
    withTurkish: number;
    withGeorgian: number;
    georgianPercentage: number;
    recentTranslations: Array<{ 
      api_id: string; 
      turkish_name: string; 
      translated_categories: string; 
      level: number 
    }>;
  };
}

export default function CategoryProgressPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: stats, isLoading, refetch } = useQuery<CategoryStats>({
    queryKey: ['/api/admin/category-progress'],
    refetchInterval: 2000, // Auto-refresh every 2 seconds
  });

  const translateMutation = useMutation({
    mutationFn: () => 
      apiRequest('/api/admin/translate-categories', {
        method: 'POST',
        data: {},
      }),
    onSuccess: (data) => {
      toast({
        title: "Translation Started",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/category-progress'] });
    },
    onError: (error: any) => {
      toast({
        title: "Translation Error",
        description: error.message || "Failed to start translation process",
        variant: "destructive",
      });
    },
  });

  const stopTranslationMutation = useMutation({
    mutationFn: () => 
      apiRequest('/api/admin/stop-translation', {
        method: 'POST',
        data: {},
      }),
    onSuccess: (data) => {
      toast({
        title: "Translation Stopped",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/category-progress'] });
    },
    onError: (error: any) => {
      toast({
        title: "Stop Error",
        description: error.message || "Failed to stop translation process",
        variant: "destructive",
      });
    },
  });

  // Query translation status for real-time updates
  const { data: translationStatus } = useQuery({
    queryKey: ['/api/admin/translation-status'],
    refetchInterval: 1000, // Check every second during translation
    enabled: true,
  });

  const expectedTotal = 5102;
  const currentTotal = stats?.total || 0;
  const progressPercentage = Math.min((currentTotal / expectedTotal) * 100, 100);
  
  const translationStats = stats?.translation;
  const georgianProgress = translationStats?.georgianPercentage || 0;
  const turkishProgress = translationStats ? (translationStats.withTurkish / translationStats.total) * 100 : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Category Population & Translation Progress</h1>
        <div className="flex items-center gap-3">
          {translationStatus?.inProgress ? (
            <Button
              onClick={() => stopTranslationMutation.mutate()}
              disabled={stopTranslationMutation.isPending}
              className="flex items-center gap-2"
              variant="destructive"
            >
              <Square className={`h-4 w-4 ${stopTranslationMutation.isPending ? 'animate-spin' : ''}`} />
              {stopTranslationMutation.isPending ? 'Stopping...' : 'Stop Translation'}
            </Button>
          ) : (
            <Button
              onClick={() => translateMutation.mutate()}
              disabled={translateMutation.isPending || translationStatus?.inProgress}
              className="flex items-center gap-2"
              variant="default"
            >
              <Play className={`h-4 w-4 ${translateMutation.isPending ? 'animate-spin' : ''}`} />
              {translateMutation.isPending ? 'Starting...' : 'Start Translation'}
            </Button>
          )}
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Translation Status Indicator */}
      {translationStatus?.inProgress && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <div>
                  <p className="font-semibold text-blue-800">Translation in Progress</p>
                  <p className="text-sm text-blue-600">
                    Processing categories continuously. {translationStatus.stats?.processed || 0} completed, {translationStatus.remaining || 0} remaining
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">
                  Duration: {Math.floor((translationStatus.stats?.duration || 0) / 60)}m {(translationStatus.stats?.duration || 0) % 60}s
                </p>
                <p className="text-sm text-blue-600">
                  Errors: {translationStatus.stats?.errors || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              of {expectedTotal.toLocaleString()} expected
            </p>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {progressPercentage.toFixed(1)}% complete
            </p>
          </CardContent>
        </Card>

        {/* Population Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentTotal === expectedTotal ? 'Complete' : 'In Progress'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentTotal === expectedTotal 
                ? 'All categories loaded'
                : 'Population scripts running'
              }
            </p>
          </CardContent>
        </Card>

        {/* API Connection */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Source</CardTitle>
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">External API</div>
            <p className="text-xs text-muted-foreground">
              Real category data with authentic API IDs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Translation Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Turkish Translation Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turkish Names</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{translationStats?.withTurkish.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {translationStats?.total.toLocaleString() || 0} categories
            </p>
            <Progress value={turkishProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {turkishProgress.toFixed(1)}% complete
            </p>
          </CardContent>
        </Card>

        {/* Georgian Translation Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Georgian Translations</CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{translationStats?.withGeorgian.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              AI-powered translations
            </p>
            <Progress value={georgianProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {georgianProgress.toFixed(2)}% complete
            </p>
          </CardContent>
        </Card>

        {/* Translation Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Translation Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {georgianProgress > 0 ? 'Active' : 'Pending'}
            </div>
            <p className="text-xs text-muted-foreground">
              {georgianProgress > 0 
                ? 'AI translation system running'
                : 'Awaiting translation start'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Level Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Categories by Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.byLevel.map((level) => (
              <div key={level.level} className="flex items-center justify-between">
                <span className="text-sm font-medium">Level {level.level}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((level.count / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {level.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Translation Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Georgian Translations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {translationStats?.recentTranslations.map((translation) => (
              <div key={translation.api_id} className="p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {translation.api_id}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Level {translation.level}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    🇹🇷 {translation.turkish_name}
                  </div>
                  <div className="text-sm font-medium">
                    🇬🇪 {translation.translated_categories}
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center text-muted-foreground py-4">
                No translations yet. Start the translation process to see real-time updates.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Categories Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Key Categories with Translations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats?.keyCategories.map((category) => (
              <div key={category.api_id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1">
                  <div className="font-medium">{category.name}</div>
                  {category.turkish_name && (
                    <div className="text-xs text-muted-foreground">🇹🇷 {category.turkish_name}</div>
                  )}
                  {category.translated_categories && (
                    <div className="text-xs text-green-600">🇬🇪 {category.translated_categories}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {category.api_id}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Level {category.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}