import Redis from 'ioredis'; const redis = new Redis(); redis.set('key', '1', 'EX', 3600, 'NX');
