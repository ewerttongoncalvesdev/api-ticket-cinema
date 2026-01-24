import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsNumber, IsPositive, IsString, Max, Min } from "class-validator";

export class CreateSessionDto {
    @ApiProperty({
        description: 'Titulo do filme',
        example: 'Homem de ferro',
    })

    @IsString({ message: 'O título do filme deve ser uma string' })
    @IsNotEmpty({ message: 'O título do filme é obrigatório' })
    movieTitle: string;

    @ApiProperty({
        description: 'Descrição do filme',
        example: 'Um bilionário que se torna um super-herói usando uma armadura tecnológica.',
        required: false,
    })
    @IsString({ message: 'A descrição do filme deve ser uma string' })
    description?: string;

    @ApiProperty({
        description: 'Sala do cinema',
        example: 'Sala 1',
    })
    @IsString({ message: 'A sala do cinema deve ser uma string' })
    @IsNotEmpty({ message: 'A sala do cinema é obrigatória' })
    room: string;

    @ApiProperty({
        description: 'Data e hora de início da sessão',
        example: '2026-01-25T19:30:00Z',
    })
    @IsDateString({}, { message: 'Data e hora de início da sessão inválida' })
    @IsNotEmpty({ message: 'A data e hora de início da sessão é obrigatória' })
    startTime: string;

    @ApiProperty({
        description: 'Data e hora de término da sessão',
        example: '2026-01-25T21:30:00Z',
    })
    @IsDateString({}, { message: 'Data de término inválida' })
    @IsNotEmpty({ message: 'Data de término é obrigatória' })
    endTime: string;

    @ApiProperty({
        description: 'Preço do ingresso em reais',
        example: 35.00,
        minimum: 0.01,
    })
    @IsNumber({}, { message: 'Preço deve ser um número' })
    @IsPositive({ message: 'Preço deve ser positivo' })
    @IsNotEmpty({ message: 'Preço é obrigatório' })
    ticketPrice: number;

    @ApiProperty({
        description: 'Total de assentos (mínimo 16)',
        example: 50,
        minimum: 16,
        maximum: 500,
    })
    @IsNumber({}, { message: 'Total de assentos deve ser um número' })
    @Min(16, { message: 'Deve ter no mínimo 16 assentos' })
    @Max(500, { message: 'Deve ter no máximo 500 assentos' })
    @IsNotEmpty({ message: 'Total de assentos é obrigatório' })
    totalSeats: number;
}
