import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { SendMessageDto, UpdateConversationTitleDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuotaGuard } from '../subscriptions/guards/quota.guard';

@ApiTags('Chat')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  @UseGuards(QuotaGuard)
  @ApiOperation({
    summary: 'Send message to AI provider and get response (Consumes 1 daily quota)',
  })
  @ApiResponse({ status: 200, description: 'Message processed and response recorded' })
  @ApiResponse({ status: 429, description: 'Daily request quota exceeded' })
  async sendMessage(@Request() req: any, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.id, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get list of all conversations for current user' })
  async getConversations(@Request() req: any) {
    return this.chatService.getUserConversations(req.user.id);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get complete message history for a specific conversation' })
  async getConversationMessages(
    @Request() req: any,
    @Param('id') conversationId: string,
  ) {
    return this.chatService.getConversationMessages(req.user.id, conversationId);
  }

  @Patch('conversations/:id')
  @ApiOperation({ summary: 'Update conversation title' })
  async updateTitle(
    @Request() req: any,
    @Param('id') conversationId: string,
    @Body() dto: UpdateConversationTitleDto,
  ) {
    return this.chatService.updateConversationTitle(req.user.id, conversationId, dto);
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Delete conversation and all associated messages' })
  async deleteConversation(
    @Request() req: any,
    @Param('id') conversationId: string,
  ) {
    return this.chatService.deleteConversation(req.user.id, conversationId);
  }
}