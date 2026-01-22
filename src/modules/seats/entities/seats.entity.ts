import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index, } from 'typeorm';
import { Session } from '../../sessions/entities/session.entity';
import { Reservation } from '../../reservations/entities/reservation.entity';

export enum SeatStatus {
    AVAILABLE = 'available',
    RESERVED = 'reserved',
    SOLD = 'sold',
}

@Entity('seats')
@Index(['sessionId', 'rowLetter', 'seatNumber'], { unique: true })
export class Seat {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    sessionId: string;

    // A, B, C, D
    @Column({ length: 2 })
    rowLetter: string;

    // 1, 2, 3, 4
    @Column({ type: 'int' })
    seatNumber: number;

    @Column({
        type: 'enum',
        enum: SeatStatus,
        default: SeatStatus.AVAILABLE,
    })
    status: SeatStatus;

    @Column({ nullable: true })
    currentReservationId: string;

    @Column({ type: 'timestamp', nullable: true })
    reservedUntil: Date;

    // Para assentos em manutenção
    @Column({ default: false })
    isBlocked: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relações
    @ManyToOne(() => Session, (session) => session.seats, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'sessionId' })
    session: Session;

    @OneToMany(() => Reservation, (reservation) => reservation.seat)
    reservations: Reservation[];

    // Helper para identificação visual
    get seatIdentifier(): string {
        return `${this.rowLetter}${this.seatNumber}`;
    }

    // Verificar se está disponível
    isAvailable(): boolean {
        if (this.isBlocked || this.status === SeatStatus.SOLD) {
            return false;
        }

        if (this.status === SeatStatus.RESERVED && this.reservedUntil) {
            return new Date() > this.reservedUntil;
        }

        return this.status === SeatStatus.AVAILABLE;
    }
}