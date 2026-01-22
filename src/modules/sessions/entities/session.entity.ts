import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Seat } from "../../seats/entities/seats.entity";

@Entity("sessions")
@Index(['movieTitle', 'startTime'])
export class Session {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    movieTitle: string;

    @Column({ type: 'text', nullable: true })
    movieDescription: string;

    @Column()
    room: string;

    @Column({ type: 'timestamp' })
    startTime: Date;

    @Column({ type: 'timestamp' })
    endTime: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    ticketPrice: number;

    @Column({ default: 16 })
    totalSeats: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relações
    @OneToMany(() => Seat, (seat) => seat.session, { cascade: true })
    seats: Seat[];

    //  Virtual fields (não salvos no banco)
    availableSeats?: number;
    reservedSeats?: number;
    soldSeats?: number;

}