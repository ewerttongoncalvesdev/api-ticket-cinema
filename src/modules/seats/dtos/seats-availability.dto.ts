import { ApiProperty } from "@nestjs/swagger";
import { SeatResponseDto } from "./seat-response.dto";

export class SeatsAvailabilityDto {
    @ApiProperty({ description: 'ID da sessão' })
    sessionId: string;

    @ApiProperty({ description: 'Total de assentos' })
    totalSeats: number;

    @ApiProperty({ description: 'Assentos disponíveis' })
    availableSeats: number;

    @ApiProperty({ description: 'Assentos reservados' })
    reservedSeats: number;

    @ApiProperty({ description: 'Assentos vendidos' })
    soldSeats: number;

    @ApiProperty({ description: 'Lista de assentos', type: [SeatResponseDto] })
    seats: SeatResponseDto[];
}