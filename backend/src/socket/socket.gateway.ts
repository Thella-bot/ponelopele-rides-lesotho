import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PrismaService } from '../prisma.service';
import { Ride } from '@prisma/client';

@WebSocketGateway({ cors: true })
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  constructor(private prisma: PrismaService) {}

  @SubscribeMessage('driverOnline')
  async handleDriverOnline(
    @MessageBody() data: { driverId: string; lat: number; lng: number; heading: number },
  ) {
    await this.prisma.driver.upsert({
      where: { id: data.driverId },
      update: { lat: data.lat, lng: data.lng, heading: data.heading, isOnline: true },
      create: {
        id: data.driverId,
        lat: data.lat,
        lng: data.lng,
        heading: data.heading,
        isOnline: true,
      },
    });
  }

  async sendRideToNearbyDrivers(ride: Ride) {
    const drivers = await this.getNearbyDrivers(ride.pickupLat, ride.pickupLng);
    drivers.forEach((driver) => {
      this.server.to(driver.id).emit('newRide', ride);
    });
  }

  private async getNearbyDrivers(lat: number, lng: number, radius = 5000) {
    const drivers = await this.prisma.$queryRaw<
      { id: string; lat: number; lng: number }[]
    >`
      SELECT id, lat, lng
      FROM "Driver"
      WHERE "isOnline" = true AND "isInRide" = false AND ST_DWithin(
        ST_MakePoint(lng, lat)::geography,
        ST_MakePoint(${lng}, ${lat})::geography,
        ${radius}
      )
    `;
    return drivers;
  }
}