import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ example: 'Summarize this page in 3 bullet points' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: 'd9b2d63d-a232-4752-b88d-e6b7c53d1000',
    required: false,
    description: 'Existing conversation ID. If omitted, a new conversation is initiated.',
  })
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiProperty({
    example: 'a0b1c2d3-e4f5-6789-0123-456789abcdef',
    required: false,
    description: 'Specific AI provider ID. If omitted, uses the active default provider.',
  })
  @IsOptional()
  @IsUUID()
  providerId?: string;
}

export class UpdateConversationTitleDto {
  @ApiProperty({ example: 'Summary of React Docs' })
  @IsString()
  @IsNotEmpty()
  title: string;
}