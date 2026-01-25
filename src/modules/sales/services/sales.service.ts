import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { UserSalesHistoryDto } from '../dtos/user-sales-history.dto';
import { SaleResponseDto } from '../dtos/sale-response.dto';


@Injectable()
export class SalesService {
    private readonly logger = new Logger(SalesService.name);

    constructor(
        @InjectRepository(Sale)
        private saleRepository: Repository<Sale>,
    ) { }

    async findAll(): Promise<Sale[]> {
        return this.saleRepository.find({
            relations: ['user', 'session'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Sale> {
        const sale = await this.saleRepository.findOne({
            where: { id },
            relations: ['user', 'session'],
        });

        if (!sale) {
            throw new NotFoundException(`Venda ${id} não encontrada`);
        }

        return sale;
    }

    async findByUser(userId: string): Promise<UserSalesHistoryDto> {
        const sales = await this.saleRepository.find({
            where: { userId },
            relations: ['session'],
            order: { createdAt: 'DESC' },
        });

        const totalPurchases = sales.length;
        const totalSpent = sales.reduce((sum, sale) => sum + Number(sale.price), 0);

        const salesResponse: SaleResponseDto[] = sales.map((sale) => ({
            id: sale.id,
            userId: sale.userId,
            sessionId: sale.sessionId,
            reservationId: sale.reservationId,
            seatIdentifier: sale.seatIdentifier,
            price: Number(sale.price),
            paymentMethod: sale.paymentMethod,
            paymentStatus: sale.paymentStatus,
            createdAt: sale.createdAt,
        }));

        return {
            userId,
            totalPurchases,
            totalSpent,
            sales: salesResponse,
        };
    }

    async findBySession(sessionId: string): Promise<Sale[]> {
        return this.saleRepository.find({
            where: { sessionId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async getStatistics(): Promise<any> {
        const totalSales = await this.saleRepository.count();

        const result = await this.saleRepository
            .createQueryBuilder('sale')
            .select('SUM(sale.price)', 'totalRevenue')
            .getRawOne();

        const totalRevenue = Number(result.totalRevenue) || 0;

        const salesByPaymentMethod = await this.saleRepository
            .createQueryBuilder('sale')
            .select('sale.paymentMethod', 'method')
            .addSelect('COUNT(*)', 'count')
            .groupBy('sale.paymentMethod')
            .getRawMany();

        return {
            totalSales,
            totalRevenue,
            salesByPaymentMethod,
        };
    }
}