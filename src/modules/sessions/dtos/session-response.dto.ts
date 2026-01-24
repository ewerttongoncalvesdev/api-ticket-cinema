import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SessionResponseDto {
    @ApiProperty({ description: 'ID da sessão' })
    @Expose()
    id: string;

    @ApiProperty({ description: 'Título do filme' })
    @Expose()
    movieTitle: string;

    @ApiProperty({ description: 'Descrição do filme' })
    @Expose()
    movieDescription?: string;

    @ApiProperty({ description: 'Sala' })
    @Expose()
    room: string;

    @ApiProperty({ description: 'Horário de início' })
    @Expose()
    startTime: Date;

    @ApiProperty({ description: 'Horário de término' })
    @Expose()
    endTime: Date;

    @ApiProperty({ description: 'Preço do ingresso' })
    @Expose()
    ticketPrice: number;

    @ApiProperty({ description: 'Total de assentos' })
    @Expose()
    totalSeats: number;

    @ApiProperty({ description: 'Assentos disponíveis', required: false })
    @Expose()
    availableSeats?: number;

    @ApiProperty({ description: 'Assentos reservados', required: false })
    @Expose()
    reservedSeats?: number;

    @ApiProperty({ description: 'Assentos vendidos', required: false })
    @Expose()
    soldSeats?: number;

    @ApiProperty({ description: 'Sessão ativa' })
    @Expose()
    isActive: boolean;

    @ApiProperty({ description: 'Data de criação' })
    @Expose()
    createdAt: Date;
}