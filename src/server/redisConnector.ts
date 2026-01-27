import type { RedisClientType } from 'redis';
import { createClient } from 'redis';

const REDIS_IP_ADDRESS = 'localhost';
const REDIS_PORT = 6379;
const REDIS_DATABASE_NUMBER = 7;
const REDIS_TEST_DATABASE_NUMBER = 6;

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

    public readonly close = async () => {
        return this.redisClient.quit();
    };
}

let RedisConnectorInstance: RedisConnector | null = null;

export const initializeRedis = (test: boolean) => {
    RedisConnectorInstance = new RedisConnector(
        REDIS_IP_ADDRESS,
        REDIS_PORT,
        test ? REDIS_TEST_DATABASE_NUMBER : REDIS_DATABASE_NUMBER,
    );
};

export const getRedis = async (): Promise<RedisClientType> => {
    if (RedisConnectorInstance === null) {
        initializeRedis(false);
    }
    return (RedisConnectorInstance as RedisConnector).getClient();
};

export const destroyRedis = async () => {
    if (RedisConnectorInstance === null) {
        return Promise.resolve();
    }
    return RedisConnectorInstance.close();
};
