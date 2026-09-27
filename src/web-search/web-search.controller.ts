import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WebSearchService } from './web-search.service';
import { PerformSearchDto } from './dto/search.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuotaGuard } from '../subscriptions/guards/quota.guard';

@ApiTags('Web Search')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('search')
export class WebSearchController {
  constructor(private readonly webSearchService: WebSearchService) {}

  @Post()
  @UseGuards(QuotaGuard)
  @ApiOperation({ summary: 'Perform web search query (Consumes 1 daily quota)' })
  @ApiResponse({ status: 201, description: 'Search executed and recorded' })
  @ApiResponse({ status: 429, description: 'Daily request quota exceeded' })
  async search(@Request() req: any, @Body() dto: PerformSearchDto) {
    return this.webSearchService.search(req.user.id, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Retrieve recent search history for current user' })
  async getHistory(@Request() req: any) {
    return this.webSearchService.getHistory(req.user.id);
  }
}