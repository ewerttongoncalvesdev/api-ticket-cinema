import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsNotEmpty, IsUUID } from "class-validator";

export class CreateReservationDto {
    @ApiProperty({
        description: 'ID do usuário',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID('4', { message: 'ID do usuário inválido' })
    @IsNotEmpty({ message: 'ID do usuário é obrigatório' })
    userId: string;

    @ApiProperty({
        description: 'ID da sessão',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    @IsUUID('4', { message: 'ID da sessão inválido' })
    @IsNotEmpty({ message: 'ID da sessão é obrigatório' })
    sessionId: string;

    @ApiProperty({
        description: 'IDs dos assentos a serem reservados',
        example: ['123e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174003'],
        type: [String],
    })
    @IsArray({ message: 'IDs dos assentos devem ser um array' })
    @ArrayMinSize(1, { message: 'Selecione pelo menos um assento' })
    @IsUUID('4', { each: true, message: 'ID do assento inválido' })
    seatIds: string[];
}