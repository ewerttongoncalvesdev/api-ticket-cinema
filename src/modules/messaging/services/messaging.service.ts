import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Producer } from '@nestjs/microservices/external/kafka.interface';
import { Kafka } from 'kafkajs';


@Injectable()
export class MessagingService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MessagingService.name);
    private kafka: Kafka;
    private producer: Producer;

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        const clientId = this.configService.get<string>('kafka.clientId') || 'ticket-cinema-app';
        const brokers = this.configService.get<string[]>('kafka.brokers') || ['localhost:9094'];

        this.kafka = new Kafka({
            clientId,
            brokers,
            retry: this.configService.get('kafka.retry') || {
                initialRetryTime: 100,
                retries: 8,
                maxRetryTime: 30000,
                multiplier: 2,
            },
        });

        this.producer = this.kafka.producer(
            this.configService.get('kafka.producer') || {
                allowAutoTopicCreation: true,
                transactionTimeout: 30000,
            }
        );

        await this.producer.connect();
        this.logger.log('✅ Kafka Producer conectado');
    }

    async onModuleDestroy() {
        await this.producer.disconnect();
        this.logger.log('Kafka Producer desconectado');
    }

    async publish(topic: string, message: any): Promise<void> {
        try {
            await this.producer.send({
                topic,
                messages: [
                    {
                        key: message.id || Date.now().toString(),
                        value: JSON.stringify(message),
                        timestamp: Date.now().toString(),
                    },
                ],
            });
            this.logger.debug(`📨 Mensagem publicada no tópico: ${topic}`);
        } catch (error) {
            this.logger.error(`❌ Erro ao publicar no tópico ${topic}:`, error);
            throw error;
        }
    }

    async publishReservationCreated(reservationId: string, data: any): Promise<void> {
        const topic = this.configService.get<string>('kafka.topics.reservationCreated') || 'reservation.created';
        await this.publish(topic, {
            id: reservationId,
            event: 'reservation.created',
            data,
            timestamp: new Date().toISOString()
        });
    }

    async publishPaymentConfirmed(reservationId: string, data: any): Promise<void> {
        const topic = this.configService.get<string>('kafka.topics.paymentConfirmed') || 'payment.confirmed';
        await this.publish(topic, {
            id: reservationId,
            event: 'payment.confirmed',
            data,
            timestamp: new Date().toISOString()
        });
    }

    async publishReservationExpired(reservationId: string, data: any): Promise<void> {
        const topic = this.configService.get<string>('kafka.topics.reservationExpired') || 'reservation.expired';
        await this.publish(topic, {
            id: reservationId,
            event: 'reservation.expired',
            data,
            timestamp: new Date().toISOString()
        });
    }

    async publishSeatReleased(seatId: string, data: any): Promise<void> {
        const topic = this.configService.get<string>('kafka.topics.seatReleased') || 'seat.released';
        await this.publish(topic, {
            id: seatId,
            event: 'seat.released',
            data,
            timestamp: new Date().toISOString()
        });
    }
}