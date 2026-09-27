import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiProvidersService } from '../ai-providers/ai-providers.service';
import { SendMessageDto, UpdateConversationTitleDto } from './dto/chat.dto';
import { AiProvider, Conversation } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiProvidersService: AiProvidersService,
  ) {}

  async sendMessage(userId: string, dto: SendMessageDto) {
    // 1. Resolve Provider with explicit typing
    let provider: AiProvider | null = null;
    if (dto.providerId) {
      provider = await this.aiProvidersService.getInternalProvider(dto.providerId);
    } else {
      provider = await this.aiProvidersService.getDefaultProvider();
    }

    if (!provider) {
      throw new BadRequestException('No active AI provider configured');
    }

    // 2. Find or Create Conversation with explicit typing
    let conversation: Conversation | null = null;
    if (dto.conversationId) {
      conversation = await this.prisma.conversation.findFirst({
        where: { id: dto.conversationId, userId },
      });
      if (!conversation) {
        throw new NotFoundException('Conversation not found or belongs to another user');
      }
    } else {
      const generatedTitle =
        dto.message.length > 30 ? `${dto.message.slice(0, 30)}...` : dto.message;

      conversation = await this.prisma.conversation.create({
        data: {
          userId,
          title: generatedTitle,
        },
      });
    }

    // 3. Persist User Message
    const userMessage = await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: dto.message,
      },
    });

    // 4. Generate AI Completion
    const assistantReplyContent = await this.dispatchAiRequest(
      provider,
      dto.message,
      conversation.id,
    );

    // 5. Persist Assistant Reply
    const estimatedTokens = Math.ceil((dto.message.length + assistantReplyContent.length) / 4);

    const assistantMessage = await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        providerId: provider.id,
        role: 'ASSISTANT',
        content: assistantReplyContent,
        tokensUsed: estimatedTokens,
      },
    });

    return {
      conversationId: conversation.id,
      provider: {
        id: provider.id,
        name: provider.name,
        type: provider.type,
      },
      userMessage,
      assistantMessage,
    };
  }

  private async dispatchAiRequest(
    provider: AiProvider,
    userPrompt: string,
    conversationId: string,
  ): Promise<string> {
    return `[${provider.name} - ${provider.modelIdentifier}] EchoGPT response to: "${userPrompt}"`;
  }

  async getUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  async getConversationMessages(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            provider: {
              select: { id: true, name: true, type: true },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async updateConversationTitle(
    userId: string,
    conversationId: string,
    dto: UpdateConversationTitleDto,
  ) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { title: dto.title },
    });
  }

  async deleteConversation(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    await this.prisma.conversation.delete({
      where: { id: conversationId },
    });

    return { message: 'Conversation deleted successfully' };
  }
}