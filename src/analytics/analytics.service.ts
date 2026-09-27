import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardOverview() {
    const [
      totalUsers,
      totalConversations,
      totalMessages,
      totalSearches,
      subscriptionCounts,
      recentLogs,
      logStats,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.conversation.count(),
      this.prisma.chatMessage.count(),
      this.prisma.webSearch.count(),
      this.prisma.subscription.groupBy({
        by: ['plan'],
        _count: { plan: true },
      }),
      this.prisma.apiUsageLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: { email: true, role: true },
          },
        },
      }),
      this.prisma.apiUsageLog.aggregate({
        _avg: { responseTimeMs: true },
        _count: { id: true },
      }),
    ]);

    const planBreakdown = {
      FREE: 0,
      PREMIUM: 0,
    };

    subscriptionCounts.forEach((item) => {
      planBreakdown[item.plan] = item._count.plan;
    });

    return {
      metrics: {
        totalUsers,
        totalConversations,
        totalMessages,
        totalSearches,
        totalApiRequests: logStats._count.id,
        averageLatencyMs: Math.round(logStats._avg.responseTimeMs || 0),
      },
      planDistribution: planBreakdown,
      recentActivityLogs: recentLogs,
    };
  }
}