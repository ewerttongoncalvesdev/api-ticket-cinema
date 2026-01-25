import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SeatResponseDto {
    @ApiProperty({
        description: 'ID do assento',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @Expose()
    id: string;

    @ApiProperty({
        description: 'ID da sessão',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @Expose()
    sessionId: string;

    @ApiProperty({
        description: 'Fileira (A, B, C, D)',
        example: 'A'
    })
    @Expose()
    rowLetter: string;

    @ApiProperty({
        description: 'Número do assento',
        example: 12
    })
    @Expose()
    seatNumber: number;

    @ApiProperty({
        description: 'Status do assento',
        example: 'available'
    })
    @Expose()
    status: string;

    @ApiProperty({
        description: 'Identificador do assento (ex: A1)',
        example: 'A12'
    })
    @Expose()
    seatIdentifier: string;

    @ApiProperty({
        description: 'Está bloqueado',
        example: false
    })
    @Expose()
    isBlocked: boolean;

    @ApiProperty({
        description: 'Reservado até',
        required: false,
        nullable: true,
        type: Date
    })
    @Expose()
    reservedUntil: Date | null;
}