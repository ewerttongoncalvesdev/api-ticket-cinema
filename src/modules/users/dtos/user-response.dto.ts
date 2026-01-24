import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UserResponseDto {
    @ApiProperty({description: 'ID do usuário'})
    @Expose()
    id: string;

    @ApiProperty({description: 'Email do usuário'})
    @Expose()
    email: string;

    @ApiProperty({description: 'Nome completo do usuário'})
    @Expose()
    name: string;

    @ApiProperty({description: 'Telefone do usuário', required: false})
    @Expose()
    phone?: string;

    @ApiProperty({description: 'Data de criação do usuário'})
    @Expose()
    createdAt: Date;
}