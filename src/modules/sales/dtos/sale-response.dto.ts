import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class SaleResponseDto {
    @ApiProperty({ description: 'ID da venda' })
    @Expose()
    id: string;

    @ApiProperty({ description: 'IS do usuário' })
    @Expose()
    userId: string;

    @ApiProperty({ description: 'ID da sessão' })
    @Expose()
    sessionId: string;

    @ApiProperty({ description: 'ID da reserva' })
    @Expose()
    reservationId: string;

    @ApiProperty({ description: 'Identificador do assento' })
    @Expose()
    seatIdentifier: string;

    @ApiProperty({ description: 'Preço' })
    @Expose()
    price: number;

    @ApiProperty({ description: 'Método de pagamento' })
    @Expose()
    paymentMethod: string;

    @ApiProperty({ description: 'Status do pagamento' })
    @Expose()
    paymentStatus: string;

    @ApiProperty({ description: 'Data de criação' })
    @Expose()
    createdAt: Date;
}