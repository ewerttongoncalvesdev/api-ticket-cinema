import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export enum PaymentMethodDto {
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    PIX = 'pix',
    CASH = 'cash',
}

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
        enum: PaymentMethodDto,
        example: PaymentMethodDto.CREDIT_CARD,
    })
    @IsEnum(PaymentMethodDto, { message: 'Método de pagamento inválido' })
    @IsNotEmpty({ message: 'Método de pagamento é obrigatório' })
    paymentMethod: PaymentMethodDto;

    @ApiPropertyOptional({
        description: 'ID do pagamento externo (se aplicável)',
        example: 'pay_1234567890',
    })
    @IsString({ message: 'ID do pagamento externo deve ser uma string' })
    @IsOptional()
    paymentId?: string;
}