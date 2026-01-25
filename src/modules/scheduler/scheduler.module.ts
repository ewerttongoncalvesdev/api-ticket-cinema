import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reservation } from "../reservations/entities/reservation.entity";
import { ReservationsModule } from "../reservations/reservations.module";
import { SchedulerService } from "./services/scheduler.service";

@Module({
    imports: [TypeOrmModule.forFeature([Reservation]), ReservationsModule],
    providers: [SchedulerService],
    exports: [SchedulerService],
})
export class SchedulerModule { }