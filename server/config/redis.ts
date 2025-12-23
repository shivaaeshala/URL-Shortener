import dotenv from 'dotenv';
dotenv.config({quiet:true});

import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
if(!redisUrl) {
    throw new Error("Redis url not defined");
}

const redisClient = createClient({
    url: redisUrl,
});

redisClient.on('error', (err) => {console.log('Redis Client Error', err)});

(async () => {
    await redisClient.connect();
    console.log("Connected to redis");
})();

export default redisClient;