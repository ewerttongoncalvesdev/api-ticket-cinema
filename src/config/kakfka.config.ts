import { registerAs } from '@nestjs/config';

export default registerAs('kafka', () => ({
  clientId: process.env.KAFKA_CLIENT_ID || 'ticket-cinema-app',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9094').split(','),
  groupId: process.env.KAFKA_GROUP_ID || 'ticket-cinema-group',

  topics: {
    reservationCreated: process.env.KAFKA_TOPIC_RESERVATION_CREATED || 'reservation.created',
    reservationExpired: process.env.KAFKA_TOPIC_RESERVATION_EXPIRED || 'reservation.expired',
    paymentConfirmed: process.env.KAFKA_TOPIC_PAYMENT_CONFIRMED || 'payment.confirmed',
    seatReleased: process.env.KAFKA_TOPIC_SEAT_RELEASED || 'seat.released',
  },

  producer: {
    allowAutoTopicCreation: true,
    transactionTimeout: 30000,
  },

  consumer: {
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    rebalanceTimeout: 60000,
    allowAutoTopicCreation: true,
  },

  retry: {
    initialRetryTime: 100,
    retries: 8,
    maxRetryTime: 30000,
    multiplier: 2,
  },
}));