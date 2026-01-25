import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SalesService } from '../services/sales.service';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Get()
    @ApiOperation({ summary: 'Listar todas as vendas' })
    @ApiResponse({ status: 200, description: 'Lista de vendas' })
    findAll() {
        return this.salesService.findAll();
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Estatísticas de vendas' })
    @ApiResponse({ status: 200, description: 'Estatísticas gerais' })
    getStatistics() {
        return this.salesService.getStatistics();
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Histórico de compras por usuário' })
    @ApiParam({ name: 'userId', description: 'ID do usuário' })
    @ApiResponse({ status: 200, description: 'Histórico de compras' })
    findByUser(@Param('userId') userId: string) {
        return this.salesService.findByUser(userId);
    }

    @Get('session/:sessionId')
    @ApiOperation({ summary: 'Vendas por sessão' })
    @ApiParam({ name: 'sessionId', description: 'ID da sessão' })
    @ApiResponse({ status: 200, description: 'Vendas da sessão' })
    findBySession(@Param('sessionId') sessionId: string) {
        return this.salesService.findBySession(sessionId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar venda por ID' })
    @ApiResponse({ status: 200, description: 'Venda encontrada' })
    @ApiResponse({ status: 404, description: 'Venda não encontrada' })
    findOne(@Param('id') id: string) {
        return this.salesService.findOne(id);
    }
}