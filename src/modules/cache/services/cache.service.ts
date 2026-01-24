import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(CacheService.name);
    private redisClient: Redis;

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        const redisConfig = {
            host: this.configService.get<string>('redis.host'),
            port: this.configService.get<number>('redis.port'),
            password: this.configService.get<string>('redis.password'),
            maxRetriesPerRequest: this.configService.get<number>('redis.maxRetriesPerRequest'),
            retryStrategy: this.configService.get('redis.retryStrategy'),
        };

        this.redisClient = new Redis(redisConfig);

        this.redisClient.on('connect', () => {
            this.logger.log('✅ Redis conectado com sucesso');
        });

        this.redisClient.on('error', (error) => {
            this.logger.error('❌ Erro na conexão com Redis:', error);
        });

        this.redisClient.on('ready', () => {
            this.logger.log('✅ Redis pronto para aceitar comandos');
        });
    }

    async onModuleDestroy() {
        await this.redisClient.quit();
        this.logger.log('Conexão com Redis encerrada');
    }

    async set(key: string, value: string | number | object, ttlSeconds?: number): Promise<void> {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        if (ttlSeconds) {
            await this.redisClient.setex(key, ttlSeconds, stringValue);
        } else {
            await this.redisClient.set(key, stringValue);
        }
    }

    async get<T = string>(key: string): Promise<T | null> {
        const value = await this.redisClient.get(key);
        if (!value) return null;
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as T;
        }
    }

    async del(key: string): Promise<void> {
        await this.redisClient.del(key);
    }

    async exists(key: string): Promise<boolean> {
        return (await this.redisClient.exists(key)) === 1;
    }

    async acquireLock(lockKey: string, ttlSeconds: number = 10): Promise<boolean> {
        const result = await this.redisClient.set(lockKey, '1', 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }

    async releaseLock(lockKey: string): Promise<void> {
        await this.redisClient.del(lockKey);
    }

    getClient(): Redis {
        return this.redisClient;
    }
}