import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async updateDriverLocation(driverId: string, lat: number, lng: number, heading: number) {
    return this.prisma.driver.upsert({
      where: { id: driverId },
      update: { lat, lng, heading, isOnline: true },
      create: { id: driverId, lat, lng, heading, isOnline: true },
    });
  }
}
