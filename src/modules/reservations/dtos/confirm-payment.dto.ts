import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
// Você traz o Enum original para cá:
import { PaymentMethod } from "../../sales/entities/sale.entity";

export class ConfirmPaymentDto {
    @ApiProperty({
        description: 'ID da reserva',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID('4', { message: 'ID da reserva inválido' })
    @IsNotEmpty({ message: 'ID da reserva é obrigatório' })
    reservationId: string;

    @ApiProperty({
        description: 'Método de pagamento',
        enum: PaymentMethod, // Usa o Enum da Entidade aqui no Swagger
        example: PaymentMethod.CREDIT_CARD,
    })
    @IsEnum(PaymentMethod, { message: 'Método de pagamento inválido' })
    @IsNotEmpty({ message: 'Método de pagamento é obrigatório' })
    // E usa ele aqui na tipagem:
    paymentMethod: PaymentMethod;

    @ApiPropertyOptional({
        description: 'ID do pagamento externo (se aplicável)',
        example: 'pay_1234567890',
    })
    @IsString({ message: 'ID do pagamento externo deve ser uma string' })
    @IsOptional()
    paymentId?: string;
}