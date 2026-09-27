import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AiProvidersService } from './ai-providers.service';
import { CreateAiProviderDto, UpdateAiProviderDto } from './dto/create-provider.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('AI Providers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('ai-providers')
export class AiProvidersController {
  constructor(private readonly aiProvidersService: AiProvidersService) {}

  @Get('active')
  @ApiOperation({ summary: 'List all currently active AI providers (available for extension users)' })
  @ApiResponse({ status: 200, description: 'List of active providers returned' })
  async getActive() {
    return this.aiProvidersService.findActive();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Register a new AI provider' })
  @ApiResponse({ status: 201, description: 'Provider registered successfully' })
  async create(@Body() createAiProviderDto: CreateAiProviderDto) {
    return this.aiProvidersService.create(createAiProviderDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Get full configuration for all AI providers' })
  async findAll() {
    return this.aiProvidersService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Get single AI provider details' })
  async findOne(@Param('id') id: string) {
    return this.aiProvidersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Update AI provider details, toggle active state, or set default' })
  async update(
    @Param('id') id: string,
    @Body() updateAiProviderDto: UpdateAiProviderDto,
  ) {
    return this.aiProvidersService.update(id, updateAiProviderDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Delete AI provider configuration' })
  async remove(@Param('id') id: string) {
    return this.aiProvidersService.remove(id);
  }

  @Get(':id/health')
  @ApiOperation({ summary: 'Check provider configuration and connectivity status' })
  async checkHealth(@Param('id') id: string) {
    return this.aiProvidersService.checkHealth(id);
  }
}