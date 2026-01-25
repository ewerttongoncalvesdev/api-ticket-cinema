import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
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

    @Column({ type: 'uuid', nullable: true })
    currentReservationId: string | null;

    @Column({ type: 'timestamp', nullable: true })
    reservedUntil: Date | null;

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
    session: Session | null;

    @OneToMany(() => Reservation, (reservation) => reservation.seat)
    reservations: Reservation[];

    // Helper para identificação visual (Ex: A1, B10)
    get seatIdentifier(): string {
        return `${this.rowLetter}${this.seatNumber}`;
    }

    // Verificar se está disponível logicamente
    isAvailable(): boolean {
        // Se estiver bloqueado manualmente ou já vendido, não está disponível
        if (this.isBlocked || this.status === SeatStatus.SOLD) {
            return false;
        }

        // Se estiver reservado, verificamos se o tempo de reserva já expirou no servidor
        if (this.status === SeatStatus.RESERVED) {
            if (this.reservedUntil) {
                // Se a data atual passou da data limite, o assento volta a ficar "disponível"
                return new Date() > this.reservedUntil;
            }
            return false;
        }

        return this.status === SeatStatus.AVAILABLE;
    }
}