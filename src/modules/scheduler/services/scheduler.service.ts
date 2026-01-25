import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Reservation, ReservationStatus } from '../../reservations/entities/reservation.entity';
import { ReservationsService } from '../../reservations/services/reservations.service';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        @InjectRepository(Reservation)
        private readonly reservationRepository: Repository<Reservation>,
        private readonly reservationsService: ReservationsService,
    ) { }

    /**
     * Executa a cada 10 segundos para liberar assentos de reservas que expiraram.
     */
    @Cron(CronExpression.EVERY_10_SECONDS)
    async handleExpiredReservations() {
        try {
            const now = new Date();

            // Buscar reservas expiradas que ainda estão pendentes
            const expiredReservations = await this.reservationRepository.find({
                where: {
                    status: ReservationStatus.PENDING,
                    expiresAt: LessThan(now),
                },
                take: 50, // Limite para evitar picos de memória
            });

            if (expiredReservations.length === 0) {
                return;
            }

            this.logger.log(` Encontradas ${expiredReservations.length} reservas expiradas`);

            // Processar cada reserva expirada através do service
            for (const reservation of expiredReservations) {
                try {
                    await this.reservationsService.expireReservation(reservation.id);
                    this.logger.debug(`Reserva ${reservation.id} expirada e assento liberado`);
                } catch (error) {
                    this.logger.error(
                        `Erro ao expirar reserva ${reservation.id}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
                    );
                }
            }

            this.logger.log(` ${expiredReservations.length} reservas processadas`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            this.logger.error(`Erro no scheduler de expiração: ${message}`);
        }
    }

    /**
     * Job de limpeza - roda a cada 1 hora para remover registros muito antigos do banco.
     */
    @Cron(CronExpression.EVERY_HOUR)
    async cleanupOldReservations() {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const result = await this.reservationRepository
                .createQueryBuilder()
                .delete()
                .where('status IN (:...statuses)', {
                    statuses: [ReservationStatus.EXPIRED, ReservationStatus.CANCELLED],
                })
                .andWhere('createdAt < :date', { date: thirtyDaysAgo })
                .execute();

            if (result && typeof result.affected === 'number' && result.affected > 0) {
                this.logger.log(` Limpeza: ${result.affected} reservas antigas removidas`);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            this.logger.error(`Erro na limpeza de reservas: ${message}`);
        }
    }

    /**
     * Monitoramento de saúde (Health check) do sistema de reservas.
     */
    @Cron(CronExpression.EVERY_5_MINUTES)
    async healthCheck() {
        try {
            const pending = await this.reservationRepository.count({
                where: { status: ReservationStatus.PENDING },
            });

            const expired = await this.reservationRepository.count({
                where: { status: ReservationStatus.EXPIRED },
            });

            const confirmed = await this.reservationRepository.count({
                where: { status: ReservationStatus.CONFIRMED },
            });

            this.logger.debug(
                ` Reservas - Pendentes: ${pending}, Expiradas: ${expired}, Confirmadas: ${confirmed}`,
            );
        } catch (error) {
            this.logger.error('Erro ao gerar relatório de saúde das reservas');
        }
    }
}