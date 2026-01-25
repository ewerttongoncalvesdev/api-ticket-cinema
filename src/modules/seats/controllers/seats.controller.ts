import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SeatsService } from '../services/seats.service';


@ApiTags('seats')
@Controller('seats')
export class SeatsController {
    constructor(private readonly seatsService: SeatsService) { }

    @Get('session/:sessionId/availability')
    @ApiOperation({ summary: 'Buscar disponibilidade de assentos por sessão' })
    @ApiParam({ name: 'sessionId', description: 'ID da sessão' })
    @ApiResponse({ status: 200, description: 'Disponibilidade dos assentos' })
    @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
    getAvailability(@Param('sessionId') sessionId: string) {
        return this.seatsService.getAvailability(sessionId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar assento por ID' })
    @ApiResponse({ status: 200, description: 'Assento encontrado' })
    @ApiResponse({ status: 404, description: 'Assento não encontrado' })
    findOne(@Param('id') id: string) {
        return this.seatsService.findOne(id);
    }
}