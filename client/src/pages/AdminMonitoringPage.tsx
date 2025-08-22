import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RefreshCw, Activity, HardDrive, Cpu, MemoryStick, Clock, Server, Network, Zap, Monitor } from "lucide-react";

interface SystemMetrics {
  timestamp: number;
  cpu: {
    usage: number;
    loadAverage: number[];
    cores: number;
    model: string;
    speed: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
    cached: number;
    buffers: number;
  };
  process: {
    pid: number;
    ppid: number;
    memoryUsage: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
    cpuUsage: {
      user: number;
      system: number;
    };
    uptime: number;
  };
  network: {
    interfaces: Array<{
      name: string;
      address: string;
      family: string;
      internal: boolean;
    }>;
  };
  disk: {
    usage: number;
    total: number;
    free: number;
    usagePercent: number;
  } | null;
  system: {
    uptime: number;
    hostname: string;
    platform: string;
    arch: string;
    nodeVersion: string;
    totalMemory: number;
    freeMemory: number;
    release: string;
  };
}

export default function AdminMonitoringPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: metrics, refetch, isLoading, error } = useQuery<SystemMetrics>({
    queryKey: ['/api/admin/monitoring'],
    refetchInterval: autoRefresh ? 5000 : false, // Auto-refresh every 5 seconds
  });

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}დ ${hours}ს ${minutes}წთ`;
    } else if (hours > 0) {
      return `${hours}ს ${minutes}წთ`;
    } else {
      return `${minutes}წთ`;
    }
  };

  const getStatusColor = (percentage: number): string => {
    if (percentage < 50) return "text-green-600";
    if (percentage < 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (percentage: number): { variant: "default" | "secondary" | "destructive" | "outline", text: string } => {
    if (percentage < 50) return { variant: "default", text: "მუშაობს კარგად" };
    if (percentage < 80) return { variant: "secondary", text: "საშუალო დატვირთვა" };
    return { variant: "destructive", text: "მაღალი დატვირთვა" };
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">მონიტორინგის შეცდომა</h2>
          <p className="text-red-700">სისტემის მეტრიკების ჩატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ მოგვიანებით.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">სისტემის მონიტორინგი</h1>
          <p className="text-gray-600">რეალურ დროში სისტემის მეტრიკები</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Activity className="h-4 w-4 mr-2" />
              {autoRefresh ? "ავტო-განახლება ჩართული" : "ავტო-განახლება გამორთული"}
            </Button>
          </div>
          
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            განახლება
          </Button>
        </div>
      </div>

      {metrics && (
        <>
          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU გამოყენება</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.cpu.usage.toFixed(1)}%</div>
                <Progress value={metrics.cpu.usage} className="mt-2" />
                <Badge {...getStatusBadge(metrics.cpu.usage)} className="mt-2">
                  {getStatusBadge(metrics.cpu.usage).text}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">მეხსიერება</CardTitle>
                <MemoryStick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.memory.usagePercent}%</div>
                <Progress value={metrics.memory.usagePercent} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">სისტემის აპტაიმი</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatUptime(metrics.system.uptime)}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  უწყვეტი მუშაობა
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU ბირთვები</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.cpu.cores}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  ხელმისაწვდომი ბირთვები
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>სისტემის ინფორმაცია</CardTitle>
                <CardDescription>სერვერის დეტალები</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">ჰოსტნეიმი:</span>
                  <span>{metrics.system.hostname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">პლატფორმა:</span>
                  <span>{metrics.system.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">არქიტექტურა:</span>
                  <span>{metrics.system.arch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Node.js ვერსია:</span>
                  <span>{metrics.system.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">პროცესის ID:</span>
                  <span>{metrics.process.pid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">მთლიანი მეხსიერება:</span>
                  <span>{formatBytes(metrics.system.totalMemory)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CPU დატვირთვის საშუალო</CardTitle>
                <CardDescription>1წთ, 5წთ, 15წთ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">1 წუთის საშუალო:</span>
                  <span>{metrics.cpu.loadAverage[0]?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">5 წუთის საშუალო:</span>
                  <span>{metrics.cpu.loadAverage[1]?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">15 წუთის საშუალო:</span>
                  <span>{metrics.cpu.loadAverage[2]?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    ბოლო განახლება: {new Date(metrics.timestamp).toLocaleTimeString('ka-GE')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* პროცესის დეტალური ინფორმაცია */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  პროცესის მეხსიერება
                </CardTitle>
                <CardDescription>Node.js პროცესის მეხსიერების გამოყენება</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">RSS მეხსიერება:</span>
                    <span>{formatBytes(metrics.process.memoryUsage.rss)}</span>
                  </div>
                  <Progress 
                    value={(metrics.process.memoryUsage.rss / metrics.memory.total) * 100} 
                    className="h-2" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Heap გამოყენებული:</span>
                    <span>{formatBytes(metrics.process.memoryUsage.heapUsed)}</span>
                  </div>
                  <Progress 
                    value={(metrics.process.memoryUsage.heapUsed / metrics.process.memoryUsage.heapTotal) * 100} 
                    className="h-2" 
                  />
                </div>
                <div className="text-sm space-y-1 pt-2 border-t">
                  <div className="flex justify-between">
                    <span>Heap მთლიანი:</span>
                    <span>{formatBytes(metrics.process.memoryUsage.heapTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>გარე მეხსიერება:</span>
                    <span>{formatBytes(metrics.process.memoryUsage.external)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>პროცესის აპტაიმი:</span>
                    <span>{formatUptime(metrics.process.uptime)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="h-5 w-5 mr-2" />
                  CPU დეტალები
                </CardTitle>
                <CardDescription>პროცესორის სპეციფიკაციები</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">მოდელი:</span>
                    <span className="text-right max-w-[200px] truncate">{metrics.cpu.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">სიხშირე:</span>
                    <span>{(metrics.cpu.speed / 1000).toFixed(1)} MHz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">ბირთვები:</span>
                    <span>{metrics.cpu.cores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">მიმდინარე გამოყენება:</span>
                    <span>{metrics.cpu.usage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="pt-2 border-t text-sm">
                  <div className="flex justify-between">
                    <span>მომხმარებლის CPU:</span>
                    <span>{metrics.process.cpuUsage.user} μs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>სისტემური CPU:</span>
                    <span>{metrics.process.cpuUsage.system} μs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* დისკი და მეხსიერების დეტალები */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MemoryStick className="h-5 w-5 mr-2" />
                  მეხსიერების დეტალები
                </CardTitle>
                <CardDescription>სისტემური მეხსიერების განაწილება</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">გამოყენებული:</span>
                    <span>{formatBytes(metrics.memory.used)} ({metrics.memory.usagePercent}%)</span>
                  </div>
                  <Progress value={metrics.memory.usagePercent} className="h-2" />
                </div>
                <div className="text-sm space-y-1 pt-2 border-t">
                  <div className="flex justify-between">
                    <span>მთლიანი:</span>
                    <span>{formatBytes(metrics.memory.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>თავისუფალი:</span>
                    <span>{formatBytes(metrics.memory.free)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ბუფერები:</span>
                    <span>{formatBytes(metrics.memory.buffers)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>კეშირებული:</span>
                    <span>{formatBytes(metrics.memory.cached)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {metrics.disk && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HardDrive className="h-5 w-5 mr-2" />
                    დისკის გამოყენება
                  </CardTitle>
                  <CardDescription>საცავის მდგომარეობა</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">გამოყენებული:</span>
                      <span>{formatBytes(metrics.disk.usage)} ({metrics.disk.usagePercent}%)</span>
                    </div>
                    <Progress value={metrics.disk.usagePercent} className="h-2" />
                  </div>
                  <div className="text-sm space-y-1 pt-2 border-t">
                    <div className="flex justify-between">
                      <span>მთლიანი ზომა:</span>
                      <span>{formatBytes(metrics.disk.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>თავისუფალი:</span>
                      <span>{formatBytes(metrics.disk.free)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ქსელური ინტერფეისები */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="h-5 w-5 mr-2" />
                ქსელური ინტერფეისები
              </CardTitle>
              <CardDescription>ხელმისაწვდომი ქსელური კავშირები</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {metrics.network.interfaces.map((iface, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{iface.name}</h4>
                      <Badge variant={iface.internal ? "secondary" : "default"} className="text-xs">
                        {iface.internal ? "შიდა" : "გარე"}
                      </Badge>
                    </div>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>მისამართი:</span>
                        <span className="font-mono">{iface.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ოჯახი:</span>
                        <span>{iface.family}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* სისტემური ინფორმაცია სრული */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Monitor className="h-5 w-5 mr-2" />
                სისტემური სპეციფიკაციები
              </CardTitle>
              <CardDescription>სრული სისტემური ინფორმაცია</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm border-b pb-1">ოპერაციული სისტემა</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>ჰოსტი:</strong> {metrics.system.hostname}</div>
                    <div><strong>პლატფორმა:</strong> {metrics.system.platform}</div>
                    <div><strong>არქიტექტურა:</strong> {metrics.system.arch}</div>
                    <div><strong>Release:</strong> {metrics.system.release}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm border-b pb-1">Runtime</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>Node.js:</strong> {metrics.system.nodeVersion}</div>
                    <div><strong>PID:</strong> {metrics.process.pid}</div>
                    <div><strong>PPID:</strong> {metrics.process.ppid}</div>
                    <div><strong>პროცესის აპტაიმი:</strong> {formatUptime(metrics.process.uptime)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm border-b pb-1">მეხსიერება</h4>
                  <div className="text-sm space-y-1">
                    <div><strong>სისტემური მთლიანი:</strong> {formatBytes(metrics.system.totalMemory)}</div>
                    <div><strong>სისტემური თავისუფალი:</strong> {formatBytes(metrics.system.freeMemory)}</div>
                    <div><strong>სისტემის აპტაიმი:</strong> {formatUptime(metrics.system.uptime)}</div>
                    <div><strong>ბოლო განახლება:</strong> {new Date(metrics.timestamp).toLocaleString('ka-GE')}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}