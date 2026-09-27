import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAiProviderDto, UpdateAiProviderDto } from './dto/create-provider.dto';

@Injectable()
export class AiProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  private maskApiKey(key: string): string {
    if (!key || key.length <= 8) return '****';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }

  async create(dto: CreateAiProviderDto) {
    if (dto.isDefault) {
      await this.prisma.aiProvider.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const provider = await this.prisma.aiProvider.create({
      data: dto,
    });

    return {
      ...provider,
      apiKey: this.maskApiKey(provider.apiKey),
    };
  }

  async findAll() {
    const providers = await this.prisma.aiProvider.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return providers.map((p) => ({
      ...p,
      apiKey: this.maskApiKey(p.apiKey),
    }));
  }

  async findActive() {
    const providers = await this.prisma.aiProvider.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        modelIdentifier: true,
        isDefault: true,
      },
    });
    return providers;
  }

  async findOne(id: string) {
    const provider = await this.prisma.aiProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException(`AI Provider with ID ${id} not found`);
    }

    return {
      ...provider,
      apiKey: this.maskApiKey(provider.apiKey),
    };
  }

  async getInternalProvider(id: string) {
    const provider = await this.prisma.aiProvider.findUnique({
      where: { id },
    });

    if (!provider || !provider.isActive) {
      throw new BadRequestException('Selected AI Provider is inactive or not found');
    }

    return provider; // Returns raw key internally for Chat calls
  }

  async getDefaultProvider() {
    const defaultProvider = await this.prisma.aiProvider.findFirst({
      where: { isDefault: true, isActive: true },
    });

    if (defaultProvider) return defaultProvider;

    return this.prisma.aiProvider.findFirst({
      where: { isActive: true },
    });
  }

  async update(id: string, dto: UpdateAiProviderDto) {
    await this.findOne(id);

    if (dto.isDefault) {
      await this.prisma.aiProvider.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.aiProvider.update({
      where: { id },
      data: dto,
    });

    return {
      ...updated,
      apiKey: this.maskApiKey(updated.apiKey),
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.aiProvider.delete({
      where: { id },
    });
    return { message: 'AI Provider removed successfully' };
  }

  async checkHealth(id: string) {
    const provider = await this.prisma.aiProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException('AI Provider not found');
    }

    const hasKey = !!provider.apiKey && provider.apiKey.length > 5;

    return {
      id: provider.id,
      name: provider.name,
      type: provider.type,
      modelIdentifier: provider.modelIdentifier,
      status: hasKey && provider.isActive ? 'HEALTHY' : 'DEGRADED',
      details: hasKey ? 'Configured with API credentials' : 'Missing or invalid API credentials',
      timestamp: new Date().toISOString(),
    };
  }
}