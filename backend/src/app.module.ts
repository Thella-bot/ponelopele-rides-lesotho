import { Module } from '@nestjs/common';
import { AdminModule } from '@adminjs/nestjs';
import { RidesModule } from './rides/rides.module';
import { DriversModule } from './drivers/drivers.module';
import { SocketModule } from './socket/socket.module';
import { AuthModule } from './auth/auth.module';
import { Ride } from '@prisma/client';

@Module({
  imports: [
    AdminModule.createAdminAsync({
      useFactory: () => ({
        adminJsOptions: {
          rootPath: '/admin',
          resources: [Ride],
        },
      }),
    }),
    RidesModule,
    DriversModule,
    SocketModule,
    AuthModule,
  ],
})
export class AppModule {}