import { Controller, Post, Body, Get, UseGuards, Request, Query } from '@nestjs/common';
import { RidesService } from './rides.service';
import { SocketGateway } from '../socket/socket.gateway';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Assuming this guard exists
import { EstimateFareDto } from './dto/estimate-fare.dto';

@Controller('rides')
export class RidesController {
  constructor(
    private ridesService: RidesService,
    private socket: SocketGateway
  ) {}

  @Post()
  async create(@Body() data: any) {
    const ride = await this.ridesService.createRide(data);
    this.socket.server.emit('newRide', ride);
    return ride;
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getRideHistory(@Request() req) {
    return this.ridesService.getRideHistory(req.user.id);
  }

  @Get('estimate')
  async estimateFare(@Query() query: EstimateFareDto) {
    const { pickupLat, pickupLng, destLat, destLng, durationMinutes } = query;
    return this.ridesService.estimateFare(
      pickupLat,
      pickupLng,
      destLat,
      destLng,
      durationMinutes,
    );
  }
}