import dotenv from 'dotenv';
dotenv.config({quiet:true});

import express, {Request, Response} from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { encode } from './utils/base62';
import redisClient from './config/redis';
import { error } from 'node:console';

const app = express();

app.use(express.json());
app.use(cors());

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

interface ShortenRequestBody {
    longUrl: string;
}

// This code uses redis to generate unique id
// Now we only need to do only one insertion to the database

const ID_COUNTER_KEY = 'global_url_id';
const URL_CACHE_PREFIX = 'url:';

app.post('/shorten', async (
    req: Request<{}, {}, ShortenRequestBody>,
    res: Response
    ) => {
        const {longUrl} = req.body;
        if(!longUrl) {
            return res.status(400).json({error: "URL is required"});
        }

        try {
            const id = await redisClient.incr(ID_COUNTER_KEY);

            const shortCode = encode(id);

            await pool.query(
                'INSERT INTO urls (id, long_url, short_code) VALUES ($1, $2, $3)',
                [id, longUrl, shortCode]
            );

            await redisClient.set(`${URL_CACHE_PREFIX}${shortCode}`, longUrl);

            res.json({shortUrl: `http://localhost:5000/${shortCode}`});
        }
        catch(error) {
            console.error(error);
            res.status(500).json({error: "Server error"});
        }
});

app.get('/:code', async (req: Request, res: Response) => {
    const {code} = req.params;
    const cacheKey = `${URL_CACHE_PREFIX}${code}`;

    try {
        const cachedUrl = await redisClient.get(cacheKey);
        if(cachedUrl) {
            console.log("Cache Hit");
            return res.redirect(302, cachedUrl);
        }

        console.log("Cache miss");

        const result = await pool.query(
            'SELECT long_url FROM urls WHERE short_code= $1',
            [code]
        );

        if(result.rows.length > 0) {
            const longUrl = result.rows[0].long_url;
            await redisClient.set(cacheKey, longUrl);
            return res.redirect(302, longUrl);
        }
        else {
            return res.status(404).json({error: "URL not found"});
        }
    }
    catch(error) {
        console.error(error);
        return res.status(500).json({error:"Server error"});
    }
})


// If server craches after insertion(i.e., after inserting long_url), then the value of 'id' will be null
// Then the update query inserts the null value into the db.
// This leads to loss of database integrity and redirect fails
// To avoid this we have to introduce atomicity to our db queries
// We do that by wraping queries in a database transaction
// It starts with 'BEGIN' and ends with comminting the changes using 'COMMIT' command

// This code uses database transaction
// app.post("/shorten", async (
//     req: Request<{}, {}, ShortenRequestBody>,
//     res: Response
//     ) => {
//     const client = await pool.connect();

//     const {longUrl} = req.body;
//     if(!longUrl) {
//         return res.status(400).json({error: "URL is required"});
//     }

//     await client.query('BEGIN');
//     try {
//         const result = await client.query(
//             'INSERT INTO urls(long_url) VALUES($1) RETURNING id',
//             [longUrl]
//         );

//         const id = result.rows[0].id;

//         const shortCode = encode(id);
//         await client.query(
//             'UPDATE urls SET short_code = $1 WHERE id = $2',
//             [shortCode, id]
//         );

//         await client.query('COMMIT');
//         return res.status(200).json({shortUrl: `http://localhost:5000/${shortCode}`});
//     }
//     catch(error) {
//         await client.query('ROOLBACK');
//         return res.status(500).json({error: `Server Error, ${error}`});
//     }
//     finally{
//         client.release();
//     }
// });


// app.get('/:code', async(
//     req: Request<{code: string}>,
//     res: Response
//     ) => {
//     const {code} = req.params;

//     try {
//         const result = await pool.query(
//             'SELECT long_url FROM urls WHERE short_code = $1',
//             [code]
//         );
        
//         if(result.rows.length > 0) {
//             return res.redirect(302, result.rows[0].long_url);
//         }
//         return res.status(404).json({error: "URL not foud"});
//     }
//     catch(error) {
//         return res.status(500).json({error: "Server error"});
//     }
// })

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});