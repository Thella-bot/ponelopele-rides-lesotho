import { Module } from '@nestjs/common';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';
import { PrismaService } from '../prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [SocketModule],
  controllers: [RidesController],
  providers: [RidesService, PrismaService],
})
export class RidesModule {}
