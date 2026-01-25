import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Seat } from "./entities/seats.entity";
import { SeatsService } from "./services/seats.service";

@Module({
    imports: [TypeOrmModule.forFeature([Seat])],
    controllers: [],
    providers: [SeatsService],
    exports: [SeatsService],
})
export class SeatsModule {}