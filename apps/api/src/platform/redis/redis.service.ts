import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

interface MemoryItem {
  value: any;
  expiresAt: number | null; // epoch ms
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  // In-memory fallback map for dev environment when Redis is not running
  private memoryStore: Map<string, MemoryItem> = new Map();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', '127.0.0.1');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));
    const password = this.configService.get<string>('REDIS_PASSWORD') || undefined;

    try {
      this.client = new Redis({
        host,
        port,
        password,
        maxRetriesPerRequest: null, // Required by BullMQ
        enableReadyCheck: false,
        lazyConnect: true,
        retryStrategy: (times) => {
          // Retry every 5 seconds, max 10 times then slow down
          if (times > 10) {
            return 15000;
          }
          return Math.min(times * 1000, 5000);
        },
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log(`Connected to Redis at ${host}:${port}`);
      });

      this.client.on('ready', () => {
        this.isConnected = true;
      });

      this.client.on('error', (err: any) => {
        this.isConnected = false;
        // Suppress noisy ECONNREFUSED logs in local dev
        if (err.code === 'ECONNREFUSED') {
          this.logger.warn(`Redis is not reachable at ${host}:${port}. Using in-memory fallback store.`);
        } else {
          this.logger.error(`Redis Error: ${err.message}`);
        }
      });

      this.client.on('close', () => {
        this.isConnected = false;
      });

      // Attempt to connect non-blocking
      await this.client.connect().catch((err) => {
        this.logger.warn(`Could not connect to Redis initially: ${err.message}. Operating with in-memory fallback.`);
      });
    } catch (err: any) {
      this.logger.warn(`Redis initialization failed: ${err.message}. Using in-memory fallback store.`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {
        // ignore disconnect errors
      }
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  isRedisConnected(): boolean {
    return this.isConnected;
  }

  // --- String Key-Value Operations ---

  async get(key: string): Promise<string | null> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.get(key);
      } catch (err: any) {
        this.logger.warn(`Redis get error (${key}), falling back to memory: ${err.message}`);
      }
    }

    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err: any) {
        this.logger.warn(`Redis set error (${key}), falling back to memory: ${err.message}`);
      }
    }

    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryStore.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
      } catch (err: any) {
        this.logger.warn(`Redis del error (${key}): ${err.message}`);
      }
    }
    this.memoryStore.delete(key);
  }

  // --- Hash Operations (Ideal for OTP record: { hash, attempts, createdAt }) ---

  async hsetAll(key: string, data: Record<string, string>, ttlSeconds?: number): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.hset(key, data);
        if (ttlSeconds && ttlSeconds > 0) {
          await this.client.expire(key, ttlSeconds);
        }
        return;
      } catch (err: any) {
        this.logger.warn(`Redis hsetAll error (${key}), falling back to memory: ${err.message}`);
      }
    }

    const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryStore.set(key, { value: { ...data }, expiresAt });
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.hgetall(key);
      } catch (err: any) {
        this.logger.warn(`Redis hgetall error (${key}), falling back to memory: ${err.message}`);
      }
    }

    const item = this.memoryStore.get(key);
    if (!item) return {};
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return {};
    }
    return (item.value as Record<string, string>) || {};
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.hset(key, field, value);
        return;
      } catch (err: any) {
        this.logger.warn(`Redis hset error (${key}.${field}): ${err.message}`);
      }
    }

    const item = this.memoryStore.get(key);
    if (item && (!item.expiresAt || Date.now() <= item.expiresAt)) {
      const current = typeof item.value === 'object' ? item.value : {};
      current[field] = value;
      item.value = current;
    } else {
      this.memoryStore.set(key, { value: { [field]: value }, expiresAt: null });
    }
  }

  async hincrby(key: string, field: string, increment: number): Promise<number> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.hincrby(key, field, increment);
      } catch (err: any) {
        this.logger.warn(`Redis hincrby error (${key}.${field}): ${err.message}`);
      }
    }

    const item = this.memoryStore.get(key);
    let val = 0;
    if (item && (!item.expiresAt || Date.now() <= item.expiresAt)) {
      const current = typeof item.value === 'object' ? item.value : {};
      const currentNum = Number(current[field]) || 0;
      val = currentNum + increment;
      current[field] = String(val);
      item.value = current;
    } else {
      val = increment;
      this.memoryStore.set(key, { value: { [field]: String(val) }, expiresAt: null });
    }
    return val;
  }

  // --- Increment Counter (Ideal for Rate Limiting requests per hour) ---

  async incr(key: string, ttlSeconds?: number): Promise<number> {
    if (this.isConnected && this.client) {
      try {
        const val = await this.client.incr(key);
        if (val === 1 && ttlSeconds && ttlSeconds > 0) {
          await this.client.expire(key, ttlSeconds);
        }
        return val;
      } catch (err: any) {
        this.logger.warn(`Redis incr error (${key}), falling back to memory: ${err.message}`);
      }
    }

    const item = this.memoryStore.get(key);
    let count = 1;
    if (item && (!item.expiresAt || Date.now() <= item.expiresAt)) {
      count = Number(item.value) + 1;
      item.value = String(count);
    } else {
      const expiresAt = ttlSeconds && ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
      this.memoryStore.set(key, { value: String(count), expiresAt });
    }
    return count;
  }

  async ttl(key: string): Promise<number> {
    if (this.isConnected && this.client) {
      try {
        return await this.client.ttl(key);
      } catch (err: any) {
        this.logger.warn(`Redis ttl error (${key}): ${err.message}`);
      }
    }

    const item = this.memoryStore.get(key);
    if (!item) return -2;
    if (!item.expiresAt) return -1;
    const remainingMs = item.expiresAt - Date.now();
    if (remainingMs <= 0) {
      this.memoryStore.delete(key);
      return -2;
    }
    return Math.ceil(remainingMs / 1000);
  }
}

