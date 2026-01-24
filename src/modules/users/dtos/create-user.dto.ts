import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        description: 'Email do usuário',
        example: 'usuario@example.com',
    })

    @IsEmail({}, { message: 'O email informado não é válido.' })
    @IsNotEmpty({ message: 'O email é obrigatório.' })
    email: string;

    @ApiProperty({
        description: 'Nome completo do usuário',
        example: 'Ewertton Gonçalves',
        minLength: 3,
        maxLength: 100,
    })

    @IsString({ message: 'O nome deve ser uma string.' })
    @IsNotEmpty({ message: 'O nome é obrigatório.' })
    @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres.' })
    name: string;

    @ApiPropertyOptional({
        description: 'Telefone do usuário',
        example: '+55 11 99999-9999',
    })

    @IsString({ message: 'O telefone deve ser uma string.' })
    @IsOptional()
    phone?: string;
}