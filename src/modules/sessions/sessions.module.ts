import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Session } from "./entities/session.entity";
import { Seat } from "../seats/entities/seats.entity";
import { SessionsService } from "./services/sessions.service";
import { SessionsController } from "./controllers/sessions.controller";

@Module({
    imports: [TypeOrmModule.forFeature([Session, Seat])],
    providers: [SessionsService],
    controllers: [SessionsController],
    exports: [SessionsService],
})

export class SessionsModule { }