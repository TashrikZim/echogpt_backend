import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'EchoGPT REST API is running!';
  }

  async getHealthStatus() {
    let dbStatus = 'DISCONNECTED';
    let dbLatencyMs = 0;

    const start = Date.now();
    try {
      // Direct raw database ping
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'CONNECTED';
      dbLatencyMs = Date.now() - start;
    } catch {
      dbStatus = 'ERROR';
    }

    const memoryUsage = process.memoryUsage();

    return {
      status: dbStatus === 'CONNECTED' ? 'OK' : 'DEGRADED',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
      },
      system: {
        nodeVersion: process.version,
        memoryUsageMB: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        },
      },
    };
  }
}