import { Controller, Post, Body, Put, Param } from '@nestjs/common';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Put(':id/location')
  updateLocation(
    @Param('id') id: string,
    @Body() body: { lat: number; lng: number; heading: number },
  ) {
    return this.driversService.updateDriverLocation(id, body.lat, body.lng, body.heading);
  }
}