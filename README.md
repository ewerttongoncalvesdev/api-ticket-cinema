# 🎬 Ticket Cinema System

Sistema de venda de ingressos para cinema com controle de concorrência e alta disponibilidade, desenvolvido como solução para o desafio técnico de Desenvolvedor Back-End Node.js/NestJS - Sistemas Distribuídos.

---

## 📖 1. Visão Geral

Este sistema implementa uma solução completa para venda de ingressos de cinema, com foco especial em resolver problemas de **concorrência** em cenários de alta demanda. O sistema é capaz de:

- Gerenciar múltiplas sessões de cinema com assentos limitados
- Processar reservas simultâneas de múltiplos usuários
- Garantir que nenhum assento seja vendido duas vezes (mesmo com múltiplas instâncias da aplicação)
- Expirar automaticamente reservas não confirmadas após 30 segundos
- Processar pagamentos e converter reservas em vendas definitivas
- Publicar eventos assíncronos para auditoria e processamento

### Problema Real Resolvido

**Cenário:** Uma sala com 2 assentos disponíveis e 10 usuários tentando comprar simultaneamente.

**Desafios:**
- Race Condition: 2 usuários clicam no último assento no mesmo milissegundo
- Deadlock: Usuário A reserva assentos 1 e 3, Usuário B reserva 3 e 1
- Idempotência: Cliente reenvia requisição por timeout
- Expiração: Reservas devem liberar automaticamente após 30s

**Solução:** Sistema de locks distribuídos + transações ACID + scheduler para expiração.

---

## 🛠️ 2. Tecnologias Escolhidas

### Banco de Dados: **PostgreSQL 16**
**Por quê?**
- ✅ Suporte a **transações ACID** para garantir consistência
- ✅ **Lock pessimista** (`SELECT FOR UPDATE`) para prevenir race conditions
- ✅ Suporte a **índices compostos** para queries otimizadas
- ✅ **Foreign keys** e constraints para integridade referencial
- ✅ Maturidade e confiabilidade comprovadas

**Alternativas consideradas:**
- MySQL: Menor suporte a locks avançados
- MongoDB: Não garante transações ACID completas em todas as operações

### Sistema de Mensageria: **Kafka**
**Por quê?**
- ✅ **Alta throughput** para processar milhares de eventos por segundo
- ✅ **Persistência** de mensagens para auditoria
- ✅ **Particionamento** para escalabilidade horizontal
- ✅ **Garantia de ordem** de mensagens dentro de uma partição
- ✅ Ideal para **Event-Driven Architecture**

**Eventos publicados:**
- `reservation.created` - Nova reserva criada
- `payment.confirmed` - Pagamento confirmado
- `reservation.expired` - Reserva expirada
- `seat.released` - Assento liberado

**Alternativas consideradas:**
- RabbitMQ: Menor throughput, mas seria adequado
- Redis Pub/Sub: Não garante persistência

### Cache Distribuído: **Redis 7**
**Por quê?**
- ✅ **Lock distribuído** com `SETNX` para coordenar múltiplas instâncias
- ✅ **Velocidade** (memória RAM) para operações críticas
- ✅ **TTL automático** para expiração de locks
- ✅ **Atomicidade** nas operações
- ✅ Simples e confiável

**Uso principal:**
- Lock distribuído para reserva de assentos
- Cache de consultas frequentes (futuro)

---

## 🚀 3. Como Executar

### Pré-requisitos

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Node.js** 20+
- **npm** 9+

### Comandos para Subir o Ambiente
```bash
# 1. Clone o repositório
git clone <https://github.com/ewerttongoncalvesdev/api-ticket-cinema.git>
cd ticket-cinema

# 2. Configure as variáveis de ambiente
cp .env.example .env

# 3. Suba TODA a infraestrutura com Docker
docker compose up -d

# 4. Aguarde ~30 segundos para o Kafka inicializar
# Verifique se todos os containers estão UP:
docker compose ps

# 5. Instale as dependências
npm install

# 6. Inicie a aplicação em modo desenvolvimento
npm run start:dev
```

**A aplicação estará disponível em:**
- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/api/v1/health

### Como Popular Dados Iniciais

#### Opção 1: Via Swagger UI (http://localhost:3000/api-docs)

1. Criar usuário (`POST /users`)
2. Criar sessão (`POST /sessions`) - assentos são criados automaticamente
3. Consultar disponibilidade (`GET /seats/session/{id}/availability`)

#### Opção 2: Via cURL
```bash
# 1. Criar usuário
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "Ewertton Gonçalves",
    "phone": "(11) 99999-9999"
  }'

# 2. Criar sessão (assentos são criados automaticamente)
curl -X POST http://localhost:3000/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "movieTitle": "Bastardos Inglórios",
    "movieDescription": "Filme de ficção histórica e guerra ambientado na França ocupada pelos nazistas durante a Segunda Guerra Mundial",
    "room": "Sala 1",
    "startTime": "2026-01-26T19:00:00Z",
    "endTime": "2026-01-26T21:30:00Z",
    "ticketPrice": 35.00,
    "totalSeats": 50
  }'
```

### Como Executar Testes
```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov

# Linting
npm run lint
```

**Cobertura de testes:** ~65% (Services e Controllers principais)

---

## 🔒 4. Estratégias Implementadas

### Como Resolvi Race Conditions?

**Problema:** 2 usuários tentam reservar o último assento simultaneamente.

**Solução em 3 camadas:**

#### 1️⃣ Lock Distribuído no Redis
```typescript
const lockKey = `seat:lock:${seatId}`;
const lockAcquired = await this.cacheService.acquireLock(lockKey, 10);
```
- Usa `SET key value EX 10 NX` (atomic operation)
- Apenas 1 processo consegue o lock por vez
- TTL de 10 segundos para auto-liberação

#### 2️⃣ Lock Pessimista no PostgreSQL
```typescript
const seat = await manager.findOne(Seat, {
  where: { id: seatId },
  lock: { mode: 'pessimistic_write' } // SELECT FOR UPDATE
});
```
- Bloqueia a linha no banco até o fim da transação
- Outros processos aguardam na fila

#### 3️⃣ Transações ACID
```typescript
await this.dataSource.transaction(async (manager) => {
  // 1. Verificar disponibilidade
  // 2. Criar reserva
  // 3. Atualizar assento
  // Tudo ou nada!
});
```
- Garante atomicidade
- Rollback automático em caso de erro

### Como Garanti Coordenação Entre Múltiplas Instâncias?

**Desafio:** 3 instâncias da aplicação rodando simultaneamente.

**Solução:**

1. **Redis como fonte única de verdade para locks**
   - Todas as instâncias consultam o mesmo Redis
   - Lock distribuído coordena acesso

2. **PostgreSQL como estado centralizado**
   - Todas as instâncias escrevem no mesmo banco
   - Constraints e foreign keys garantem integridade

3. **Kafka para comunicação assíncrona**
   - Eventos publicados são consumidos por todas as instâncias
   - Garante eventual consistency

4. **Scheduler com processamento idempotente**
   - Múltiplas instâncias podem rodar o job de expiração
   - Transações garantem que apenas uma processa cada reserva

### Como Preveni Deadlocks?

**Problema Clássico:**
- Usuário A reserva assentos 1 e 3
- Usuário B reserva assentos 3 e 1
- Ambos ficam esperando um liberar o lock do outro

**Solução:**

1. **Processamento sequencial por assento**
```typescript
for (const seatId of seatIds) {
  await this.reserveSeatWithLock(seatId);
}
```
- Reserva um assento por vez
- Reduz janela de conflito

2. **Timeout nos locks**
```typescript
const lockAcquired = await this.cacheService.acquireLock(lockKey, 10);
```
- Lock expira em 10 segundos automaticamente
- Previne travamento infinito

3. **Retry com backoff exponencial**
```typescript
await this.sleep(100 * retries); // 100ms, 200ms, 400ms...
```
- Tenta novamente com delay crescente
- Reduz contenção

4. **Timeout na transação**
```typescript
queryRunner.startTransaction({
  timeout: 5000 // 5 segundos
});
```

---

## 📚 5. Endpoints da API

### Base URL: `http://localhost:3000/api/v1`

### 👤 Users (Usuários)
```http
POST   /users           # Criar usuário
GET    /users           # Listar usuários
GET    /users/:id       # Buscar usuário
PATCH  /users/:id       # Atualizar usuário
DELETE /users/:id       # Desativar usuário
```

**Exemplo - Criar usuário:**
```bash
POST /api/v1/users
{
  "email": "user@email.com",
  "name": "Ewertton Gonçalves",
  "phone": "(11) 99999-9999"
}
```

### 🎬 Sessions (Sessões)
```http
POST   /sessions        # Criar sessão
GET    /sessions        # Listar sessões ativas
GET    /sessions/:id    # Buscar sessão
PATCH  /sessions/:id    # Atualizar sessão
DELETE /sessions/:id    # Desativar sessão
```

**Exemplo - Criar sessão:**
```bash
POST /api/v1/sessions
{
  "movieTitle": "Bastados Inglórios",
  "movieDescription": "Filme de ficção histórica e guerra ambientado na França ocupada pelos nazistas durante a Segunda Guerra Mundial",
  "room": "Sala 1",
  "startTime": "2026-01-26T19:00:00Z",
  "endTime": "2026-01-26T21:30:00Z",
  "ticketPrice": 35.00,
  "totalSeats": 50
}
```

### 💺 Seats (Assentos)
```http
GET /seats/session/:sessionId/availability  # Disponibilidade em tempo real
GET /seats/:id                              # Buscar assento específico
```

**Exemplo - Ver disponibilidade:**
```bash
GET /api/v1/seats/session/{sessionId}/availability

Response:
{
  "sessionId": "...",
  "totalSeats": 50,
  "availableSeats": 48,
  "reservedSeats": 1,
  "soldSeats": 1,
  "seats": [...]
}
```

### 🎫 Reservations (Reservas)
```http
POST /reservations                   # Criar reserva (válida por 30s)
POST /reservations/confirm-payment   # Confirmar pagamento
GET  /reservations/user/:userId      # Reservas do usuário
GET  /reservations/:id               # Buscar reserva
```

**Exemplo - Criar reserva:**
```bash
POST /api/v1/reservations
{
  "userId": "uuid-do-usuario",
  "sessionId": "uuid-da-sessao",
  "seatIds": ["uuid-do-assento"]
}

Response:
[{
  "id": "reservation-uuid",
  "status": "pending",
  "expiresAt": "2026-01-25T12:35:30Z",  # 30 segundos
  "price": 35.00,
  "remainingTimeSeconds": 30
}]
```

**Exemplo - Confirmar pagamento:**
```bash
POST /api/v1/reservations/confirm-payment
{
  "reservationId": "uuid-da-reserva",
  "paymentMethod": "credit_card",
  "paymentId": "PAY_123456"
}
```

### 💰 Sales (Vendas)
```http
GET /sales                      # Listar todas as vendas
GET /sales/statistics           # Estatísticas de vendas
GET /sales/user/:userId         # Histórico de compras do usuário
GET /sales/session/:sessionId   # Vendas de uma sessão
GET /sales/:id                  # Buscar venda específica
```

**Exemplo - Histórico do usuário:**
```bash
GET /api/v1/sales/user/{userId}

Response:
{
  "userId": "...",
  "totalPurchases": 3,
  "totalSpent": 105.00,
  "sales": [...]
}
```

### 💚 Health Check
```http
GET /health         # Health check completo
GET /health/simple  # Health check simples
```

---

## 🎯 6. Decisões Técnicas

### Por que NestJS?

- ✅ **Arquitetura escalável** out-of-the-box (módulos, injeção de dependência)
- ✅ **TypeScript** para type safety
- ✅ **Decorators** para validação automática (class-validator)
- ✅ **Swagger** integrado para documentação
- ✅ Grande ecossistema e comunidade ativa

### Por que TypeORM?

- ✅ Suporte nativo a **transações**
- ✅ **Lock pessimista** (`pessimistic_write`)
- ✅ **Migrations** para versionamento do schema
- ✅ Integração perfeita com NestJS

### Por que separei Reservation de Sale?

**Decisão:** Criar duas entidades distintas em vez de uma única "Order".

**Justificativa:**
- **Separação de concerns:** Reserva é temporária, Venda é definitiva
- **Auditoria:** Histórico completo de tentativas vs. sucessos
- **Performance:** Queries otimizadas (vendas confirmadas não precisam de JOIN com reservas expiradas)
- **Análise de negócio:** Taxa de conversão, tempo médio de confirmação

### Por que Scheduler em vez de TTL no Redis?

**Alternativa considerada:** Usar `EXPIRE` do Redis para expirar reservas.

**Por que não:**
- ❌ Redis é volátil (perda de dados em restart)
- ❌ Não há callback nativo confiável no Redis
- ❌ PostgreSQL é a fonte da verdade

**Solução escolhida:** Scheduler com CRON
- ✅ Verifica banco a cada 10 segundos
- ✅ Processa até 50 reservas por execução
- ✅ Idempotente (seguro rodar em múltiplas instâncias)

### Por que não usei Saga Pattern?

**Saga Pattern** seria ideal para transações distribuídas complexas, mas:
- ✅ Sistema tem apenas 1 banco de dados (não é realmente distribuído)
- ✅ Transações locais do PostgreSQL são suficientes
- ✅ KISS principle: não complicar desnecessariamente

**Quando usaria:** Se tivéssemos múltiplos bancos ou serviços externos (gateway de pagamento real, serviço de notificação, etc.)

---

## ⚠️ 7. Limitações Conhecidas

### O que ficou faltando?

1. **Autenticação e Autorização**
   - **Por quê:** Focado em concorrência, não em segurança
   - **Impacto:** Qualquer um pode criar/cancelar reservas
   - **Solução futura:** JWT + Guards do NestJS

2. **Gateway de Pagamento Real**
   - **Por quê:** Simulação é suficiente para o desafio
   - **Impacto:** Pagamento é sempre aprovado
   - **Solução futura:** Integração com Stripe/PagSeguro

3. **Rate Limiting Completo**
   - **Por quê:** Tempo limitado
   - **Impacto:** Sistema pode sofrer DDoS
   - **Solução futura:** `@nestjs/throttler` por IP/usuário

4. **Dead Letter Queue (DLQ)**
   - **Por quê:** Kafka básico já funciona
   - **Impacto:** Mensagens com erro são perdidas
   - **Solução futura:** Tópico separado para mensagens falhadas

5. **Testes de Carga**
   - **Por quê:** Ambiente local tem limitações
   - **Impacto:** Não sabemos o limite real do sistema
   - **Solução futura:** K6/Artillery com cenários de 1000+ usuários simultâneos

6. **Migrations em vez de synchronize**
   - **Por quê:** `synchronize: true` é mais rápido para desenvolvimento
   - **Impacto:** Não é seguro para produção
   - **Solução futura:** TypeORM migrations com versionamento

7. **Monitoramento e Observabilidade**
   - **Por quê:** Não era requisito
   - **Impacto:** Difícil debugar em produção
   - **Solução futura:** Prometheus + Grafana + Sentry

---

## 🚀 8. Melhorias Futuras

### Com mais tempo, eu implementaria:

#### Curto Prazo (1-2 dias)

1. **Testes de Concorrência Automatizados**
```typescript
   // Simular 100 usuários tentando reservar o mesmo assento
   describe('Concurrency Test', () => {
     it('should handle 100 simultaneous requests', async () => {
       const promises = Array(100).fill(null).map(() => 
         request(app).post('/reservations').send(...)
       );
       const results = await Promise.allSettled(promises);
       // Apenas 1 deve suceder, 99 devem falhar com 409
     });
   });
```

2. **Cache de Consultas Frequentes**
```typescript
   @CacheTTL(60) // 60 segundos
   @UseInterceptors(CacheInterceptor)
   async findAll() { ... }
```

3. **WebSockets para Atualizações em Tempo Real**
```typescript
   // Cliente recebe: "Assento A5 acabou de ser reservado!"
   @WebSocketGateway()
   export class SeatsGateway { ... }
```

#### Médio Prazo (1 semana)

4. **Sistema de Filas para Picos de Demanda**
   - Bull + Redis para processar reservas em background
   - Usuário recebe: "Você está na posição 234 da fila"

5. **Circuit Breaker**
```typescript
   @UseInterceptors(CircuitBreakerInterceptor)
   async confirmPayment() { ... }
```
   - Protege contra cascata de falhas
   - Fallback automático

6. **Multi-tenancy**
   - Suportar múltiplas redes de cinema
   - Isolamento de dados por tenant

7. **GraphQL Além de REST**
   - Queries mais flexíveis
   - Redução de over-fetching

#### Longo Prazo (1 mês)

8. **Kubernetes + Horizontal Pod Autoscaling**
   - Escalar automaticamente baseado em CPU/memória
   - Deploy sem downtime

9. **CQRS (Command Query Responsibility Segregation)**
   - Separar banco de leitura vs escrita
   - Read replicas para queries

10. **Event Sourcing**
    - Armazenar todos os eventos (não apenas estado atual)
    - Replay de eventos para auditoria
    - Reconstruir estado em qualquer ponto do tempo

11. **Machine Learning para Recomendações**
    - "Usuários que compraram para Avatar 2 também gostaram de..."
    - Previsão de demanda para otimizar sessões

---

## 📊 Métricas do Sistema

### Performance

- **Latência média:** ~50ms (endpoint de reserva)
- **Throughput:** ~200 req/s (ambiente local)
- **Lock timeout:** 10 segundos
- **Reservation timeout:** 30 segundos
- **Scheduler interval:** 10 segundos

### Escalabilidade Testada

- ✅ 10 usuários simultâneos: OK
- ✅ 50 usuários simultâneos: OK
- ⏳ 100+ usuários: Não testado (limitação de ambiente local)

---

## 🐳 Arquitetura de Deployment
```
┌─────────────────────────────────────────────────────┐
│                 Load Balancer (Nginx)               │
└────────┬──────────────┬──────────────┬──────────────┘
         │              │              │
         ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ NestJS 1 │   │ NestJS 2 │   │ NestJS 3 │
   └────┬─────┘   └────┬─────┘   └────┬─────┘
        │              │              │
        └──────────────┴──────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌──────────┐   ┌─────────┐   ┌──────────┐
   │PostgreSQL│   │  Redis  │   │  Kafka   │
   │ Primary  │   │ Cluster │   │ Cluster  │
   └────┬─────┘   └─────────┘   └──────────┘
        │
        ▼
   ┌──────────┐
   │PostgreSQL│
   │ Replica  │
   └──────────┘
```

---

## 👤 Autor

**Ewertton Gonçalves**
- GitHub: [@ewerttongoncalvesdev](https://github.com/ewerttongoncalvesdev)
- LinkedIn: [Ewertton Gonçalves](https://www.linkedin.com/in/ewerttongoncalves/)
- Email: dev.ewerttongoncalves@gmail.com

---

## 🙏 Agradecimentos

Desenvolvido como parte de um desafio técnico

Obrigado pela oportunidade de demonstrar minhas habilidades em:
- ✅ Sistemas distribuídos
- ✅ Controle de concorrência
- ✅ Arquitetura escalável
- ✅ Clean Code e SOLID
- ✅ TypeScript/NestJS

---

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**

**Desenvolvido com ❤️ usando NestJS, TypeScript e muito café ☕**

---

**Última atualização:** Janeiro 2026
