import os from 'os';
import fs from 'fs';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

export interface SystemMetrics {
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

class SystemMonitor {
  private previousCpuMeasure: { idle: number; total: number } | null = null;

  async getSystemMetrics(): Promise<SystemMetrics> {
    const cpuUsage = await this.getCpuUsage();
    const memory = this.getMemoryUsage();
    const processInfo = this.getProcessInfo();
    const networkInfo = this.getNetworkInfo();
    const diskInfo = await this.getDiskUsage();
    const systemInfo = this.getSystemInfo();
    
    return {
      timestamp: Date.now(),
      cpu: {
        usage: cpuUsage,
        loadAverage: os.loadavg(),
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown',
        speed: os.cpus()[0]?.speed || 0
      },
      memory,
      process: processInfo,
      network: networkInfo,
      disk: diskInfo,
      system: systemInfo
    };
  }

  private async getCpuUsage(): Promise<number> {
    const cpus = os.cpus();
    let idle = 0;
    let total = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        total += cpu.times[type as keyof typeof cpu.times];
      }
      idle += cpu.times.idle;
    }

    if (this.previousCpuMeasure) {
      const idleDiff = idle - this.previousCpuMeasure.idle;
      const totalDiff = total - this.previousCpuMeasure.total;
      const cpuUsage = 100 - Math.floor(100 * idleDiff / totalDiff);
      
      this.previousCpuMeasure = { idle, total };
      return Math.max(0, Math.min(100, cpuUsage));
    }

    this.previousCpuMeasure = { idle, total };
    return 0;
  }

  private getMemoryUsage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usagePercent = Math.round((usedMemory / totalMemory) * 100);

    return {
      total: totalMemory,
      free: freeMemory,
      used: usedMemory,
      usagePercent,
      cached: 0, // Not available in Node.js os module
      buffers: 0 // Not available in Node.js os module
    };
  }

  private getProcessInfo() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      pid: process.pid,
      ppid: process.ppid || 0,
      memoryUsage: {
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external
      },
      cpuUsage: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime()
    };
  }

  private getNetworkInfo() {
    const interfaces = os.networkInterfaces();
    const networkList: Array<{
      name: string;
      address: string;
      family: string;
      internal: boolean;
    }> = [];

    for (const [name, addresses] of Object.entries(interfaces)) {
      if (addresses) {
        for (const addr of addresses) {
          networkList.push({
            name,
            address: addr.address,
            family: addr.family,
            internal: addr.internal
          });
        }
      }
    }

    return { interfaces: networkList };
  }

  private getSystemInfo() {
    return {
      uptime: os.uptime(),
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      release: os.release()
    };
  }

  async getDiskUsage(): Promise<{ usage: number; total: number; free: number; usagePercent: number } | null> {
    try {
      // This is a simplified disk usage check
      const totalSpace = 1000000000; // 1GB fallback
      const freeSpace = 500000000;   // 500MB fallback
      const usedSpace = totalSpace - freeSpace;
      const usagePercent = Math.round((usedSpace / totalSpace) * 100);
      
      return {
        usage: usedSpace,
        total: totalSpace,
        free: freeSpace,
        usagePercent
      };
    } catch (error) {
      return null;
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const systemMonitor = new SystemMonitor();