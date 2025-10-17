import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AddressModule } from './address/address.module';
import { BankAccountModule } from './bank-account/bank-account.module';
import { DriverLicenseModule } from './driver-license/driver-license.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProfileModule,
    DriverLicenseModule,
    BankAccountModule,
    AddressModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
