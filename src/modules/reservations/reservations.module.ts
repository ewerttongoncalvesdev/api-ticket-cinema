import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Type } from "class-transformer";
import { Reservation } from "./entities/reservation.entity";
import { Seat } from "../seats/entities/seats.entity";
import { Session } from "../sessions/entities/session.entity";
import { Sale } from "../sales/entities/sale.entity";
import { ReservationsService } from "./services/reservations.service";

@Module({
    imports: [TypeOrmModule.forFeature([Reservation, Seat, Session, Sale])],
    controllers: [],
    providers: [ReservationsService],
    exports: [ReservationsService],
})
export class ReservationsModule {}