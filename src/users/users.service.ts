import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    // Atomically create the user and initialize their default Free subscription
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: createUserDto.email,
          passwordHash,
          fullName: createUserDto.fullName,
        },
      });

      await tx.subscription.create({
        data: {
          userId: user.id,
          plan: 'FREE',
          dailyRequestLimit: 20,
        },
      });

      const { passwordHash: _, ...result } = user;
      return result;
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { subscription: true },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { subscription: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }
}