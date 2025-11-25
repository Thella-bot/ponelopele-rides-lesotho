import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SocketGateway } from '../socket/socket.gateway';
import { CreateRideDto } from './dto/create-ride.dto';
import { RideStatus } from '@prisma/client';

@Injectable()
export class RidesService {
  constructor(private prisma: PrismaService, private socketGateway: SocketGateway) {}

  async createRide(data: CreateRideDto) {
    // For now, let's assume a default duration for fare calculation at ride creation
    // In a real scenario, this might come from a route estimation service
    const estimatedDurationMinutes = 20;

    const { baseFare, distanceFare, timeFare, surgeMultiplier, totalFare } =
      await this.calculateFare(
        data.pickupLat,
        data.pickupLng,
        data.destLat,
        data.destLng,
        estimatedDurationMinutes,
      );

    const ride = await this.prisma.ride.create({
      data: {
        pickupLat: data.pickupLat,
        pickupLng: data.pickupLng,
        pickupName: data.pickupName,
        destLat: data.destLat,
        destLng: data.destLng,
        destName: data.destName,
        passengerId: data.passengerId,
        baseFare,
        distanceFare,
        timeFare,
        surgeMultiplier,
        totalFare,
        status: RideStatus.REQUESTED,
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

  async estimateFare(
    pickupLat: number,
    pickupLng: number,
    destLat: number,
    destLng: number,
    durationMinutes?: number,
  ) {
    return this.calculateFare(pickupLat, pickupLng, destLat, destLng, durationMinutes);
  }

  private async calculateFare(
    pickupLat: number,
    pickupLng: number,
    destLat: number,
    destLng: number,
    durationMinutes: number = 0, // Optional duration for estimation
  ): Promise<{
    baseFare: number;
    distanceFare: number;
    timeFare: number;
    surgeMultiplier: number;
    totalFare: number;
  }> {
    // Fetch active pricing configuration
    let pricingConfig = await this.prisma.pricingConfig.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    // Fallback to default values if no active config is found
    if (!pricingConfig) {
      console.warn('No active PricingConfig found, using default fallback values.');
      pricingConfig = {
        id: 'default',
        baseFare: 20.0,
        perKmRate: 10.0,
        perMinuteRate: 2.0,
        surgeMultiplier: 1.0,
        isActive: true,
        createdAt: new Date(),
      };
    }

    const { baseFare, perKmRate, perMinuteRate, surgeMultiplier } = pricingConfig;

    // Haversine formula to calculate distance
    const toRad = (x: number) => (x * Math.PI) / 180;
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

    const calculatedDistanceFare = distanceKm * perKmRate;
    const calculatedTimeFare = durationMinutes * perMinuteRate;

    const totalBeforeSurge = baseFare + calculatedDistanceFare + calculatedTimeFare;
    const finalTotalFare = totalBeforeSurge * surgeMultiplier;

    return {
      baseFare: parseFloat(baseFare.toFixed(2)),
      distanceFare: parseFloat(calculatedDistanceFare.toFixed(2)),
      timeFare: parseFloat(calculatedTimeFare.toFixed(2)),
      surgeMultiplier: parseFloat(surgeMultiplier.toFixed(2)),
      totalFare: parseFloat(finalTotalFare.toFixed(2)),
    };
  }
}