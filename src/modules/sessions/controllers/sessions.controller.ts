import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SessionsService } from '../services/sessions.service';
import { CreateSessionDto } from '../dtos/create-session.dto';
import { UpdateSessionDto } from '../dtos/update-session.dto';


@ApiTags('sessions')
@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Post()
    @ApiOperation({ summary: 'Criar nova sessão de cinema' })
    @ApiResponse({ status: 201, description: 'Sessão criada com sucesso' })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    create(@Body() createSessionDto: CreateSessionDto) {
        return this.sessionsService.create(createSessionDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as sessões ativas' })
    @ApiResponse({ status: 200, description: 'Lista de sessões' })
    findAll() {
        return this.sessionsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar sessão por ID' })
    @ApiResponse({ status: 200, description: 'Sessão encontrada' })
    @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
    findOne(@Param('id') id: string) {
        return this.sessionsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar sessão' })
    @ApiResponse({ status: 200, description: 'Sessão atualizada' })
    @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
    update(@Param('id') id: string, @Body() updateSessionDto: UpdateSessionDto) {
        return this.sessionsService.update(id, updateSessionDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Desativar sessão' })
    @ApiResponse({ status: 204, description: 'Sessão desativada' })
    @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
    remove(@Param('id') id: string) {
        return this.sessionsService.remove(id);
    }
}