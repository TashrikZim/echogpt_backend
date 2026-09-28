import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PerformSearchDto } from './dto/search.dto';

@Injectable()
export class WebSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(userId: string, dto: PerformSearchDto) {
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

  async getRecentSearches(userId: string, limit = 5) {
    const searches = await this.prisma.webSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        query: true,
        createdAt: true,
      },
    });

    return searches;
  }

  async getSuggestions(query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const trimmed = query.trim().toLowerCase();

    // Default static common search suggestions
const baseSuggestions = [
  `${trimmed} tutorial`,
  `${trimmed} guide`,
  `${trimmed} documentation`,
  `${trimmed} examples`,
  `${trimmed} api`,
];

    // Query historical searches that match the prefix
    const historical = await this.prisma.webSearch.findMany({
      where: {
        query: {
          contains: trimmed,
          mode: 'insensitive',
        },
      },
      select: { query: true },
      distinct: ['query'],
      take: 5,
    });

    const historicalQueries = historical.map((h) => h.query);
    const combined = Array.from(new Set([...historicalQueries, ...baseSuggestions]));

    return combined.slice(0, 5);
  }
}