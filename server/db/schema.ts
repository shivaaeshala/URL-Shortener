import dotenv from 'dotenv';
dotenv.config({quiet:true});

import { Pool } from 'pg';

const dbURL = process.env.DATABASE_URL;
if(!dbURL) {
    throw new Error("Database url not defined");
}

const pool = new Pool({
    connectionString: dbURL,
});

export async function createTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS urls (
        id BIGSERIAL PRIMARY KEY,
        long_url TEXT NOT NULL,
        short_code VARCHAR(10) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);
    `);
}