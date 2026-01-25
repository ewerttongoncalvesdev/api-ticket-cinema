import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ReservationResponseDto {
    @ApiProperty({ 
        description: 'ID da reserva',
        example: 'uuid-da-reserva' 
    })
    @Expose()
    id: string;

    @ApiProperty({ description: 'ID do usuário' })
    @Expose()
    userId: string;

    @ApiProperty({ description: 'ID da sessão' })
    @Expose()
    sessionId: string;

    @ApiProperty({ description: 'ID do assento' })
    @Expose()
    seatId: string;

    @ApiProperty({ 
        description: 'Status da reserva',
        example: 'pending' 
    })
    @Expose()
    status: string;

    @ApiProperty({ 
        description: 'Expiração da reserva em',
        nullable: true 
    })
    @Expose()
    expiresAt: Date | null;

    @ApiProperty({ 
        description: 'Tempo restante da reserva (segundos)',
        example: 300 
    })
    @Expose()
    remainingTime: number | null;

    @ApiProperty({ description: 'Data de criação da reserva' })
    @Expose()
    createdAt: Date;
}