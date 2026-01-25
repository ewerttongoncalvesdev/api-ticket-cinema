import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        // Verificar se email já existe
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email já cadastrado');
        }

        const user = this.userRepository.create(createUserDto);
        const savedUser = await this.userRepository.save(user);

        this.logger.log(`Usuário criado: ${savedUser.id}`);
        return savedUser;
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find({
            where: { isActive: true },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id, isActive: true },
        });

        if (!user) {
            throw new NotFoundException(`Usuário ${id} não encontrado`);
        }

        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { email, isActive: true },
        });

        if (!user) {
            throw new NotFoundException(`Usuário com email ${email} não encontrado`);
        }

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        // Se está mudando o email, verificar se já existe
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });

            if (existingUser) {
                throw new ConflictException('Email já cadastrado');
            }
        }

        Object.assign(user, updateUserDto);
        const updatedUser = await this.userRepository.save(user);

        this.logger.log(`Usuário atualizado: ${id}`);
        return updatedUser;
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        user.isActive = false;
        await this.userRepository.save(user);

        this.logger.log(`Usuário desativado: ${id}`);
    }
}