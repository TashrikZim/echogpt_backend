import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserSubscription(userId: string) {
    let subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      // Auto-provision Free subscription if missing
      subscription = await this.prisma.subscription.create({
        data: {
          userId,
          plan: 'FREE',
          dailyRequestLimit: 20,
        },
      });
    }

    // Reset daily count if last reset was on a previous calendar day (UTC)
    const now = new Date();
    const lastReset = new Date(subscription.lastResetDate);

    const isNewDay =
      now.getUTCFullYear() !== lastReset.getUTCFullYear() ||
      now.getUTCMonth() !== lastReset.getUTCMonth() ||
      now.getUTCDate() !== lastReset.getUTCDate();

    if (isNewDay) {
      subscription = await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          currentDayRequests: 0,
          lastResetDate: now,
        },
      });
    }

    const remainingRequests = Math.max(
      0,
      subscription.dailyRequestLimit - subscription.currentDayRequests,
    );

    return {
      plan: subscription.plan,
      status: subscription.status,
      dailyRequestLimit: subscription.dailyRequestLimit,
      currentDayRequests: subscription.currentDayRequests,
      remainingRequests,
      lastResetDate: subscription.lastResetDate,
    };
  }

  async checkAndConsumeQuota(userId: string): Promise<boolean> {
    const status = await this.getUserSubscription(userId);

    if (status.remainingRequests <= 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Daily request quota exceeded. Please upgrade to Premium.',
          limit: status.dailyRequestLimit,
          current: status.currentDayRequests,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Atomic increment
    await this.prisma.subscription.update({
      where: { userId },
      data: {
        currentDayRequests: {
          increment: 1,
        },
      },
    });

    return true;
  }

  async upgrade(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription record not found');
    }

    if (subscription.plan === 'PREMIUM') {
      throw new BadRequestException('User is already on the PREMIUM plan');
    }

    return this.prisma.subscription.update({
      where: { userId },
      data: {
        plan: 'PREMIUM',
        dailyRequestLimit: 500,
      },
    });
  }

  async downgrade(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription record not found');
    }

    if (subscription.plan === 'FREE') {
      throw new BadRequestException('User is already on the FREE plan');
    }

    return this.prisma.subscription.update({
      where: { userId },
      data: {
        plan: 'FREE',
        dailyRequestLimit: 20,
      },
    });
  }
}