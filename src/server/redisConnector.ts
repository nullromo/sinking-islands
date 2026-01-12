import type { RedisClientType } from 'redis';
import { createClient } from 'redis';

class RedisConnector {
    private readonly redisClient: RedisClientType;

    public constructor(address: string, port: number, database: number) {
        this.redisClient = createClient({
            url: `redis://${address}:${port}/${database}`,
        });
        this.redisClient.on('error', (error) => {
            console.log('Redis client error:', error);
        });
    }

    private readonly connect = async () => {
        return this.redisClient.connect();
    };

    public readonly getClient = async () => {
        if (!this.redisClient.isOpen) {
            await this.connect();
        }
        return this.redisClient;
    };
}

const RedisConnectorInstance = new RedisConnector('localhost', 6379, 7);

export const getRedis = RedisConnectorInstance.getClient;
