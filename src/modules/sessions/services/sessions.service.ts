import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../entities/session.entity';
import { Seat, SeatStatus } from '../../seats/entities/seats.entity';
import { CreateSessionDto } from '../dtos/create-session.dto';
import { UpdateSessionDto } from '../dtos/update-session.dto';


@Injectable()
export class SessionsService {
    private readonly logger = new Logger(SessionsService.name);

    constructor(
        @InjectRepository(Session)
        private sessionRepository: Repository<Session>,
        @InjectRepository(Seat)
        private seatRepository: Repository<Seat>,
    ) { }

    async create(createSessionDto: CreateSessionDto): Promise<Session> {
        const session = this.sessionRepository.create(createSessionDto);
        const savedSession = await this.sessionRepository.save(session);

        // Criar assentos automaticamente
        await this.generateSeats(savedSession.id, createSessionDto.totalSeats);

        this.logger.log(`Sessão criada: ${savedSession.id}`);
        return savedSession;
    }

    async findAll(): Promise<Session[]> {
        return this.sessionRepository.find({
            where: { isActive: true },
            order: { startTime: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Session> {
        const session = await this.sessionRepository.findOne({
            where: { id },
            relations: ['seats'],
        });

        if (!session) {
            throw new NotFoundException(`Sessão ${id} não encontrada`);
        }

        return session;
    }

    async update(id: string, updateSessionDto: UpdateSessionDto): Promise<Session> {
        const session = await this.findOne(id);
        Object.assign(session, updateSessionDto);
        return this.sessionRepository.save(session);
    }

    async remove(id: string): Promise<void> {
        const session = await this.findOne(id);
        session.isActive = false;
        await this.sessionRepository.save(session);
        this.logger.log(`Sessão desativada: ${id}`);
    }

    private async generateSeats(sessionId: string, totalSeats: number): Promise<void> {
        const seats: Seat[] = [];
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const seatsPerRow = Math.ceil(totalSeats / rows.length);

        let seatCount = 0;

        for (const row of rows) {
            for (let seatNum = 1; seatNum <= seatsPerRow && seatCount < totalSeats; seatNum++) {
                const seat = this.seatRepository.create({
                    sessionId,
                    rowLetter: row,
                    seatNumber: seatNum,
                    status: SeatStatus.AVAILABLE,
                });
                seats.push(seat);
                seatCount++;
            }
        }

        await this.seatRepository.save(seats);
        this.logger.log(`${seats.length} assentos criados para sessão ${sessionId}`);
    }
}