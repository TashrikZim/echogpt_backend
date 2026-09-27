import { Module } from '@nestjs/common';
import { WebSearchService } from './web-search.service';
import { WebSearchController } from './web-search.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule],
  controllers: [WebSearchController],
  providers: [WebSearchService],
  exports: [WebSearchService],
})
export class WebSearchModule {}