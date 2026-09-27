import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Subscriptions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user subscription details and remaining quota' })
  @ApiResponse({ status: 200, description: 'Subscription quota details returned' })
  async getMySubscription(@Request() req: any) {
    return this.subscriptionsService.getUserSubscription(req.user.id);
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade account to PREMIUM plan (500 requests/day)' })
  @ApiResponse({ status: 200, description: 'Upgraded successfully to PREMIUM' })
  async upgrade(@Request() req: any) {
    return this.subscriptionsService.upgrade(req.user.id);
  }

  @Post('downgrade')
  @ApiOperation({ summary: 'Downgrade account to FREE plan (20 requests/day)' })
  @ApiResponse({ status: 200, description: 'Downgraded successfully to FREE' })
  async downgrade(@Request() req: any) {
    return this.subscriptionsService.downgrade(req.user.id);
  }
}