import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SubscriptionsService } from '../subscriptions.service';

@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      return false;
    }

    // Validates quota and consumes 1 credit atomically
    return this.subscriptionsService.checkAndConsumeQuota(user.id);
  }
}