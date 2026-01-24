import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Session } from "../../sessions/entities/session.entity";


export enum PaymentMethod {
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    PIX = "pix",
    CASH = "cash",
}

export enum PaymentStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REFUSED = "refused",
    REFUNDED = "refunded",
}

@Entity("sales")
@Index(['userId', 'createdAt'])
@Index(['sessionId'])
export class Sale {
    [x: string]: any;
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    userId: string;

    @Column()
    sessionId: string;

    @Column()
    reservationId: string;

    @Column()
    seatId: string;

    // A1, B3, etc.
    @Column({ length: 5 })
    seatIdentifier: string;

    @Column({
        type: "enum",
        enum: PaymentMethod,
        default: PaymentMethod.CREDIT_CARD
    })
    paymentMethod: PaymentMethod;

    @Column({
        type: "enum",
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    paymentStatus: PaymentStatus;

    @Column({ nullable: true })
    paynebtId: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'timestamp', nullable: true })
    refudedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relações
    @ManyToOne(() => User, (user) => user.sales, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Session, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'sessionId' })
    session: Session;

}
