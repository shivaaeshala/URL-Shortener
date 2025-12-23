import redisClient from "../config/redis";
import { Pool } from "pg";

function getDatabaseUrl():string {
    const dbURL = process.env.DATABASE_URL;
    if(!dbURL) {
        throw new Error("Database url not defined");
    }
    return dbURL;
}
const pool = new Pool({
    connectionString: getDatabaseUrl(),
})


export async function clicksCount(code: String) {
    const CLICKS_PREFIX = 'clicks:';
    
    try {
        await redisClient.incr(`${CLICKS_PREFIX}${code}`);

        pool.query(
            'UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1',
            [code]
        ).catch(err => console.error("Analytics DB error", err));
    }
    catch(err) {
        console.error("Analytics error", err);
    }
}