import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { QuotaGuard } from './guards/quota.guard';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, QuotaGuard],
  exports: [SubscriptionsService, QuotaGuard],
})
export class SubscriptionsModule {}