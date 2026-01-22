import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Session } from "inspector";
import { Seat } from "../../seats/entities/seats.entity";

export enum ReservationStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
}

@Entity("reservations")
@Index(['userId', 'status'])
@Index(['expireAt'])
export class Reservation {
    [x: string]: any;
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    userId: string;

    @Column()
    sessionId: string;

    @Column()
    seatId: string;

    @Column({
        type: "enum",
        enum: ReservationStatus,
        default: ReservationStatus.PENDING
    })
    status: ReservationStatus;

    @Column({ type: 'timestamp' })
    expireAt: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ nullable: true })
    paymentId: string;

    @Column({ type: 'timestamp', nullable: true })
    confirmedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    cancelledAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relações
    @ManyToOne(() => User, (user) => user.reservations, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Session, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'sessionId' })
    session: Session;

    @ManyToOne(() => Seat, (seat) => seat.reservations, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'seatId' })
    seat: Seat;

    // Helpers
    isExpired(): boolean {
        return new Date() > this.expiresAt && this.status === ReservationStatus.PENDING;
    }

    canBeConfirmed(): boolean {
        return this.status === ReservationStatus.PENDING && !this.isExpired();
    }

    getRemainingTime(): number {
        const now = new Date();
        const expiration = new Date(this.expiresAt);
        return Math.max(0, expiration.getTime() - now.getTime());
    }

}