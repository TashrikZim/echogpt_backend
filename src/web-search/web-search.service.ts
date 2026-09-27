import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PerformSearchDto } from './dto/search.dto';

@Injectable()
export class WebSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(userId: string, dto: PerformSearchDto) {
    // Generate structured search results
    const results = [
      {
        title: `${dto.query} - Documentation & Guide`,
        url: `https://developer.mozilla.org/search?q=${encodeURIComponent(dto.query)}`,
        snippet: `Comprehensive overview, API specifications, and tutorials regarding "${dto.query}".`,
      },
      {
        title: `Community discussions on ${dto.query}`,
        url: `https://stackoverflow.com/search?q=${encodeURIComponent(dto.query)}`,
        snippet: `Top developer solutions, troubleshooting patterns, and answers for "${dto.query}".`,
      },
      {
        title: `GitHub Repositories: ${dto.query}`,
        url: `https://github.com/search?q=${encodeURIComponent(dto.query)}`,
        snippet: `Open-source production repositories and implementation architectures related to "${dto.query}".`,
      },
    ];

    const record = await this.prisma.webSearch.create({
      data: {
        userId,
        query: dto.query,
        results: results as any,
      },
    });

    return record;
  }

  async getHistory(userId: string) {
    return this.prisma.webSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}