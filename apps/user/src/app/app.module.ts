import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserProfileModule } from './user-profile/user-profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, // ← Add PrismaModule
    UserProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
