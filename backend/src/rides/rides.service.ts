import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { CreateRideDto } from './dto/create-ride.dto';

@Injectable()
export class RidesService {
  constructor(private prisma: PrismaService, private socketGateway: SocketGateway) {}

  async createRide(data: CreateRideDto) {
    // TODO: Replace with a more sophisticated fare calculation,
    // possibly in a background job to avoid blocking.
    const fare = this.calculateFare(data.pickupLat, data.pickupLng, data.destLat, data.destLng);

    const ride = await this.prisma.ride.create({
      data: {
        pickupLat: data.pickupLat,
        pickupLng: data.pickupLng,
        pickupName: data.pickupName,
        destLat: data.destLat,
        destLng: data.destLng,
        destName: data.destName,
        passengerId: data.passengerId,
        fare: fare,
      },
    });

    this.socketGateway.sendRideToNearbyDrivers(ride);
    return ride;
  }

  async getRideHistory(passengerId: string) {
    return this.prisma.ride.findMany({
      where: {
        passengerId: passengerId,
      },
      orderBy: {
        createdAt: 'desc', // Assuming rides have a createdAt field
      },
    });
  }

  private calculateFare(
    pickupLat: number,
    pickupLng: number,
    destLat: number,
    destLng: number,
  ): number {
    // Haversine formula to calculate distance
    const toRad = (x) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(destLat - pickupLat);
    const dLon = toRad(destLng - pickupLng);
    const lat1 = toRad(pickupLat);
    const lat2 = toRad(destLat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    return Math.round(distanceKm * 15); // ~15 LSL per km
  }
}