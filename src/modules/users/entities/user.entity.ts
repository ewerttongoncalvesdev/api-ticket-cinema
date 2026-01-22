import { Column, Entity, OneToMany, UpdateDateColumn, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { Reservation } from "../../reservations/entities/reservation.entity";
import { Sale } from "../../sales/entities/sale.entity";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    name: string;

    @Column()
    phone: string;

    @Column()
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relações
    @OneToMany(() => Reservation, (reservation) => reservation.user)
    reservations: Reservation[];

    @OneToMany(() => Sale, (sale) => sale.user)
    sales: Sale[];

}