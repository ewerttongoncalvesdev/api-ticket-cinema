import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReservationsService } from '../services/reservations.service';
import { CreateReservationDto } from '../dtos/create-reservation.dto';
import { ConfirmPaymentDto } from '../dtos/confirm-payment.dto';

@ApiTags('reservations')
@Controller('reservations')
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) { }

    @Post()
    @ApiOperation({ summary: 'Criar reserva de assento(s)' })
    @ApiResponse({ status: 201, description: 'Reserva criada (válida por 30s)' })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 404, description: 'Sessão ou assento não encontrado' })
    @ApiResponse({ status: 409, description: 'Assento não disponível' })
    create(@Body() createReservationDto: CreateReservationDto) {
        return this.reservationsService.create(createReservationDto);
    }

    @Post('confirm-payment')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Confirmar pagamento e converter reserva em venda' })
    @ApiResponse({ status: 200, description: 'Pagamento confirmado' })
    @ApiResponse({ status: 400, description: 'Reserva expirada ou inválida' })
    @ApiResponse({ status: 404, description: 'Reserva não encontrada' })
    confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
        return this.reservationsService.confirmPayment(confirmPaymentDto);
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Buscar reservas por usuário' })
    @ApiParam({ name: 'userId', description: 'ID do usuário' })
    @ApiResponse({ status: 200, description: 'Lista de reservas' })
    findByUser(@Param('userId') userId: string) {
        return this.reservationsService.findByUser(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar reserva por ID' })
    @ApiResponse({ status: 200, description: 'Reserva encontrada' })
    @ApiResponse({ status: 404, description: 'Reserva não encontrada' })
    findOne(@Param('id') id: string) {
        return this.reservationsService.findOne(id);
    }
}