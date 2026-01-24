import { ApiProperty } from "@nestjs/swagger";
import { SaleResponseDto } from "./sale-response.dto";

export class UserSalesHistoryDto {
    @ApiProperty({ description: 'ID do usuário' })
    userId: string;

    @ApiProperty({ description: 'Total de compras' })
    totalPurchases: number;

    @ApiProperty({ description: 'Valor total gasto' })
    totalSpent: number;

    @ApiProperty({ description: 'Lista de compras', type: [SaleResponseDto] })
    sales: SaleResponseDto[];
}