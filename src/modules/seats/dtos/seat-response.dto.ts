import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SeatResponseDto {
    @ApiProperty({ description: 'ID do assento' })
    @Expose()
    id: string;

    @ApiProperty({ description: 'ID da sessão' })
    @Expose()
    sessionId: string;

    @ApiProperty({ description: 'Fileira (A, B, C, D)' })
    @Expose()
    rowLetter: string;

    @ApiProperty({ description: 'Número do assento' })
    @Expose()
    seatNumber: number;

    @ApiProperty({ description: 'Status do assento' })
    @Expose()
    status: string;

    @ApiProperty({ description: 'Identificador do assento (ex: A1)' })
    @Expose()
    seatIdentifier: string;

    @ApiProperty({ description: 'Está bloqueado' })
    @Expose()
    isBlocked: boolean;

    @ApiProperty({ description: 'Reservado até', required: false })
    @Expose()
    reservedUntil?: Date;
}