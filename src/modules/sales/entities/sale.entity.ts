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
    price(price: any) {
        throw new Error('Method not implemented.');
    }
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
    paymentId: string | null;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @Column({ type: 'timestamp', nullable: true })
    refundedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

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