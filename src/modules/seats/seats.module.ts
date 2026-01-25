import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Seat } from "./entities/seats.entity";
import { SeatsService } from "./services/seats.service";
import { SeatsController } from "./controllers/seats.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Seat])],
    controllers: [SeatsController],
    providers: [SeatsService],
    exports: [SeatsService],
})
export class SeatsModule {}