import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [SocketGateway, PrismaService],
  exports: [SocketGateway],
})
export class SocketModule {}
