import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";


@Exclude()
export class ReservationResponseDto {
    @ApiProperty({ description: 'ID da reserva' })
    @Expose()
    id: string;

    @ApiProperty({ description: 'ID do usuário' })
    @Expose()
    userId: string;

    @ApiProperty({ description: 'ID da sessão' })
    @Expose()
    sessionId: string;

    @ApiProperty({ description: ' ID do assento' })
    @Expose()
    seatId: string;

    @ApiProperty({ description: 'Status da reserva' })
    @Expose()
    status: string;

    @ApiProperty({ description: 'Expiração da reserva em' })
    @Expose()
    expiresAt: Date;

    @ApiProperty({ description: 'Tempo restante da reserva' })
    @Expose()
    remainingTime: number;

    @ApiProperty({ description: 'Data de criação da reserva' })
    @Expose()
    createdAt: Date;
}