import { ApiProperty } from '@nestjs/swagger';
import { ProviderType } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAiProviderDto {
  @ApiProperty({ example: 'OpenAI GPT-4o' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ProviderType, example: ProviderType.OPENAI })
  @IsEnum(ProviderType)
  @IsNotEmpty()
  type: ProviderType;

  @ApiProperty({ example: 'sk-proj-xxxxxxxxxxxx', description: 'API Key for the provider' })
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @ApiProperty({ example: 'https://api.openai.com/v1', required: false })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiProperty({ example: 'gpt-4o' })
  @IsString()
  @IsNotEmpty()
  modelIdentifier: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: false, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAiProviderDto {
  @ApiProperty({ example: 'OpenAI GPT-4o Mini', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'sk-proj-updatedkey', required: false })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiProperty({ example: 'https://api.openai.com/v1', required: false })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiProperty({ example: 'gpt-4o-mini', required: false })
  @IsOptional()
  @IsString()
  modelIdentifier?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}