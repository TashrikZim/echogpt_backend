import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PerformSearchDto {
  @ApiProperty({ example: 'NestJS best practices for microservices' })
  @IsString()
  @IsNotEmpty()
  query: string;
}