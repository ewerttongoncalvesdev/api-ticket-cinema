import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seat, SeatStatus } from '../entities/seats.entity';
import { SeatsAvailabilityDto } from '../dtos/seats-availability.dto';


@Injectable()
export class SeatsService {
  private readonly logger = new Logger(SeatsService.name);

  constructor(
    @InjectRepository(Seat)
    private seatRepository: Repository<Seat>,
  ) {}

  async findBySession(sessionId: string): Promise<Seat[]> {
    return this.seatRepository.find({
      where: { sessionId },
      order: { rowLetter: 'ASC', seatNumber: 'ASC' },
    });
  }

  async getAvailability(sessionId: string): Promise<SeatsAvailabilityDto> {
    const seats = await this.findBySession(sessionId);

    // Liberar assentos expirados
    const now = new Date();
    for (const seat of seats) {
      if (
        seat.status === SeatStatus.RESERVED &&
        seat.reservedUntil &&
        now > seat.reservedUntil
      ) {
        seat.status = SeatStatus.AVAILABLE;
        seat.reservedUntil = null;
        seat.currentReservationId = null;
        await this.seatRepository.save(seat);
      }
    }

    const totalSeats = seats.length;
    const availableSeats = seats.filter((s) => s.status === SeatStatus.AVAILABLE).length;
    const reservedSeats = seats.filter((s) => s.status === SeatStatus.RESERVED).length;
    const soldSeats = seats.filter((s) => s.status === SeatStatus.SOLD).length;

    return {
      sessionId,
      totalSeats,
      availableSeats,
      reservedSeats,
      soldSeats,
      seats: seats.map((seat) => ({
        id: seat.id,
        sessionId: seat.sessionId,
        rowLetter: seat.rowLetter,
        seatNumber: seat.seatNumber,
        status: seat.status,
        seatIdentifier: seat.seatIdentifier,
        isBlocked: seat.isBlocked,
        reservedUntil: seat.reservedUntil,
      })),
    };
  }

  async findOne(id: string): Promise<Seat> {
    const seat = await this.seatRepository.findOne({ where: { id } });
    if (!seat) {
      throw new NotFoundException(`Assento ${id} não encontrado`);
    }
    return seat;
  }

  async reserveSeat(
    seatId: string,
    reservationId: string,
    expiresAt: Date,
  ): Promise<Seat> {
    const seat = await this.findOne(seatId);

    seat.status = SeatStatus.RESERVED;
    seat.currentReservationId = reservationId;
    seat.reservedUntil = expiresAt;

    await this.seatRepository.save(seat);
    this.logger.log(`Assento ${seat.seatIdentifier} reservado`);
    return seat;
  }

  async confirmSeat(seatId: string): Promise<Seat> {
    const seat = await this.findOne(seatId);
    
    seat.status = SeatStatus.SOLD;
    seat.currentReservationId = null;
    seat.reservedUntil = null;

    await this.seatRepository.save(seat);
    this.logger.log(`Assento ${seat.seatIdentifier} confirmado`);
    return seat;
  }

  async releaseSeat(seatId: string): Promise<Seat> {
    const seat = await this.findOne(seatId);
    
    seat.status = SeatStatus.AVAILABLE;
    seat.currentReservationId = null;
    seat.reservedUntil = null;

    await this.seatRepository.save(seat);
    this.logger.log(`Assento ${seat.seatIdentifier} liberado`);
    return seat;
  }
}