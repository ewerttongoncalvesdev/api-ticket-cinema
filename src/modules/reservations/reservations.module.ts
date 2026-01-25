import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reservation } from "./entities/reservation.entity";
import { Seat } from "../seats/entities/seats.entity";
import { Session } from "../sessions/entities/session.entity";
import { Sale } from "../sales/entities/sale.entity";
import { ReservationsService } from "./services/reservations.service";
import { ReservationsController } from "./controllers/reservations.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Reservation, Seat, Session, Sale])],
    controllers: [ReservationsController],
    providers: [ReservationsService],
    exports: [ReservationsService],
})
export class ReservationsModule {}