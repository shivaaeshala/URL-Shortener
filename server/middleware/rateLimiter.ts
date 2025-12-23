import { Request, Response, NextFunction } from "express";
import redisClient from "../config/redis";

const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS = 10;

export async function rateLimiter(req: Request, res: Response, next: NextFunction) {
    try {
        const ip = req.headers['x-forward-for'] || req.socket.remoteAddress;
        
        if(!ip) return next();
    
        const key = `rate_limit:${ip}`;
        const reqCount = await redisClient.incr(key);
    
        if(reqCount === 1) {
            await redisClient.expire(key, WINDOW_SIZE_IN_SECONDS);
        }
    
        if(reqCount > MAX_REQUESTS) {
            res.status(429).json({
                error: "Too many requests",
                message: `You can only generate ${MAX_REQUESTS} requests per minute`
            });
            return;
        }
        next();
    }
    catch(err) {
        console.error("Rate limiter error", err);
        next();
    }
}