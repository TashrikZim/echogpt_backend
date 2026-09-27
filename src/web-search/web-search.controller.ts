import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Retrieve full search history for current user' })
  async getHistory(@Request() req: any) {
    return this.webSearchService.getHistory(req.user.id);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Retrieve recent search queries (default 5)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 5 })
  async getRecent(
    @Request() req: any,
    @Query('limit') limit?: number,
  ) {
    return this.webSearchService.getRecentSearches(req.user.id, limit ? Number(limit) : 5);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get auto-complete search suggestions based on keyword' })
  @ApiQuery({ name: 'q', required: true, type: String, example: 'nest' })
  async getSuggestions(@Query('q') query: string) {
    return this.webSearchService.getSuggestions(query);
  }
}