import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Seat, SeatStatus } from '../../seats/entities/seats.entity';
import { Session } from '../../sessions/entities/session.entity';
import { CacheService } from '../../cache/services/cache.service';
import { MessagingService } from '../../messaging/services/messaging.service';
import { CreateReservationDto } from '../dtos/create-reservation.dto';
import { ConfirmPaymentDto } from '../dtos/confirm-payment.dto';
import { Sale, PaymentMethod, PaymentStatus } from '../../sales/entities/sale.entity';

@Injectable()
export class ReservationsService {
    private readonly logger = new Logger(ReservationsService.name);
    private readonly reservationTimeout: number;

    constructor(
        @InjectRepository(Reservation)
        private reservationRepository: Repository<Reservation>,
        @InjectRepository(Seat)
        private seatRepository: Repository<Seat>,
        @InjectRepository(Session)
        private sessionRepository: Repository<Session>,
        @InjectRepository(Sale)
        private saleRepository: Repository<Sale>,
        private dataSource: DataSource,
        private cacheService: CacheService,
        private messagingService: MessagingService,
        private configService: ConfigService,
    ) {
        this.reservationTimeout = this.configService.get<number>('app.reservationTimeoutSeconds') ?? 30;
    }

    async create(createReservationDto: CreateReservationDto): Promise<Reservation[]> {
        const { userId, sessionId, seatIds } = createReservationDto;

        const session = await this.sessionRepository.findOne({
            where: { id: sessionId, isActive: true },
        });

        if (!session) {
            throw new NotFoundException('Sessão não encontrada ou inativa');
        }

        const reservations: Reservation[] = [];

        for (const seatId of seatIds) {
            const reservation = await this.reserveSeatWithLock(userId, sessionId, seatId, session.ticketPrice);
            reservations.push(reservation);
        }

        return reservations;
    }

    private async reserveSeatWithLock(
        userId: string,
        sessionId: string,
        seatId: string,
        price: number,
    ): Promise<Reservation> {
        const lockKey = `seat:lock:${seatId}`;
        const maxRetries = 3;
        let retries = 0;

        while (retries < maxRetries) {
            const lockAcquired = await this.cacheService.acquireLock(lockKey, 10);

            if (!lockAcquired) {
                retries++;
                this.logger.warn(`Falha ao adquirir lock para assento ${seatId}, tentativa ${retries}`);
                await this.sleep(100 * retries);
                continue;
            }

            try {
                const reservation = await this.dataSource.transaction(async (manager) => {
                    const seat = await manager.findOne(Seat, {
                        where: { id: seatId },
                        lock: { mode: 'pessimistic_write' },
                    });

                    if (!seat) {
                        throw new NotFoundException(`Assento ${seatId} não encontrado`);
                    }

                    if (seat.isBlocked) {
                        throw new BadRequestException(`Assento ${seat.seatIdentifier} está bloqueado`);
                    }

                    const now = new Date();
                    const isAvailable =
                        seat.status === SeatStatus.AVAILABLE ||
                        (seat.status === SeatStatus.RESERVED &&
                            seat.reservedUntil &&
                            now > seat.reservedUntil);

                    if (!isAvailable) {
                        throw new ConflictException(
                            `Assento ${seat.seatIdentifier} não está disponível`,
                        );
                    }

                    const expiresAt = new Date(Date.now() + this.reservationTimeout * 1000);

                    const reservation = manager.create(Reservation, {
                        userId,
                        sessionId,
                        seatId,
                        price,
                        status: ReservationStatus.PENDING,
                        expiresAt,
                    });

                    const savedReservation = await manager.save(Reservation, reservation);

                    seat.status = SeatStatus.RESERVED;
                    seat.currentReservationId = savedReservation.id;
                    seat.reservedUntil = expiresAt;
                    await manager.save(Seat, seat);

                    return savedReservation;
                });

                await this.messagingService.publishReservationCreated(reservation.id, {
                    userId,
                    sessionId,
                    seatId,
                    expiresAt: reservation.expiresAt,
                });

                return reservation;
            } finally {
                await this.cacheService.releaseLock(lockKey);
            }
        }

        throw new ConflictException('Não foi possível reservar o assento. Tente novamente.');
    }

    async confirmPayment(confirmPaymentDto: ConfirmPaymentDto): Promise<Sale> {
        const { reservationId, paymentMethod, paymentId } = confirmPaymentDto;

        if (!reservationId || !paymentMethod || !paymentId) {
            throw new BadRequestException('Dados de pagamento incompletos.');
        }

        return await this.dataSource.transaction(async (manager) => {
            const reservation = await manager.findOne(Reservation, {
                where: { id: reservationId },
                lock: { mode: 'pessimistic_write' },
            });

            if (!reservation) throw new NotFoundException('Reserva não encontrada');
            if (!reservation.canBeConfirmed()) throw new BadRequestException('Reserva expirada ou já confirmada');

            const seat = await manager.findOne(Seat, { where: { id: reservation.seatId } });
            if (!seat) throw new NotFoundException('Assento não encontrado');

            reservation.status = ReservationStatus.CONFIRMED;
            reservation.confirmedAt = new Date();
            reservation.paymentId = paymentId;
            await manager.save(Reservation, reservation);

            seat.status = SeatStatus.SOLD;
            seat.currentReservationId = null;
            seat.reservedUntil = null;
            await manager.save(Seat, seat);

            const sale = manager.create(Sale, {
                userId: reservation.userId,
                sessionId: reservation.sessionId,
                reservationId: reservation.id,
                seatId: reservation.seatId,
                seatIdentifier: seat.seatIdentifier,
                price: reservation.price,
                paymentMethod: paymentMethod as PaymentMethod,
                paymentStatus: PaymentStatus.APPROVED,
                paymentId,
            });

            const savedSale = await manager.save(Sale, sale);

            await this.messagingService.publishPaymentConfirmed(reservation.id, {
                saleId: savedSale.id,
                userId: reservation.userId,
                seatId: reservation.seatId,
            });

            return savedSale;
        });
    }

    async findByUser(userId: string): Promise<Reservation[]> {
        return this.reservationRepository.find({
            where: { userId },
            relations: ['seat', 'session'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Reservation> {
        const reservation = await this.reservationRepository.findOne({
            where: { id },
            relations: ['seat', 'session', 'user'],
        });

        if (!reservation) {
            throw new NotFoundException(`Reserva ${id} não encontrada`);
        }

        return reservation;
    }

    async expireReservation(reservationId: string): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            // 1. Lock isolado da reserva
            const reservation = await manager.findOne(Reservation, {
                where: { id: reservationId },
                lock: { mode: 'pessimistic_write' },
            });

            // LOGS DE DEPURAÇÃO PARA ENTENDER O ROLLBACK
            if (!reservation) {
                this.logger.warn(`[EXPIRE] Reserva ${reservationId} não encontrada. Cancelando.`);
                return;
            }

            if (reservation.status !== ReservationStatus.PENDING) {
                this.logger.warn(`[EXPIRE] Reserva ${reservationId} já possui status ${reservation.status}. Cancelando.`);
                return;
            }

            // 2. Atualização dos status
            reservation.status = ReservationStatus.EXPIRED;
            await manager.save(Reservation, reservation);

            const seat = await manager.findOne(Seat, { where: { id: reservation.seatId } });
            if (seat) {
                seat.status = SeatStatus.AVAILABLE;
                seat.currentReservationId = null;
                seat.reservedUntil = null;
                await manager.save(Seat, seat);

                try {
                    await this.messagingService.publishReservationExpired(reservationId, {
                        seatId: seat.id,
                    });
                } catch (msgError) {
                    this.logger.error(`[EXPIRE] Erro ao notificar expiração: ${msgError.message}`);
                   
                }
            }

            this.logger.log(`✅ Reserva ${reservationId} expirada com sucesso.`);
        });
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}